"""Adaptador OUT — clasificador de muebles YOLOv8-cls (ONNX, local).

Carga models/furniture-cls.onnx (fine-tuned, ver training/train_vision.py).
Sin red ni torch: onnxruntime + numpy + Pillow.
Devuelve (FurnitureType, confianza) o None si el artefacto no existe.
"""
from __future__ import annotations

import base64
import logging
from pathlib import Path

import cv2

import numpy as np

from app.domain.furniture.models import FurnitureType

log = logging.getLogger("yolo-cls")

_ROOT = Path(__file__).resolve().parents[3]
_ONNX = _ROOT / "models" / "furniture-cls.onnx"
_CLASSES = _ROOT / "models" / "furniture-classes.txt"

_SIZE = 224

_session = None
_labels: list[str] | None = None
_loaded = False


def _ensure_loaded() -> bool:
    global _session, _labels, _loaded
    if _loaded:
        return _session is not None
    _loaded = True
    if not _ONNX.exists():
        log.info("Sin %s — clasificador local inactivo", _ONNX.name)
        return False
    try:
        import onnxruntime as ort
        _session = ort.InferenceSession(str(_ONNX), providers=["CPUExecutionProvider"])
        _labels = _CLASSES.read_text().split() if _CLASSES.exists() else []
        log.info("YOLO-cls ONNX cargado (%d clases)", len(_labels))
    except Exception as e:
        log.warning("No se pudo cargar el modelo ONNX: %s", e)
    return _session is not None


def _preprocess(image_base64: str) -> np.ndarray:
    """El ONNX de ultralytics embebe la normalización ImageNet en el grafo:
    basta RGB [0,1] con resize de borde menor a 224 (antialias) + crop 224×224."""
    raw = np.frombuffer(base64.b64decode(image_base64), dtype=np.uint8)
    img = cv2.imdecode(raw, cv2.IMREAD_COLOR)[:, :, ::-1]  # BGR→RGB
    if img is None:
        raise ValueError("imagen no decodificable")
    h, w = img.shape[:2]
    scale = _SIZE / min(w, h)
    interp = cv2.INTER_AREA if scale < 1 else cv2.INTER_LINEAR
    img = cv2.resize(img, (round(w * scale), round(h * scale)), interpolation=interp)
    h, w = img.shape[:2]
    top, left = (h - _SIZE) // 2, (w - _SIZE) // 2
    x = img[top:top + _SIZE, left:left + _SIZE].astype(np.float32) / np.float32(255.0)
    return x.transpose(2, 0, 1)[None]  # NCHW


def classify(image_base64: str) -> tuple[FurnitureType, float] | None:
    """→ (tipo, confianza) o None si el artefacto no está disponible."""
    if not _ensure_loaded():
        return None
    try:
        x = _preprocess(image_base64)
        inp = _session.get_inputs()[0].name
        logits = _session.run(None, {inp: x})[0][0]
        probs = np.exp(logits - logits.max())
        probs /= probs.sum()
        idx = int(probs.argmax())
        label = _labels[idx] if idx < len(_labels or []) else "OTHER"
        return FurnitureType(label if label in FurnitureType.__members__ else "OTHER"), float(probs[idx])
    except Exception as e:
        log.warning("Inferencia YOLO falló: %s", e)
        return None
