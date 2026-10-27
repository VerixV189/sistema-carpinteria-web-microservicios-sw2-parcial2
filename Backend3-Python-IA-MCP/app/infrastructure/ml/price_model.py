"""Adaptador OUT — modelo de precio (CU3).

Interfaz estable: predict(type, wood, dims) → (precio, factors).
Backend en orden de preferencia:
  1. models/price_model.joblib — GradientBoosting entrenado
     (training/train_price_model.py)
  2. Regresión por factores del dominio (fallback si falta el artefacto).
"""
import logging
from pathlib import Path

from app.domain.furniture.models import Dimensions, FurnitureType, WoodType
from app.domain.pricing.models import BASE_PRICE_BY_TYPE, VOLUME_FACTOR_PER_M3, WOOD_FACTOR

log = logging.getLogger("price-model")

_MODEL_PATH = Path(__file__).resolve().parents[3] / "models" / "price_model.joblib"


def _load_artifact():
    try:
        import joblib
        return joblib.load(_MODEL_PATH)
    except Exception as e:
        log.info("Sin modelo entrenado (%s) — uso regresión por factores", e)
        return None


class PriceModel:
    def __init__(self) -> None:
        art = _load_artifact()
        self._gbm = art["model"] if art else None
        self._types = (art or {}).get("types", [])
        self._woods = (art or {}).get("woods", [])
        self.name = f"{(art or {}).get('version', 'factor-regression-v1')}"
        if self._gbm:
            log.info("Modelo de precio ML cargado (%s)", self.name)

    def _ml_price(self, furniture_type: str, wood_type: str, volume: float) -> float | None:
        if not self._gbm:
            return None
        try:
            x = [[self._types.index(furniture_type),
                  self._woods.index(wood_type) if wood_type in self._woods else self._woods.index("GENERIC"),
                  volume]]
            return round(float(self._gbm.predict(x)[0]), 2)
        except (ValueError, IndexError):
            return None

    def predict(
        self,
        furniture_type: FurnitureType,
        wood_type: WoodType = WoodType.GENERIC,
        dimensions: Dimensions | None = None,
    ) -> tuple[float, dict]:
        volume = dimensions.volume_m3 if dimensions else 0.0
        base = BASE_PRICE_BY_TYPE.get(furniture_type.value, BASE_PRICE_BY_TYPE["OTHER"])
        wood_f = WOOD_FACTOR.get(wood_type.value, 1.0)

        ml = self._ml_price(furniture_type.value, wood_type.value, volume)
        if ml is not None:
            return ml, {
                "model": self.name,
                "volume_m3": round(volume, 3),
                "importances": getattr(self._gbm, "feature_importances_", []).tolist(),
            }

        price = round((base + volume * VOLUME_FACTOR_PER_M3) * wood_f, 2)
        return price, {
            "model": self.name,
            "base": base,
            "wood_factor": wood_f,
            "volume_m3": round(volume, 3),
            "volume_extra": round(volume * VOLUME_FACTOR_PER_M3, 2),
        }


price_model = PriceModel()
