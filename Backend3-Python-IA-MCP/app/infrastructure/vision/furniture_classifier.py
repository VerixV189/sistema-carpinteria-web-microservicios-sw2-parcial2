"""Adaptador OUT — clasificación de muebles (CU3).

Diseño: interfaz lista para YOLOv8-ONNX/CLIP. Implementación actual:
heurística por keywords sobre la descripción (+ nombre del archivo),
que devuelve tipo + confianza. Sustituir `classify` por inferencia real
cuando el modelo esté disponible.
"""
import base64
import re

from app.domain.furniture.models import FurnitureType

KEYWORDS: dict[FurnitureType, list[str]] = {
    FurnitureType.WARDROBE: ["ropero", "closet", "wardrobe", "armario", "vestidor"],
    FurnitureType.TABLE: ["mesa", "table", "comedor", "desk"],
    FurnitureType.CHAIR: ["silla", "chair", "taburete", "banco", "sofá", "sofa"],
    FurnitureType.BOOKSHELF: ["estantería", "estanteria", "biblioteca", "bookshelf", "librero", "repisa"],
    FurnitureType.DESK: ["escritorio", "desk", "oficina", "recepción", "recepcion"],
    FurnitureType.KITCHEN_CABINET: ["cocina", "kitchen", "gabinete", "alacena", "cupboard"],
    FurnitureType.DOOR: ["puerta", "door", "ventana", "window", "portón", "porton"],
    FurnitureType.BED: ["cama", "bed", "cabecera"],
}

# Huellas ligeras por "imagen": el nombre del archivo suele llevar el tipo
def _text_signals(text: str) -> dict[FurnitureType, int]:
    text = text.lower()
    scores: dict[FurnitureType, int] = {}
    for ftype, words in KEYWORDS.items():
        hits = sum(1 for w in words if re.search(rf"\b{re.escape(w)}\b", text))
        if hits:
            scores[ftype] = hits
    return scores


def classify_furniture(description: str | None = None, image_base64: str | None = None) -> tuple[FurnitureType, float]:
    """Devuelve (tipo, confianza 0-1) — fusión YOLO local + OCR + texto."""
    res = fuse_signals(description, image_base64)
    return res.furniture_type, res.confidence


def fuse_signals(description: str | None, image_base64: str | None):
    """Entrada única a la fusión (tipo + madera + dimensiones + fuentes)."""
    from app.infrastructure.vision.fusion import fuse
    return fuse(description, image_base64, _text_signals(description or ""))
