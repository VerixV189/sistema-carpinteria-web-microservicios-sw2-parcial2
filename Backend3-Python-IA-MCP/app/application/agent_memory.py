"""Memoria de conversación del agente (A3).

In-memory con TTL — suficiente para una réplica local. Si el servicio
escala a >1 réplica, mover a Redis sin cambiar la interfaz.
"""
import time

_TTL_S = 30 * 60
_MAX_TURNS = 10
_sessions: dict[str, dict] = {}


def get_context(session_id: str | None) -> dict:
    """Devuelve {last_intent, last_order_id, last_date} o {} si expiró."""
    if not session_id:
        return {}
    s = _sessions.get(session_id)
    if not s or time.time() - s["ts"] > _TTL_S:
        _sessions.pop(session_id, None)
        return {}
    return s["ctx"]


def remember(session_id: str | None, *, intent: str,
             order_id: int | None = None, date: str | None = None) -> None:
    if not session_id:
        return
    s = _sessions.setdefault(session_id, {"ctx": {}, "ts": 0.0})
    s["ts"] = time.time()
    ctx = s["ctx"]
    ctx["last_intent"] = intent
    if order_id is not None:
        ctx["last_order_id"] = order_id
    if date is not None:
        ctx["last_date"] = date
    turns = ctx.setdefault("turns", [])
    turns.append(intent)
    del turns[:-_MAX_TURNS]
