"""Entrena el modelo de precio (GradientBoosting) → models/price_model.joblib.

Fuentes de datos:
  1. Reales: order_items históricos en PostgreSQL (type, wood, qty → unit_price)
  2. Aumentación sintética controlada: factores del dominio + ruido gaussiano
     (documenta en el reporte que las reales reemplazan a las sintéticas a
     medida que el sistema acumula pedidos).

Uso:  python training/train_price_model.py
      (requiere DATABASE_URL o corre dentro del contenedor ai-service)
"""
from __future__ import annotations

import logging
from pathlib import Path

import joblib
import numpy as np

log = logging.getLogger("train_price_model")
logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")

from app.domain.furniture.models import FurnitureType, WoodType  # noqa: E402
from app.domain.pricing.models import (  # noqa: E402
    BASE_PRICE_BY_TYPE, VOLUME_FACTOR_PER_M3, WOOD_FACTOR)

# Volumen típico (m³) cuando el ítem histórico no guarda dimensiones
TYPICAL_VOLUME_M3 = {
    "WARDROBE": 0.80, "TABLE": 0.30, "CHAIR": 0.06, "BOOKSHELF": 0.40,
    "DESK": 0.25, "KITCHEN_CABINET": 1.10, "DOOR": 0.08, "BED": 0.90,
    "OTHER": 0.35,
}

MODEL_DIR = Path(__file__).resolve().parent.parent / "models"
MODEL_PATH = MODEL_DIR / "price_model.joblib"

_TYPES = [t.value for t in FurnitureType]
_WOODS = [w.value for w in WoodType]


def _factor_price(ftype: str, wood: str, volume: float) -> float:
    base = BASE_PRICE_BY_TYPE.get(ftype, BASE_PRICE_BY_TYPE["OTHER"])
    return (base + volume * VOLUME_FACTOR_PER_M3) * WOOD_FACTOR.get(wood, 1.0)


def _synthetic_samples(n_per_combo: int = 40, seed: int = 42) -> tuple[np.ndarray, np.ndarray]:
    """Rejilla type×wood con volumen perturbado → precio de factores + ruido."""
    rng = np.random.default_rng(seed)
    X, y = [], []
    for ftype in _TYPES:
        for wood in _WOODS:
            vol_typ = TYPICAL_VOLUME_M3.get(ftype, 0.35)
            for _ in range(n_per_combo):
                vol = max(0.0, rng.normal(vol_typ, vol_typ * 0.4))
                price = _factor_price(ftype, wood, vol) * rng.normal(1.0, 0.06)
                X.append([_TYPES.index(ftype), _WOODS.index(wood), vol])
                y.append(round(price, 2))
    return np.array(X), np.array(y)


def _real_samples() -> tuple[np.ndarray, np.ndarray]:
    """order_items reales: usa volumen típico del tipo (no se persiste dims)."""
    try:
        from app.infrastructure.persistence.postgres_reader import postgres_reader
        rows = postgres_reader.safe_select(
            "SELECT furniture_type, wood_type, unit_price FROM order_items "
            "WHERE furniture_type IS NOT NULL AND unit_price > 0", ())
    except Exception as e:  # sin BD → solo sintéticos
        log.warning("Sin datos reales (%s) — solo sintéticos", e)
        return np.empty((0, 3)), np.empty(0)
    X, y = [], []
    for r in rows:
        ft, w = r["furniture_type"], (r["wood_type"] or "GENERIC")
        if ft not in _TYPES or w not in _WOODS:
            continue
        X.append([_TYPES.index(ft), _WOODS.index(w), TYPICAL_VOLUME_M3.get(ft, 0.35)])
        y.append(float(r["unit_price"]))
    log.info("Muestras reales: %d", len(X))
    return np.array(X), np.array(y)


def train() -> Path:
    from sklearn.ensemble import GradientBoostingRegressor
    from sklearn.metrics import mean_absolute_error, r2_score
    from sklearn.model_selection import train_test_split

    Xs, ys = _synthetic_samples()
    Xr, yr = _real_samples()
    X = np.vstack([Xs, Xr]) if len(Xr) else Xs
    y = np.concatenate([ys, yr]) if len(yr) else ys

    Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.15, random_state=42)
    model = GradientBoostingRegressor(
        n_estimators=300, max_depth=3, learning_rate=0.08,
        subsample=0.9, random_state=42)
    model.fit(Xtr, ytr)

    pred = model.predict(Xte)
    mae, r2 = mean_absolute_error(yte, pred), r2_score(yte, pred)
    log.info("Evaluación: MAE=%.0f BOB  R²=%.3f  (n=%d)", mae, r2, len(y))

    MODEL_DIR.mkdir(exist_ok=True)
    joblib.dump({
        "model": model,
        "types": _TYPES,
        "woods": _WOODS,
        "version": "gbm-v1",
        "metrics": {"mae": mae, "r2": r2, "n_train": len(y)},
    }, MODEL_PATH)
    log.info("Modelo guardado en %s", MODEL_PATH)
    return MODEL_PATH


if __name__ == "__main__":
    train()
