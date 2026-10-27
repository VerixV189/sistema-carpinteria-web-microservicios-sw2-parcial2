"""Router de intents del agente vía LLM (A1/A2).

Ollama clasifica la consulta y devuelve un PLAN JSON — lista de pasos
{tool, order_id, date, ...} que el ejecutor corre en orden. Si Ollama no
responde o devuelve algo inválido, devuelve None y el agente cae al
router heurístico (regex).
"""
import json
import logging
import re

from app.infrastructure.llm.provider import llm

log = logging.getLogger("agent-llm")

_TOOLS = (
    "delivery_lookup (fecha de entrega de un pedido; order_id), "
    "check_delivery_date (cupo en una fecha; date), "
    "schedule_delivery (agendar pedido; order_id, date opcional), "
    "auto_schedule (agendar TODOS los pendientes), "
    "list_orders (listar pedidos; status opcional), "
    "estimate (cotizar mueble; text), "
    "inventory (stock/materiales; text), "
    "report (pregunta general de negocio; text)"
)

_SYSTEM = (
    "Eres el planificador de un agente de carpintería. Devuelve SOLO JSON "
    '{"steps":[{"tool":...,"order_id":n|null,"date":"YYYY-MM-DD"|null,'
    '"text":"..."|null,"status":"..."|null}]}. Herramientas: ' + _TOOLS + ". "
    "Fechas relativas conviértelas a YYYY-MM-DD. Si piden varias acciones, "
    "varios pasos en orden. Si es conversación trivial, steps vacío."
)

_JSON_RE = re.compile(r"\{.*\}", re.S)
_VALID = {"delivery_lookup", "check_delivery_date", "schedule_delivery",
          "auto_schedule", "list_orders", "estimate", "inventory", "report"}


def plan_with_llm(query: str, context: dict | None = None) -> list[dict] | None:
    """Devuelve lista de pasos {tool, order_id, date, text, status} o None."""
    ollama = llm()
    if not ollama.is_available():
        return None
    ctx = ""
    if context and context.get("last_order_id"):
        ctx = (f"\nContexto: último pedido mencionado=#{context['last_order_id']}"
               f", último intent={context.get('last_intent')}")
    raw = ollama.generate(f"Consulta: {query}{ctx}\n\nJSON:", system=_SYSTEM)
    if not raw:
        return None
    m = _JSON_RE.search(raw)
    if not m:
        return None
    try:
        steps = json.loads(m.group(0)).get("steps")
    except (json.JSONDecodeError, AttributeError):
        return None
    if not isinstance(steps, list):
        return None
    return [s for s in steps if isinstance(s, dict) and s.get("tool") in _VALID]
