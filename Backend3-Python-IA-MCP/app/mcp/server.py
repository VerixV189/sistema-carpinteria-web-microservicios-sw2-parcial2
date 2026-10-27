"""Servidor MCP (Model Context Protocol) — expone tools/resources/prompts por SSE.

Cliente típico: cualquier IDE/LLM que hable MCP.
URL: http://localhost:8110/sse
"""
import json

from mcp.server.fastmcp import FastMCP

from app.infrastructure.config.settings import settings
from app.mcp.prompts.prompts_impl import CARPENTER_ASSISTANT
from app.mcp.resources import resources_impl
from app.mcp.tools import tools_impl

mcp = FastMCP(
    name="carpinteria-ai",
    instructions=CARPENTER_ASSISTANT,
)


# ----------------- Tools -----------------
@mcp.tool(
    name="estimate_furniture_cost",
    description="Estima el costo de un mueble (CU3) por tipo/madera/dimensiones o descripción libre.",
)
def estimate_furniture_cost(
    description: str = "",
    furniture_type: str | None = None,
    wood_type: str | None = None,
    length_m: float | None = None,
    width_m: float | None = None,
    height_m: float | None = None,
) -> str:
    return json.dumps(
        tools_impl.estimate_furniture_cost(
            description=description,
            furniture_type=furniture_type,
            wood_type=wood_type,
            length_m=length_m,
            width_m=width_m,
            height_m=height_m,
        ),
        ensure_ascii=False,
    )


@mcp.tool(
    name="optimize_wood_cuts",
    description="Optimiza el corte de piezas en hojas de madera (minimiza desperdicio).",
)
def optimize_wood_cuts(pieces: list[dict], sheet_length: float = 2.44, sheet_width: float = 1.22) -> str:
    return json.dumps(tools_impl.optimize_wood_cuts(pieces, sheet_length, sheet_width), ensure_ascii=False)


@mcp.tool(
    name="check_delivery_date",
    description="Verifica si una fecha (YYYY-MM-DD) tiene capacidad de entrega (CU4).",
)
def check_delivery_date(date: str) -> str:
    return json.dumps(tools_impl.check_delivery_date(date), ensure_ascii=False)


@mcp.tool(
    name="generate_report",
    description="Genera un reporte del negocio a partir de una consulta en lenguaje natural (CU7).",
)
def generate_report(query: str) -> str:
    return json.dumps(tools_impl.generate_report(query), ensure_ascii=False, default=str)


@mcp.tool(
    name="search_inventory",
    description="Busca materiales en el inventario por nombre o tipo de madera.",
)
def search_inventory(query: str) -> str:
    return json.dumps(tools_impl.search_inventory(query), ensure_ascii=False, default=str)


@mcp.tool(
    name="carpinteria_agent",
    description="Agente inteligente: interpreta texto libre en español y actúa sobre el "
                "negocio (consulta entregas, agenda, asignación dinámica, cotiza, "
                "inventario, reportes). Ej: '¿Qué día se entrega el pedido #15?'",
)
def carpinteria_agent(query: str) -> str:
    from app.application.agent import agent_answer
    return json.dumps(agent_answer(query), ensure_ascii=False, default=str)


# ----------------- Tools de negocio (business-service) -----------------
@mcp.tool(
    name="list_orders",
    description="Lista pedidos del negocio; status opcional (PENDING, APPROVED, IN_PRODUCTION, READY, DELIVERED, CANCELLED).",
)
def list_orders(status: str | None = None) -> str:
    return json.dumps(tools_impl.list_orders(status), ensure_ascii=False, default=str)


@mcp.tool(
    name="get_order",
    description="Detalle completo de un pedido por id.",
)
def get_order(order_id: int) -> str:
    return json.dumps(tools_impl.get_order(order_id), ensure_ascii=False, default=str)


@mcp.tool(
    name="delivery_by_order",
    description="Entrega agendada de un pedido (fecha, turno, estado) o null si no tiene.",
)
def delivery_by_order(order_id: int) -> str:
    return json.dumps(tools_impl.delivery_by_order(order_id), ensure_ascii=False, default=str)


@mcp.tool(
    name="schedule_delivery",
    description="Agenda la entrega de un pedido para una fecha YYYY-MM-DD (mutación).",
)
def schedule_delivery(order_id: int, date: str, time_slot: str = "MORNING") -> str:
    return json.dumps(tools_impl.schedule_delivery(order_id, date, time_slot),
                      ensure_ascii=False, default=str)


# ----------------- Resources -----------------
@mcp.resource("carpinteria://catalogo/{categoria}", name="catalogo", description="Catálogo de productos por categoría")
def catalogo(categoria: str) -> str:
    return json.dumps(resources_impl.catalogo(categoria), ensure_ascii=False)


@mcp.resource("carpinteria://inventario/resumen", name="inventario-resumen", description="Resumen del inventario de materiales")
def inventario_resumen() -> str:
    return json.dumps(resources_impl.inventario_resumen(), ensure_ascii=False, default=str)


# ----------------- Prompts -----------------
@mcp.prompt(name="carpenter_assistant", description="Asistente experto de carpintería")
def carpenter_assistant() -> str:
    return CARPENTER_ASSISTANT


class _ApiKeyMiddleware:
    """B2 — auth opcional: si MCP_API_KEY está definida, exige
    Authorization: Bearer <key> en todo request HTTP."""
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] == "http":
            headers = dict(scope.get("headers") or [])
            auth = headers.get(b"authorization", b"").decode()
            if auth != f"Bearer {settings.mcp_api_key}":
                response = b'{"detail":"Unauthorized"}'
                await send({"type": "http.response.start", "status": 401,
                            "headers": [(b"content-type", b"application/json")]})
                await send({"type": "http.response.body", "body": response})
                return
        await self.app(scope, receive, send)


def mcp_server_app():
    """App ASGI del servidor MCP (transporte SSE)."""
    app = mcp.sse_app()
    if settings.mcp_api_key:
        app = _ApiKeyMiddleware(app)
    return app


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(mcp_server_app(), host="0.0.0.0", port=8110)
