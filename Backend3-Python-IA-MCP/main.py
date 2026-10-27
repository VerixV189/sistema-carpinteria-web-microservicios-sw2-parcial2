"""ai-service — IA & MCP (FastAPI REST :8100 + MCP server SSE :8110).

CU3: clasificación de mueble + predicción de precio
CU4: check_delivery_date (consulta business-service)
CU7: reportes en lenguaje natural (Text-to-SQL + narrativa LLM)
CU1: clustering de clientes (X-Means ≈ KMeans con k estimado)
"""
import logging
import threading

import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.infrastructure.config.settings import settings
from app.adapters.rest import ai_router

log = logging.getLogger("ai-service")

app = FastAPI(title="Carpintería AI Service", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(ai_router.router)

# Cierra el bypass directo: el secreto de malla es obligatorio (lo inyecta el
# gateway tras validar JWT; n8n/business lo envían entre sí). Los x-user-*
# solo aportan contexto — sin secreto, headers falsificados no pasan.
_PUBLIC = ("/health",)


@app.middleware("http")
async def internal_auth(request: Request, call_next):
    if request.url.path.startswith(_PUBLIC):
        return await call_next(request)
    if request.headers.get("x-internal-secret") != settings.internal_secret:
        return JSONResponse({"detail": "Secreto de malla requerido"}, status_code=401)
    return await call_next(request)


@app.get("/health")
def health():
    return {"status": "ok", "service": "ai-service", "ollama": settings.ollama_host}


def _run_mcp() -> None:
    """Servidor MCP (SSE) en proceso paralelo."""
    from app.mcp.server import mcp_server_app

    uvicorn.run(mcp_server_app(), host="0.0.0.0", port=settings.mcp_port, log_level="info")


def _order_created_handler(payload: dict) -> None:
    """order.created → estima costos IA, propone fecha de entrega (agente
    proactivo) y publica estimation.completed (doc §5.5)."""
    from app.application.agent import _first_day_with_capacity
    from app.application.estimate_furniture import estimate_furniture
    from app.infrastructure.messaging import rabbitmq

    order_id = payload.get("id") or payload.get("orderId")
    est = estimate_furniture(description=payload.get("description"))
    suggested = _first_day_with_capacity()
    log.info("Pedido #%s → fecha de entrega sugerida: %s", order_id, suggested)
    rabbitmq.publish("estimation.completed", {
        "orderId": order_id,
        "furnitureType": est.furniture_type.value,
        "estimatedPrice": est.estimated_price,
        "confidence": est.confidence,
        "suggestedDeliveryDate": suggested,
    })


if __name__ == "__main__":
    threading.Thread(target=_run_mcp, daemon=True).start()
    from app.infrastructure.messaging import rabbitmq

    rabbitmq.start_consumer(_order_created_handler)
    uvicorn.run(app, host="0.0.0.0", port=settings.port)
