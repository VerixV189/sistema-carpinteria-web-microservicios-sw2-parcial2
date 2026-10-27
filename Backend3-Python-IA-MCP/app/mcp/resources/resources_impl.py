"""MCP resources (§9.2 del doc): carpinteria:// URIs."""
from app.infrastructure.persistence.postgres_reader import postgres_reader

CATALOGO = {
    "muebles": {
        "items": ["ropero", "mesa de comedor", "silla", "estantería", "escritorio", "cama"],
        "precio_base_rango": [450, 3200],
    },
    "cocinas": {
        "items": ["cocina integral", "alacena", "isla de cocina"],
        "precio_base_rango": [5500, 15000],
    },
    "puertas": {
        "items": ["puerta maciza", "puerta con vidrio", "portón"],
        "precio_base_rango": [900, 4500],
    },
    "oficina": {
        "items": ["escritorio ejecutivo", "mesa de reuniones", "mueble recepción"],
        "precio_base_rango": [1600, 42000],
    },
}


def catalogo(categoria: str) -> dict:
    """carpinteria://catalogo/{categoria}"""
    data = CATALOGO.get(categoria.lower())
    return {"categoria": categoria, "data": data or {"items": [], "nota": "categoría desconocida"}}


def inventario_resumen() -> dict:
    """carpinteria://inventario/resumen"""
    rows = postgres_reader.safe_select(
        "SELECT name, wood_type, stock_m3, min_stock_m3, unit_price FROM materials ORDER BY name"
    )
    low = [r for r in rows if float(r["stock_m3"]) < float(r["min_stock_m3"])]
    return {
        "total_materiales": len(rows),
        "materiales": rows,
        "bajo_stock": low,
        "alerta": f"{len(low)} materiales bajo stock" if low else "Stock OK",
    }
