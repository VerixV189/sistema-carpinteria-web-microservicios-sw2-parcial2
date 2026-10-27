"""CU4/CU7 — Agente inteligente conectado a la BD vía business-service.

No es solo un chatbot: interpreta texto libre en español, decide qué
herramienta MCP/mutación GraphQL usar y EJECUTA acciones reales:

- Consulta de entrega  → "¿Qué día se entrega el pedido #15?"
- Capacidad            → "¿Hay cupo para el 2026-11-05?"
- Agendar una entrega  → "Agenda el pedido 3 para el 2026-11-06"
  (sin fecha → agenda en el primer día con cupo)
- Asignación dinámica  → "Agenda los pedidos pendientes" (ciclo
                         observar→planear→actuar, batched + paralelo)
- Multi-paso           → "Revisa cupo del 2026-11-20 y si hay agenda el 5"
- Listado de pedidos   → "Muéstrame los pedidos en producción"
- Cotización (CU3)     → "Cotiza un ropero de cedro"
- Inventario           → "¿Hay stock de cedro?" / "stock bajo"
- Reporte NLP (CU7)    → "Muéstrame las ganancias de esta semana"
- Memoria              → session_id reutiliza el último pedido/fecha
                         ("¿y el 4?")

Pipeline: guardarraíl → plan LLM (Ollama) → fallback regex → ejecutor de
pasos → memoria.
"""
import asyncio
import logging
import re
from datetime import date, timedelta

from app.application.agent_llm import plan_with_llm
from app.application.agent_memory import get_context, remember
from app.application.check_delivery import check_delivery_date
from app.application.estimate_furniture import estimate_furniture
from app.application.generate_report import generate_report
from app.infrastructure.external.business_client import business_client
from app.mcp.tools.tools_impl import search_inventory

log = logging.getLogger("agent")

_ORDER_RE = re.compile(r"(?:pedido|order|#)\s*#?\s*(\d+)", re.I)
_BARE_NUM_RE = re.compile(r"\b(\d+)\b")
_DATE_RE = re.compile(r"(\d{4}-\d{2}-\d{2})")
_REL_DATES = {"hoy": 0, "mañana": 1, "pasado mañana": 2}
_MAX_LOOKAHEAD_DAYS = 21
_SCHEDULABLE = ("APPROVED", "IN_PRODUCTION", "READY")
_STATUS_MAP = {
    "pendiente": "PENDING", "aprobado": "APPROVED", "produccion": "IN_PRODUCTION",
    "producción": "IN_PRODUCTION", "listo": "READY", "entregado": "DELIVERED",
    "cancelado": "CANCELLED",
}
_DESTRUCTIVE = ("cancela", "cancelar", "elimina", "eliminar", "borra", "borrar",
                "modifica", "modificar")

# Matriz de herramientas por rol. ADMIN e internos (n8n, sin rol) acceden
# a todo; CLIENT solo lectura scopiada a sus datos; CARPENTER a operación
# de taller (pedidos, entregas, inventario) sin reportes administrativos.
_CLIENT_TOOLS = {"estimate", "check_delivery_date", "list_orders", "delivery_lookup"}
_CARPENTER_TOOLS = _CLIENT_TOOLS | {"schedule_delivery", "auto_schedule", "inventory"}
_ROLE_TOOLS = {"CLIENT": _CLIENT_TOOLS, "CARPENTER": _CARPENTER_TOOLS}
_ROLE_DENY_MSG = {
    "CLIENT": "Como cliente puedo ayudarte a cotizar muebles, ver el estado "
              "y entrega de tus pedidos y consultar disponibilidad de fechas.",
    "CARPENTER": "En el taller puedo ayudarte con pedidos, entregas, "
                 "agendamiento e inventario. Los reportes administrativos "
                 "los genera el administrador.",
}


def _client_id_for(email: str | None) -> int | None:
    """email → clients.id (GraphQL), para scoping de CLIENT."""
    if not email:
        return None
    res = business_client.graphql("{ clients { id email } }")
    for c in ((res or {}).get("data") or {}).get("clients", []):
        if (c.get("email") or "").lower() == email.lower():
            try:
                return int(c["id"])
            except (TypeError, ValueError):
                return None
    return None


def _extract_date(text: str) -> str | None:
    m = _DATE_RE.search(text)
    if m:
        return m.group(1)
    for word, delta in _REL_DATES.items():
        if word in text:
            return (date.today() + timedelta(days=delta)).isoformat()
    return None


def _extract_order(text: str, ctx: dict | None = None) -> int | None:
    m = _ORDER_RE.search(text)
    if m:
        return int(m.group(1))
    # con contexto: "¿y el 4?" → número suelto + último intent
    if ctx and ctx.get("last_intent"):
        m = _BARE_NUM_RE.search(text)
        if m:
            return int(m.group(1))
        if ctx.get("last_order_id") and any(
                w in text for w in ("ese", "eso", "este", "mismo", "el pedido")):
            return ctx["last_order_id"]
    return None


# ------------------------------------------------------------------
# Ejecutor de pasos — cada uno devuelve {answer, tool, data}
# ------------------------------------------------------------------

def _capacities_parallel() -> dict[str, int]:
    """Capacidad restante por día para los próximos N días — UNA fan-out
    paralela en vez de N llamadas secuenciales."""
    days = [(date.today() + timedelta(d)).isoformat()
            for d in range(_MAX_LOOKAHEAD_DAYS)]
    caps = asyncio.run(business_client.capacities(days))
    return {d: c.get("available", 0) for d, c in caps.items() if c}


def _first_day_with_capacity(remaining: dict[str, int] | None = None) -> str | None:
    rem = remaining if remaining is not None else _capacities_parallel()
    for d in sorted(rem):
        if rem[d] > 0:
            return d
    return None


def _auto_schedule() -> dict:
    """Asignación dinámica: agenda todas las órdenes agendables sin entrega.

    Ciclo agente optimizado: observa (1 query pedidos + 1 query entregas)
    → planea (capacidad de 21 días en paralelo, decremento local de cupos)
    → actúa (scheduleDelivery por orden).
    """
    orders = [o for o in business_client.list_orders()
              if o.get("status") in _SCHEDULABLE]
    deliveries = business_client.deliveries_by_order()
    pending = [o for o in orders if int(o["id"]) not in deliveries]
    if not pending:
        return {"answer": "No hay pedidos pendientes de agendar.",
                "tool": "auto_schedule", "data": None}

    remaining = _capacities_parallel()
    scheduled: list[str] = []
    skipped: list[str] = []
    for o in pending:
        oid = int(o["id"])
        day = _first_day_with_capacity(remaining)
        if not day:
            skipped.append(f"#{oid} (sin cupo en {_MAX_LOOKAHEAD_DAYS} días)")
            continue
        res = business_client.schedule_delivery(oid, day)
        if res and not res.get("error"):
            remaining[day] -= 1
            scheduled.append(f"#{oid} → {day}")
        else:
            skipped.append(f"#{oid} ({(res or {}).get('error', 'error')})")
    parts = []
    if scheduled:
        parts.append("Agendé " + ", ".join(scheduled))
    if skipped:
        parts.append("No pude agendar " + ", ".join(skipped))
    return {"answer": ". ".join(parts) + ".", "tool": "auto_schedule",
            "data": {"scheduled": scheduled, "skipped": skipped}}


def _list_orders(lower: str, client_id: int | None = None) -> dict:
    status = next((v for k, v in _STATUS_MAP.items() if k in lower), None)
    orders = business_client.list_orders(status)
    if client_id is not None:
        orders = [o for o in (orders or []) if o.get("clientId") == client_id]
    if not orders:
        label = f" en estado {status}" if status else ""
        who = "tuyos" if client_id is not None else ""
        return {"answer": f"No hay pedidos {who}{label}.".replace("  ", " "),
                "tool": "list_orders", "data": []}
    lines = [f"#{o['id']} · {o.get('description', '?')} · {o.get('status')}"
             for o in orders[:10]]
    suffix = f" (y {len(orders) - 10} más)" if len(orders) > 10 else ""
    return {"answer": f"{len(orders)} pedido(s){suffix}:\n" + "\n".join(lines),
            "tool": "list_orders", "data": orders}


_WORKSHOP_ADDRESS = "Av. Banzer Km 6, Santa Cruz de la Sierra"

_DAYS_ES = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"]
_MONTHS_ES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio",
              "agosto", "septiembre", "octubre", "noviembre", "diciembre"]
_SLOTS_ES = {"MORNING": "por la mañana", "AFTERNOON": "por la tarde",
             "EVENING": "por la noche"}
_DELIVERY_STATUS_ES = {"SCHEDULED": "programada", "IN_TRANSIT": "en camino",
                       "DELIVERED": "entregada", "FAILED": "fallida",
                       "RESCHEDULED": "reprogramada"}


def _fmt_date(iso: str | None) -> str:
    """'2026-10-31' → 'viernes 31 de octubre'."""
    if not iso:
        return "sin fecha"
    try:
        d = date.fromisoformat(str(iso)[:10])
        return f"{_DAYS_ES[d.weekday()]} {d.day} de {_MONTHS_ES[d.month - 1]}"
    except ValueError:
        return str(iso)


def _slot_es(slot: str | None) -> str:
    return _SLOTS_ES.get(str(slot or "").upper(), str(slot or "").lower())


def _where_to_deliver(delivery: dict | None, order: dict | None) -> str:
    """Texto con la ubicación de entrega: dirección + link de Google Maps
    si hay coordenadas GPS, o aviso de recojo en el taller."""
    dtype = (delivery or {}).get("deliveryType") or (order or {}).get("deliveryType")
    if dtype == "PICKUP":
        return f" El cliente recoge en el taller ({_WORKSHOP_ADDRESS})."
    parts: list[str] = []
    addr = (delivery or {}).get("address") or (order or {}).get("deliveryAddress")
    lat = (delivery or {}).get("latitude") or (order or {}).get("deliveryLat")
    lng = (delivery or {}).get("longitude") or (order or {}).get("deliveryLng")
    if addr:
        parts.append(f"Llevar a: {addr}.")
    if lat and lng:
        parts.append(f"Ubicación GPS: https://www.google.com/maps?q={lat},{lng}")
    if not parts:
        parts.append("Dirección aún no registrada — confirma con el cliente.")
    return " " + " ".join(parts)


def _step_delivery_next(client_id: int | None = None) -> dict:
    """Próxima entrega sin número de pedido: '¿a dónde entrego?' del carpintero
    o '¿cuándo llega?' del cliente (scopiado a sus pedidos)."""
    deliveries = business_client.deliveries_by_order()
    if not deliveries:
        return {"answer": "No hay entregas programadas todavía.",
                "tool": "delivery_lookup", "data": None}
    if client_id is not None:
        own = {int(o["id"]) for o in business_client.list_orders()
               if o.get("clientId") == client_id}
        deliveries = {k: v for k, v in deliveries.items() if k in own}
    pending = [d for d in deliveries.values() if d.get("status") not in ("DELIVERED", "FAILED")]
    if not pending:
        # Sin entregas agendadas: guiar con el pedido más próximo que ya tenga
        # destino elegido por el cliente (recojo o GPS).
        ready = [o for o in business_client.list_orders()
                 if o.get("status") in ("IN_PRODUCTION", "READY")
                 and (o.get("deliveryAddress") or o.get("deliveryLat")
                      or o.get("deliveryType") == "PICKUP")]
        if client_id is not None:
            ready = [o for o in ready if o.get("clientId") == client_id]
        if ready:
            o = min(ready, key=lambda x: x.get("deliveryDate") or "9999")
            return {"answer": f"Aún no hay entrega agendada, pero el pedido "
                              f"#{o['id']} ya tiene destino definido."
                              + _where_to_deliver(None, o),
                    "tool": "delivery_lookup",
                    "data": {"delivery": None, "order": o}}
        return {"answer": "No hay entregas pendientes.",
                "tool": "delivery_lookup", "data": None}
    # La que sigue: la más próxima a futuro; si todas ya pasaron, la más reciente.
    today = date.today().isoformat()
    upcoming = [d for d in pending if (d.get("scheduledDate") or "9999") >= today]
    nxt = (min(upcoming, key=lambda d: d.get("scheduledDate") or "9999") if upcoming
           else max(pending, key=lambda d: d.get("scheduledDate") or ""))
    oid = int(nxt.get("orderId") or 0)
    order = business_client.get_order(oid) if oid else None
    answer = (f"La próxima entrega es del pedido #{oid}, el "
              f"{_fmt_date(nxt.get('scheduledDate'))} {_slot_es(nxt.get('timeSlot'))}."
              + _where_to_deliver(nxt, order))
    return {"answer": answer, "tool": "delivery_lookup",
            "data": {"delivery": nxt, "order": order}}


def _step_delivery_lookup(order_id: int, client_id: int | None = None) -> dict:
    delivery = business_client.delivery_by_order(order_id)
    order = business_client.get_order(order_id)
    # CLIENT: solo su pedido — si no se puede verificar, no se muestra nada.
    if client_id is not None and (order is None
                                  or order.get("clientId") != client_id):
        return {"answer": f"El pedido #{order_id} no está registrado a tu nombre.",
                "tool": "delivery_lookup", "data": None}
    if delivery:
        answer = (f"El pedido #{order_id} se entrega el "
                  f"{_fmt_date(delivery.get('scheduledDate'))} "
                  f"{_slot_es(delivery.get('timeSlot'))} "
                  f"(estado: {_DELIVERY_STATUS_ES.get(delivery.get('status'), delivery.get('status'))})."
                  + _where_to_deliver(delivery, order))
    elif order:
        dd = order.get("deliveryDate")
        answer = (f"El pedido #{order_id} tiene fecha de entrega {_fmt_date(dd)}."
                  if dd else f"El pedido #{order_id} aún no tiene entrega agendada "
                             f"(estado {order.get('status')}).")
        answer += _where_to_deliver(None, order)
    else:
        answer = f"No encontré el pedido #{order_id}."
    return {"answer": answer, "tool": "delivery_lookup",
            "data": {"delivery": delivery, "order": order}}


def _step_check_capacity(date_str: str) -> dict:
    cap = check_delivery_date(date_str)
    return {"answer": cap["message"], "tool": "check_delivery_date", "data": cap}


def _step_schedule(order_id: int, date_str: str | None,
                   remaining: dict[str, int] | None = None) -> dict:
    existing = business_client.delivery_by_order(order_id)
    if existing:
        return {"answer": f"El pedido #{order_id} ya tiene entrega agendada "
                          f"para el {existing['scheduledDate']} en turno "
                          f"{existing['timeSlot']} (estado {existing['status']}).",
                "tool": "scheduleDelivery", "data": existing}
    target = date_str or _first_day_with_capacity(remaining)
    if not target:
        return {"answer": f"No encontré cupo de entrega en los próximos "
                          f"{_MAX_LOOKAHEAD_DAYS} días.",
                "tool": "scheduleDelivery", "data": None}
    result = business_client.schedule_delivery(order_id, target)
    if result is None:
        return {"answer": "No pude contactar al servicio de pedidos para agendar.",
                "tool": "scheduleDelivery", "data": None}
    if result.get("error"):
        return {"answer": f"No se pudo agendar: {result['error']}",
                "tool": "scheduleDelivery", "data": result}
    extra = "" if date_str else " (primer día con cupo)"
    return {"answer": f"Pedido #{order_id} agendado para el "
                      f"{result['scheduledDate']}{extra} (estado {result['status']}).",
            "tool": "scheduleDelivery", "data": result}


def _step_estimate(text: str) -> dict:
    est = estimate_furniture(description=text)
    return {"answer": f"Estimación: {est.furniture_type.value} ~"
                      f"{est.estimated_price:,.0f} {est.currency} "
                      f"(confianza {est.confidence:.0%}).",
            "tool": "estimate_furniture_cost",
            "data": {"furnitureType": est.furniture_type.value,
                     "estimatedPrice": est.estimated_price,
                     "confidence": est.confidence, "factors": est.factors}}


_WOOD_TYPES = ("mara", "cedro", "roble", "pino", "melamina", "caoba",
               "nogal", "tajibo")
_INV_STOP = r"(inventario|stock|materiales?|de|del|la|el|los|las|hay|bajo|s|" \
            r"cu[aá]nt[oa]s?|queda[nr]?|madera|tiene[n]?|disponible|qu[eé]|" \
            r"en|para|con|un[oa]?|es|se|me|te|dime|cuenta|revisa|ver|mucho)"


def _step_inventory(text: str) -> dict:
    t = text.lower()
    term = next((w for w in _WOOD_TYPES if w in t), None)
    if term is None:
        term = re.sub(_INV_STOP, " ", t)
        term = re.sub(r"[^\w\s]", " ", term)
        term = re.sub(r"\s+", " ", term).strip() or " "
    res = search_inventory(term)
    if not res["results"]:
        return {"answer": f"No encontré materiales para «{term}».",
                "tool": "search_inventory", "data": res}
    lines = [f"{r['name']} ({r['wood_type']}): {r['stock_m3']} m³"
             for r in res["results"]]
    low = f" — alerta: {len(res['lowStock'])} bajo mínimo" if res["lowStock"] else ""
    return {"answer": "Inventario:\n" + "\n".join(lines) + low,
            "tool": "search_inventory", "data": res}


def _step_report(text: str) -> dict:
    rep = generate_report(text)
    return {"answer": rep.narrative, "tool": "generate_report",
            "data": {"sql": rep.sql, "rows": rep.rows, "source": rep.source}}


def _exec_step(step: dict, ctx: dict) -> dict:
    """Ejecuta un paso del plan (LLM o regex)."""
    tool = step.get("tool")
    order_id = step.get("order_id") or ctx.get("order_id")
    date_str = step.get("date") or ctx.get("date")
    text = step.get("text") or ctx.get("query", "")
    client_id = ctx.get("client_id")  # scoping CLIENT (None = interno/admin)
    if tool == "delivery_lookup" and order_id:
        return _step_delivery_lookup(int(order_id), client_id)
    if tool == "delivery_lookup":
        return _step_delivery_next(client_id)
    if tool == "check_delivery_date" and date_str:
        return _step_check_capacity(date_str)
    if tool == "schedule_delivery" and order_id:
        return _step_schedule(int(order_id), date_str)
    if tool == "auto_schedule":
        return _auto_schedule()
    if tool == "list_orders":
        return _list_orders((step.get("status") or text).lower(), client_id)
    if tool == "estimate":
        return _step_estimate(text)
    if tool == "inventory":
        return _step_inventory(text)
    return _step_report(text)


# ------------------------------------------------------------------
# Router heurístico (fallback cuando Ollama no está) → lista de pasos
# ------------------------------------------------------------------

def _regex_plan(lower: str, ctx: dict) -> list[dict]:
    order_id = _extract_order(lower, ctx)
    date_str = _extract_date(lower)

    wants_schedule = any(w in lower for w in ("agenda", "agendar", "asigna", "asignar",
                                              "programa", "programar"))
    wants_capacity = any(w in lower for w in ("capacidad", "cupo", "disponible",
                                              "disponibilidad", "se puede entregar",
                                              "hay lugar"))
    wants_delivery = any(w in lower for w in ("entrega", "entregar", "delivery", "llega",
                                              "dónde entrego", "donde entrego",
                                              "a dónde llevo", "a donde llevo",
                                              "dirección", "direccion", "ubicación",
                                              "ubicacion", "llevar", "dejo el"))
    wants_quote = any(w in lower for w in ("cotiza", "cotización", "cuánto cuesta",
                                           "cuanto cuesta", "precio de", "presupuesto"))
    wants_inventory = any(w in lower for w in ("inventario", "stock", "materiales",
                                               "madera"))
    wants_list = any(w in lower for w in ("lista", "listar", "qué pedidos",
                                          "que pedidos", "pedidos pendientes",
                                          "pedidos en", "pedidos listos",
                                          "pedidos entregados", "pedidos aprobados",
                                          "muéstrame los pedidos",
                                          "muestrame los pedidos"))
    wants_report = any(w in lower for w in ("reporte", "informe", "resumen de",
                                            "resumen del", "resumen ejecutivo",
                                            "análisis", "analisis", "métricas",
                                            "metricas", "estadística",
                                            "estadistica", "kpi", "dashboard"))
    wants_autosched = (wants_schedule and not order_id) or \
        any(w in lower for w in ("asignación dinámica", "asignacion dinamica",
                                 "agenda automatica", "agenda automática",
                                 "autoagenda", "agenda los pendientes"))

    steps: list[dict] = []
    # multi-paso regex: "¿hay cupo el FECHA? ... y agenda el pedido N"
    if wants_capacity and wants_schedule and order_id:
        if date_str:
            steps.append({"tool": "check_delivery_date", "date": date_str})
        steps.append({"tool": "schedule_delivery", "order_id": order_id,
                      "date": date_str})
    elif wants_autosched:
        steps.append({"tool": "auto_schedule"})
    elif wants_schedule and order_id:
        steps.append({"tool": "schedule_delivery", "order_id": order_id,
                      "date": date_str})
    elif (wants_capacity or (wants_delivery and date_str and not order_id)) \
            and date_str:
        steps.append({"tool": "check_delivery_date", "date": date_str})
    elif wants_quote and not order_id:
        steps.append({"tool": "estimate", "text": lower})
    elif wants_inventory:
        steps.append({"tool": "inventory", "text": lower})
    elif wants_delivery and order_id:
        steps.append({"tool": "delivery_lookup", "order_id": order_id})
    elif wants_delivery:
        # "¿A dónde entrego?" / "¿cuándo llega mi pedido?" sin número
        steps.append({"tool": "delivery_lookup"})
    elif wants_report and order_id is None:
        steps.append({"tool": "report", "text": lower})
    elif wants_list or (order_id is None and "pedido" in lower):
        steps.append({"tool": "list_orders",
                      "status": next((v for k, v in _STATUS_MAP.items()
                                      if k in lower), None)})
    elif ctx.get("last_intent") == "delivery_lookup" and order_id:
        steps.append({"tool": "delivery_lookup", "order_id": order_id})
    else:
        steps.append({"tool": "report", "text": lower})
    return steps


def agent_answer(query: str, session_id: str | None = None,
                 role: str | None = None, user_email: str | None = None) -> dict:
    """Procesa una consulta del asistente → {answer, tool, data}.

    `session_id` habilita memoria: referencias al pedido/fecha anterior.
    `role`/`user_email` vienen del gateway (x-user-* tras validar JWT):
    CLIENT queda restringido a sus propios pedidos y herramientas de lectura.
    """
    q = query.strip()
    lower = q.lower()
    ctx = dict(get_context(session_id))
    ctx["query"] = q
    ctx["role"] = role
    if role == "CLIENT":
        # Fail-closed: email sin ficha de cliente → -1 (no coincide con nada);
        # None significaría "sin scoping" y mostraría datos ajenos.
        ctx["client_id"] = _client_id_for(user_email) or -1
    else:
        ctx["client_id"] = None

    # — Guardarraíl: acciones destructivas requieren confirmación humana —
    if any(w in lower for w in _DESTRUCTIVE):
        return {"answer": "Esa acción modifica o elimina datos. Por seguridad "
                          "no la ejecuto por chat — hazlo desde la app de "
                          "administración o confirma con un administrador.",
                "tool": "guardrail", "data": None}

    # — Plan: LLM (Ollama) si está disponible, si no regex —
    steps = plan_with_llm(q, ctx)
    source = "llm"
    if steps is None:
        steps = _regex_plan(lower, ctx)
        source = "heuristic"
    if not steps:
        return {"answer": "No entendí la solicitud. Puedo consultar entregas, "
                          "agendar, verificar cupo, cotizar, revisar inventario "
                          "o generar reportes.", "tool": "none", "data": None}

    # — Filtro por rol: cada superficie solo sus herramientas —
    allowed = _ROLE_TOOLS.get(role or "")
    if allowed is not None:
        steps = [s for s in steps if s.get("tool") in allowed]
        if not steps:
            return {"answer": _ROLE_DENY_MSG.get(role, "No puedo hacer eso."),
                    "tool": "role_guard", "data": None}

    # — Ejecutor de pasos en orden —
    results = [_exec_step(s, ctx) for s in steps]
    tools = [r["tool"] for r in results]
    answer = "\n".join(r["answer"] for r in results)

    last = results[-1]
    order_id = next((s.get("order_id") for s in reversed(steps)
                     if s.get("order_id")), _extract_order(lower, ctx))
    date_str = next((s.get("date") for s in reversed(steps)
                     if s.get("date")), _extract_date(lower))
    remember(session_id, intent=last["tool"], order_id=order_id, date=date_str)

    return {"answer": answer, "tool": "+".join(tools),
            "data": last.get("data"), "source": source,
            "steps": len(results)}
