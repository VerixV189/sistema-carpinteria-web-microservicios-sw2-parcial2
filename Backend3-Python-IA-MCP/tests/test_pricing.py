"""Tests unitarios de dominio — pricing y clasificación."""
from app.application.estimate_furniture import estimate_furniture
from app.infrastructure.ml.price_model import price_model
from app.infrastructure.vision.furniture_classifier import classify_furniture
from app.domain.furniture.models import Dimensions, FurnitureType, WoodType


def test_classify_ropero():
    ftype, conf = classify_furniture("Quiero un ropero de 3 puertas")
    assert ftype == FurnitureType.WARDROBE
    assert conf > 0.5


def test_classify_mesa():
    ftype, _ = classify_furniture("mesa de comedor para 6 personas")
    assert ftype == FurnitureType.TABLE


def test_price_roble_mas_caro_que_pino():
    d = Dimensions(1.8, 0.6, 2.1)
    pino, _ = price_model.predict(FurnitureType.WARDROBE, WoodType.PINO, d)
    roble, _ = price_model.predict(FurnitureType.WARDROBE, WoodType.ROBLE, d)
    assert roble > pino


def test_estimate_end_to_end():
    est = estimate_furniture(
        description="estantería de biblioteca",
        wood_type="PINO",
        dimensions={"length_m": 1.2, "width_m": 0.35, "height_m": 2.0},
    )
    assert est.furniture_type == FurnitureType.BOOKSHELF
    assert est.estimated_price > 0
