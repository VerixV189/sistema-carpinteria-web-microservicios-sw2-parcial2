"""Implementaciones de los MCP tools (§9.1 del doc).

Cada tool es una función pura que reutiliza la capa de aplicación —
el servidor MCP solo es un adaptador de transporte.
"""
from app.application.check_delivery import check_delivery_date as _check
from app.application.estimate_furniture import estimate_furniture
from app.application.generate_report import generate_report as _report
from app.infrastructure.external.business_client import business_client
from app.infrastructure.persistence.postgres_reader import postgres_reader


def estimate_furniture_cost(
    description: str = "",
    furniture_type: str | None = None,
    wood_type: str | None = None,
    length_m: float | None = None,
    width_m: float | None = None,
    height_m: float | None = None,
) -> dict:
    """Estima el costo de un mueble. CU3."""
    dimensions = (
        {"length_m": length_m or 1.0, "width_m": width_m or 1.0, "height_m": height_m or 1.0}
        if any(v is not None for v in (length_m, width_m, height_m))
        else None
    )
    est = estimate_furniture(
        description=description or None,
        furniture_type=furniture_type,
        wood_type=wood_type,
        dimensions=dimensions,
    )
    return {
        "furnitureType": est.furniture_type.value,
        "confidence": est.confidence,
        "estimatedPrice": est.estimated_price,
        "currency": est.currency,
        "factors": est.factors,
    }


def optimize_wood_cuts(
    pieces: list[dict],
    sheet_length: float = 2.44,
    sheet_width: float = 1.22,
) -> dict:
    """Optimiza cortes de madera — first-fit-decreasing (atajo de OR-Tools)."""
    sorted_pieces = sorted(pieces, key=lambda p: p["length"] * p["width"], reverse=True)
    sheets: list[list[dict]] = []
    free: list[list[dict]] = []  # rectángulos libres por hoja

    for p in sorted_pieces:
        placed = False
        for i, rects in enumerate(free):
            for j, r in enumerate(rects):
                if p["length"] <= r["length"] and p["width"] <= r["width"]:
                    rects.pop(j)
                    # rectángulos remanentes (corte guillotina simplificado)
                    rects.append({"length": r["length"] - p["length"], "width": p["width"]})
                    rects.append({"length": r["length"], "width": r["width"] - p["width"]})
                    sheets[i].append(p)
                    placed = True
                    break
            if placed:
                break
        if not placed:
            sheets.append([p])
            free.append([
                {"length": sheet_length - p["length"], "width": p["width"]},
                {"length": sheet_length, "width": sheet_width - p["width"]},
            ])

    used_area = sum(p["length"] * p["width"] for p in pieces)
    total_area = len(sheets) * sheet_length * sheet_width
    return {
        "sheetsNeeded": len(sheets),
        "sheetSize": {"length": sheet_length, "width": sheet_width},
        "layout": sheets,
        "efficiency": round(used_area / total_area, 3) if total_area else 0,
        "algorithm": "first-fit-decreasing (OR-Tools shortcut)",
    }


def check_delivery_date(date: str) -> dict:
    """¿Se puede entregar en esta fecha? CU4 — consulta Spring Boot."""
    return _check(date)


def generate_report(query: str) -> dict:
    """Reporte en lenguaje natural. CU7."""
    result = _report(query)
    return {
        "query": result.query,
        "sql": result.sql,
        "rows": result.rows,
        "narrative": result.narrative,
        "source": result.source,
    }


def search_inventory(query: str) -> dict:
    """Busca materiales en inventario por nombre/tipo de madera."""
    rows = postgres_reader.safe_select(
        "SELECT id, name, wood_type, stock_m3, min_stock_m3, unit_price "
        "FROM materials WHERE LOWER(name) LIKE %s OR LOWER(wood_type) LIKE %s",
        (f"%{query.lower()}%", f"%{query.lower()}%"),
    )
    low = [r for r in rows if float(r["stock_m3"]) < float(r["min_stock_m3"])]
    return {"query": query, "results": rows, "lowStock": low, "count": len(rows)}


# ------- Tools de negocio (vía business-service) -------

def list_orders(status: str | None = None) -> list[dict]:
    """Lista pedidos del negocio; status opcional (PENDING, APPROVED, …)."""
    return business_client.list_orders(status)


def get_order(order_id: int) -> dict | None:
    """Detalle de un pedido."""
    return business_client.get_order(order_id)


def delivery_by_order(order_id: int) -> dict | None:
    """Entrega agendada de un pedido (o None si no tiene)."""
    return business_client.delivery_by_order(order_id)


def schedule_delivery(order_id: int, date: str, time_slot: str = "MORNING") -> dict | None:
    """Agenda la entrega de un pedido (mutación GraphQL)."""
    return business_client.schedule_delivery(order_id, date, time_slot)
