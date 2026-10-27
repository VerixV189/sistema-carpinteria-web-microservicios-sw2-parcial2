"""CU4 — check_delivery_date: consulta capacidad real al business-service."""
from app.infrastructure.external.business_client import business_client


def check_delivery_date(date: str) -> dict:
    """Devuelve si una fecha tiene capacidad de entrega y cuántos cupos quedan."""
    capacity = business_client.delivery_capacity(date)
    if capacity is None:
        return {
            "date": date,
            "hasCapacity": None,
            "available": None,
            "message": "No se pudo consultar la capacidad (business-service no disponible)",
        }
    available = capacity.get("available", 0)
    return {
        **capacity,
        "message": (
            f"El {date} tiene {available} cupo(s) de entrega disponibles."
            if capacity.get("hasCapacity")
            else f"El {date} ya no tiene cupo de entrega (máx. {capacity.get('maxPerDay')}/día)."
        ),
    }
