"""Fusión multi-señal para CU3 — combina lo que saben las 3 fuentes.

Señales sobre la foto del mueble + descripción:
  - YOLO-cls ONNX (DL local)      → tipo + confianza
  - OCR Tesseract (local)         → dimensiones + madera escrita
  - Keywords en la descripción    → tipo (fallback) / madera
  - Gemini Vision (opcional, externa) → solo si hay key y el local falla

Reglas (ver plan F4):
  tipo:      sin texto → YOLO; con texto → keywords del usuario salvo que YOLO
             esté muy seguro (≥0.40); desacuerdos se reportan en sources
  dimensiones: OCR > descripción explícita > None
  madera:    OCR > descripción > GENERIC
"""
from __future__ import annotations

import logging
import re
from dataclasses import dataclass, field

from app.domain.furniture.models import Dimensions, FurnitureType, WoodType
from app.infrastructure.vision import ocr_adapter

log = logging.getLogger("fusion")

# YOLO-cls con 9 clases sale con softmax plana: aciertos ≈0.25 mediana,
# errores ≤0.24, azar = 1/9 ≈ 0.11. Sin texto, visión manda siempre (93% acc);
# la descripción explícita del usuario solo cede si la visión está muy segura.
_CONF_OVERRIDE_TEXT = 0.40

_WOOD_WORDS: dict[WoodType, tuple[str, ...]] = {
    WoodType.MARA: ("mara",), WoodType.CEDRO: ("cedro",),
    WoodType.ROBLE: ("roble",), WoodType.PINO: ("pino",),
    WoodType.MELAMINA: ("melamina", "mdf"),
}
# dimensiones escritas en la descripción: "2x1", "1.8 x 0.9"
_DESC_DIMS = re.compile(
    r"(\d{1,3}(?:[.,]\d{1,2})?)\s*[x×]\s*(\d{1,3}(?:[.,]\d{1,2})?)"
    r"(?:\s*[x×]\s*(\d{1,3}(?:[.,]\d{1,2})?))?\s*(m|cm|mm)?",
    re.IGNORECASE)


@dataclass
class FusionResult:
    furniture_type: FurnitureType
    confidence: float
    wood_type: WoodType | None = None
    dimensions: Dimensions | None = None
    sources: dict = field(default_factory=dict)


def _wood_from_text(text: str | None) -> WoodType | None:
    low = (text or "").lower()
    for wood, words in _WOOD_WORDS.items():
        if any(re.search(rf"\b{w}\b", low) for w in words):
            return wood
    return None


def _dims_from_text(text: str | None) -> Dimensions | None:
    low = (text or "").lower()
    m = _DESC_DIMS.search(low)
    if not m:
        return None
    def n(s: str) -> float: return float(s.replace(",", "."))
    unit = m.group(4)
    def to_m(v: float) -> float:
        if unit == "cm" or (unit is None and v >= 10):
            return v / 100
        if unit == "mm":
            return v / 1000
        return v
    a, b = to_m(n(m.group(1))), to_m(n(m.group(2)))
    c = to_m(n(m.group(3))) if m.group(3) else 0.0
    return Dimensions(length_m=a, width_m=b, height_m=c)


def fuse(description: str | None, image_base64: str | None,
         text_scores: dict[FurnitureType, int]) -> FusionResult:
    """Combina señales disponibles en una sola decisión."""
    from app.infrastructure.vision.yolo_classifier import classify as yolo_classify

    sources: dict = {}
    vision: tuple[FurnitureType, float] | None = None
    ocr = None

    if image_base64:
        vision = yolo_classify(image_base64)
        if vision:
            sources["vision"] = {"type": vision[0].value, "conf": round(vision[1], 3)}
        ocr = ocr_adapter.extract(image_base64)
        if ocr.found:
            sources["ocr"] = {"dims": ocr.dimensions, "wood": ocr.wood_hint}
            # La etiqueta suele nombrar el mueble ("MESA COMEDOR"):
            # sus keywords pesan como texto si no hay descripción
            if not text_scores:
                from app.infrastructure.vision.furniture_classifier import _text_signals
                text_scores = _text_signals(ocr.raw_text)
                if text_scores:
                    sources["ocr_named_type"] = True

        if vision is None:
            # Respaldo externo opcional (solo si está configurado)
            try:
                from app.infrastructure.vision.gemini_vision import classify_with_gemini
                vision = classify_with_gemini(image_base64)
                if vision:
                    sources["vision"] = {"type": vision[0].value, "conf": vision[1],
                                         "provider": "gemini"}
            except Exception:
                pass

    # — Tipo de mueble —
    if vision and (not text_scores or vision[1] >= _CONF_OVERRIDE_TEXT):
        ftype, conf = vision
    elif text_scores:
        best = max(text_scores.items(), key=lambda kv: kv[1])
        ftype = best[0]
        conf = min(0.55 + 0.15 * best[1], 0.95)
        if vision and vision[0] != ftype:  # desacuerdo foto vs texto → transparente
            sources["vision_disagrees"] = {"type": vision[0].value, "conf": round(vision[1], 3)}
    elif vision:
        ftype, conf = vision
    else:
        ftype, conf = FurnitureType.OTHER, 0.35

    # — Madera: OCR > descripción —
    wood: WoodType | None = None
    if ocr and ocr.wood_hint:
        wood = WoodType[ocr.wood_hint] if ocr.wood_hint in WoodType.__members__ else None
        if wood:
            sources["wood_from"] = "ocr"
    if wood is None:
        wood = _wood_from_text(description)
        if wood:
            sources["wood_from"] = "description"

    # — Dimensiones: OCR > descripción —
    dims = None
    if ocr and ocr.dimensions:
        l, w, h = ocr.dimensions
        dims = Dimensions(length_m=l, width_m=w, height_m=h)
        sources["dims_from"] = "ocr"
    if dims is None:
        dims = _dims_from_text(description)
        if dims:
            sources["dims_from"] = "description"

    return FusionResult(ftype, round(conf, 2), wood, dims, sources)
