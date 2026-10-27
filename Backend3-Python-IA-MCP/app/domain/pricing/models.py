"""Dominio — pricing: factores del modelo de precio."""
# Factores base por tipo de mueble (equivalente a pesos aprendidos por XGBoost)
BASE_PRICE_BY_TYPE = {
    "WARDROBE": 3200.0,
    "TABLE": 1800.0,
    "CHAIR": 450.0,
    "BOOKSHELF": 1500.0,
    "DESK": 1600.0,
    "KITCHEN_CABINET": 5500.0,
    "DOOR": 900.0,
    "BED": 2800.0,
    "OTHER": 1200.0,
}

# Multiplicador por tipo de madera
WOOD_FACTOR = {
    "PINO": 0.85,
    "MELAMINA": 0.55,
    "CEDRO": 1.45,
    "ROBLE": 1.75,
    "MARA": 2.30,
    "GENERIC": 1.0,
}

# Complejidad por volumen (m³)
VOLUME_FACTOR_PER_M3 = 900.0
