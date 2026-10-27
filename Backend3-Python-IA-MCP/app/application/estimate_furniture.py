"""CU3 — Estimar mueble: clasifica tipo + predice precio."""
from app.domain.furniture.models import Dimensions, FurnitureEstimate, FurnitureType, WoodType
from app.infrastructure.ml.price_model import price_model
from app.infrastructure.vision.furniture_classifier import fuse_signals


def estimate_furniture(
    description: str | None = None,
    image_base64: str | None = None,
    furniture_type: str | None = None,
    wood_type: str | None = None,
    dimensions: dict | None = None,
) -> FurnitureEstimate:
    if furniture_type:
        ftype = FurnitureType[furniture_type.upper()] if furniture_type.upper() in FurnitureType.__members__ else FurnitureType.OTHER
        confidence = 0.9
        fusion = None
    else:
        fusion = fuse_signals(description, image_base64)
        ftype, confidence = fusion.furniture_type, fusion.confidence

    # Madera/dimensiones: explícito > fusión (OCR/descripción) > default
    wtype = (WoodType[wood_type.upper()]
             if wood_type and wood_type.upper() in WoodType.__members__
             else (fusion.wood_type if fusion and fusion.wood_type else WoodType.GENERIC))
    dims = (Dimensions(**dimensions) if dimensions
            else (fusion.dimensions if fusion else None))

    price, factors = price_model.predict(ftype, wtype, dims)
    if fusion and fusion.sources:
        factors = {**factors, "sources": fusion.sources}
    return FurnitureEstimate(
        furniture_type=ftype,
        confidence=confidence,
        estimated_price=price,
        factors=factors,
    )
