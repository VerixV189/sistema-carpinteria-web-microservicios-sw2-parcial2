"""Adaptador OUT — cliente REST/GraphQL del business-service (Spring Boot).

Sync: usado desde endpoints `def` de FastAPI (corren en threadpool).
Async: para procesos que fan-out (p.ej. auto_schedule — 21 capacidades
en paralelo en vez de secuenciales).
"""
import asyncio
import logging
import time

import httpx

from app.infrastructure.config.settings import settings

log = logging.getLogger("business-client")

_RETRIES = 2          # intentos extra tras el primero
_BACKOFF_S = 0.4      # backoff lineal entre reintentos


def _auth() -> dict:
    """Header de malla: business-service exige identidad desde el hardening."""
    return {"x-internal-secret": settings.internal_secret}


def _retry(fn, *args, **kwargs):
    """Reintenta ante errores de conexión/timeout (no ante 4xx/5xx)."""
    for attempt in range(1 + _RETRIES):
        try:
            return fn(*args, **kwargs)
        except (httpx.ConnectError, httpx.TimeoutException) as e:
            if attempt == _RETRIES:
                raise
            log.warning("reintentando (%s/%s) tras %s", attempt + 1, _RETRIES, e)
            time.sleep(_BACKOFF_S * (attempt + 1))


class BusinessClient:
    def __init__(self) -> None:
        self.base = settings.business_service_url.rstrip("/")

    # ---------------- sync ----------------
    def delivery_capacity(self, date: str) -> dict | None:
        try:
            r = _retry(httpx.get, f"{self.base}/api/internal/delivery/capacity",
                       params={"date": date}, headers=_auth(), timeout=10)
            r.raise_for_status()
            return r.json()
        except Exception as e:
            log.warning("delivery/capacity falló: %s", e)
            return None

    def list_orders(self, status: str | None = None) -> list[dict]:
        try:
            params = {"status": status} if status else {}
            r = _retry(httpx.get, f"{self.base}/api/internal/orders",
                       params=params, headers=_auth(), timeout=10)
            r.raise_for_status()
            return r.json()
        except Exception as e:
            log.warning("orders falló: %s", e)
            return []

    def get_order(self, order_id: int) -> dict | None:
        try:
            r = _retry(httpx.get, f"{self.base}/api/internal/orders/{order_id}",
                       headers=_auth(), timeout=10)
            if r.status_code == 404:
                return None
            r.raise_for_status()
            return r.json()
        except Exception as e:
            log.warning("orders/%s falló: %s", order_id, e)
            return None

    def graphql(self, query: str, variables: dict | None = None) -> dict | None:
        try:
            r = _retry(httpx.post, f"{self.base}/graphql",
                       json={"query": query, "variables": variables or {}},
                       headers=_auth(), timeout=10)
            r.raise_for_status()
            return r.json()
        except Exception as e:
            log.warning("graphql falló: %s", e)
            return None

    def delivery_by_order(self, order_id: int) -> dict | None:
        res = self.graphql(
            "query($id: ID!) { delivery(orderId: $id) { id scheduledDate timeSlot status address notes deliveryType latitude longitude } }",
            {"id": str(order_id)})
        if not res or res.get("errors"):
            return None
        return (res.get("data") or {}).get("delivery")

    def deliveries_by_order(self) -> dict[int, dict]:
        """Mapa order_id → delivery en UNA query (evita N llamadas)."""
        res = self.graphql(
            "query { deliveries { id orderId scheduledDate timeSlot status address deliveryType latitude longitude } }")
        if not res or res.get("errors"):
            return {}
        out = {}
        for d in (res.get("data") or {}).get("deliveries") or []:
            try:
                out[int(d["orderId"])] = d
            except (KeyError, TypeError, ValueError):
                continue
        return out

    def schedule_delivery(self, order_id: int, date: str,
                          time_slot: str = "MORNING") -> dict | None:
        res = self.graphql(
            "mutation($input: ScheduleDeliveryInput!) { scheduleDelivery(input: $input) { id scheduledDate status } }",
            {"input": {"orderId": str(order_id), "scheduledDate": date, "timeSlot": time_slot}})
        if not res:
            return None
        if res.get("errors"):
            return {"error": res["errors"][0].get("message", "Error GraphQL")}
        return (res.get("data") or {}).get("scheduleDelivery")

    # ---------------- async (fan-out) ----------------
    async def adelivery_capacity(self, client: httpx.AsyncClient, date: str) -> tuple[str, dict | None]:
        try:
            r = await client.get(f"{self.base}/api/internal/delivery/capacity",
                                 params={"date": date}, headers=_auth())
            r.raise_for_status()
            return date, r.json()
        except Exception as e:
            log.warning("async delivery/capacity %s falló: %s", date, e)
            return date, None

    async def capacities(self, days: list[str]) -> dict[str, dict]:
        """Capacidades de varios días EN PARALELO."""
        async with httpx.AsyncClient(timeout=10) as client:
            results = await asyncio.gather(
                *(self.adelivery_capacity(client, d) for d in days))
        return {d: c for d, c in results if c is not None}


business_client = BusinessClient()
