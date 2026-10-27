"""CU7 — Reportes en lenguaje natural (Text-to-SQL seguro).

Estrategia (atajo documentado): whitelist de plantillas SQL
parametrizadas que cubren las preguntas típicas; el LLM narra los
resultados. Si la pregunta no matchea ninguna plantilla, se le pide
SQL a Ollama con el schema como contexto y se valida que sea SELECT.
"""
import re
import time
from datetime import date

from app.domain.reports.models import ReportResult, ReportTemplate
from app.infrastructure.llm.provider import llm
from app.infrastructure.persistence.postgres_reader import postgres_reader

_CACHE_TTL_S = 60
_cache: dict[str, tuple[float, ReportResult]] = {}


def _cache_key(query: str) -> str:
    return re.sub(r"\s+", " ", query.strip().lower())

TEMPLATES: list[ReportTemplate] = [
    ReportTemplate(
        name="orders_by_status",
        keywords=["pedidos", "estado", "status", "órdenes", "ordenes"],
        sql="SELECT status, COUNT(*) AS total, SUM(total_price) AS monto_total FROM orders GROUP BY status ORDER BY total DESC",
        description="Pedidos agrupados por estado",
    ),
    ReportTemplate(
        name="deliveries_in_month",
        keywords=["entreg", "mes", "octubre", "noviembre", "diciembre", "enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre"],
        sql="SELECT d.id, d.scheduled_date, d.status, o.description FROM deliveries d JOIN orders o ON o.id = d.order_id WHERE EXTRACT(MONTH FROM d.scheduled_date) = %s ORDER BY d.scheduled_date",
        description="Entregas de un mes dado",
        params=["month"],
    ),
    ReportTemplate(
        name="top_clients",
        keywords=["mejores clientes", "top clientes", "clientes", "más pedidos", "mas pedidos", "más compr", "mas compr"],
        sql="SELECT c.name, c.email, COUNT(o.id) AS pedidos, COALESCE(SUM(o.total_price),0) AS gastado FROM clients c LEFT JOIN orders o ON o.client_id = c.id GROUP BY c.id ORDER BY gastado DESC LIMIT 10",
        description="Top clientes por gasto",
    ),
    ReportTemplate(
        name="revenue_by_month",
        keywords=["ingresos", "facturación", "facturacion", "ventas", "revenue", "ganancias"],
        sql="SELECT DATE_TRUNC('month', issued_at) AS mes, COUNT(*) AS facturas, SUM(total) AS total_bs FROM invoices GROUP BY mes ORDER BY mes DESC LIMIT 12",
        description="Facturación por mes",
    ),
    ReportTemplate(
        name="pending_orders",
        keywords=["pendientes", "por entregar", "sin entregar", "pending"],
        sql="SELECT o.id, o.description, o.status, o.delivery_date, c.name AS cliente FROM orders o JOIN clients c ON c.id = o.client_id WHERE o.status IN ('PENDING','APPROVED','IN_PRODUCTION') ORDER BY o.delivery_date NULLS LAST",
        description="Pedidos pendientes",
    ),
    ReportTemplate(
        name="low_stock",
        keywords=["stock", "materiales", "inventario", "madera", "falta"],
        sql="SELECT name, wood_type, stock_m3, min_stock_m3, unit_price FROM materials ORDER BY (stock_m3 - min_stock_m3) ASC",
        description="Materiales con stock bajo primero",
    ),
    ReportTemplate(
        name="carpenter_workload",
        keywords=["carpintero", "carga", "trabajo", "asignados", "workload"],
        sql="SELECT ca.name, COUNT(oc.order_id) AS pedidos_asignados FROM carpenters ca LEFT JOIN order_carpenters oc ON oc.carpenter_id = ca.id GROUP BY ca.id ORDER BY pedidos_asignados DESC",
        description="Carga de trabajo por carpintero",
    ),
]

MONTHS = {
    "enero": 1, "febrero": 2, "marzo": 3, "abril": 4, "mayo": 5, "junio": 6,
    "julio": 7, "agosto": 8, "septiembre": 9, "octubre": 10, "noviembre": 11, "diciembre": 12,
}


def _extract_month(query: str) -> int:
    for name, num in MONTHS.items():
        if name in query.lower():
            return num
    return date.today().month


def _match_template(query: str) -> ReportTemplate | None:
    q = query.lower()
    best, best_hits = None, 0
    for t in TEMPLATES:
        hits = sum(1 for k in t.keywords if k in q)
        if hits > best_hits:
            best, best_hits = t, hits
    return best


def generate_report(query: str) -> ReportResult:
    """Wrapper con caché (TTL 60s) — reportes repetidos no re-consultan."""
    key = _cache_key(query)
    hit = _cache.get(key)
    if hit and time.time() - hit[0] < _CACHE_TTL_S and hit[1].rows:
        return hit[1]
    result = _generate_report(query)
    if result.rows:
        _cache[key] = (time.time(), result)
    return result


def _fallback_narrative(query: str, rows: list[dict]) -> str:
    """Narrativa determinista cuando ningún LLM respondió."""
    if not rows:
        return f"No se encontraron resultados para: «{query}»."
    return f"Resultados para «{query}»: {len(rows)} fila(s). Primera fila: {rows[0]}."


def _generate_report(query: str) -> ReportResult:
    ollama = llm()
    template = _match_template(query)

    if template:
        params = (_extract_month(query),) if "month" in template.params else None
        rows = postgres_reader.safe_select(template.sql, params)
        narrative = ollama.narrate_report(query, rows) or _fallback_narrative(query, rows)
        return ReportResult(query=query, sql=template.sql, rows=rows, narrative=narrative, source="template")

    # Sin plantilla → LLM genera SQL con el schema (Text-to-SQL) validado
    schema = postgres_reader.schema_summary()
    sql_prompt = (
        "Eres un generador de SQL para PostgreSQL. Devuelve SOLO la consulta SELECT, "
        "sin explicaciones ni backticks. Solo lectura.\n\n"
        f"Esquema:\n{schema}\n\nPregunta: {query}\n\nSELECT"
    )
    raw = ollama.generate(sql_prompt)
    sql = None
    if raw:
        match = re.search(r"(?is)(select .+?)(;|$)", raw)
        if match:
            sql = match.group(1).strip()
    if sql:
        rows = postgres_reader.safe_select(sql)
        if rows or not raw:
            narrative = ollama.narrate_report(query, rows) or _fallback_narrative(query, rows)
            return ReportResult(query=query, sql=sql, rows=rows, narrative=narrative, source="llm")

    # Fallback final: pedidos pendientes (siempre útil)
    fallback = TEMPLATES[4]
    rows = postgres_reader.safe_select(fallback.sql)
    return ReportResult(
        query=query,
        sql=fallback.sql,
        rows=rows,
        narrative="No pude interpretar la consulta exactamente; muestro los pedidos pendientes.",
        source="fallback",
    )
