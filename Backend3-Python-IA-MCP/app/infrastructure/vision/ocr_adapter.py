"""Adaptador OUT — OCR sobre fotos de muebles (Tesseract, local).

Extrae de etiquetas/rotulos en la imagen:
  - dimensiones físicas ("1.80 x 0.90 x 0.45", "180x90cm", "2.4m")
  - tipo de madera mencionado ("MARA", "cedro", "roble")
  - texto crudo (para auditoría / debugging)

Sin red — tesseract-ocr es un binario del sistema (apt en el Dockerfile).
"""
from __future__ import annotations

import base64
import io
import logging
import os
import re
from dataclasses import dataclass, field

log = logging.getLogger("ocr")

_WOODS = ("mara", "cedro", "roble", "pino", "melamina", "caoba", "nogal", "tajibo")

# "1.80x0.90x0.45" | "1,80 x 0,90" | "180x90cm" — 2 o 3 dimensiones
_DIMS_RE = re.compile(
    r"(\d{1,3}(?:[.,]\d{1,2})?)\s*[x×]\s*(\d{1,3}(?:[.,]\d{1,2})?)"
    r"(?:\s*[x×]\s*(\d{1,3}(?:[.,]\d{1,2})?))?\s*(m|cm|mm)?",
    re.IGNORECASE)
# "largo 2.4m", "alto 1.80", "ancho 90cm" — tolera OCR ruidoso:
# nombre con vocal flexible + hasta 4 chars basura antes del número
_SIDE_RE = re.compile(
    r"(larg[oa]?|anch[oa]|alt[oa]|profundidad|fond[oa]|espesor)"
    r"[^0-9]{0,4}(\d{1,3}(?:[.,:]\d{1,2})?)\s*(m|cm|mm)?", re.IGNORECASE)


def _to_m(value: float, unit: str | None) -> float:
    """Normaliza a metros. Guarda de dominio: ningún lado de un mueble
    supera ~15m — un valor mayor indica decimal perdido por el OCR
    ("180m" = "1.80m") o unidad cm leída como m."""
    if unit == "cm" or (unit is None and 10 <= value < 1000):
        return value / 100
    if unit == "mm" or (unit is None and value >= 1000):
        return value / 1000
    if value > 15:
        return value / 100
    return value


def _num(s: str) -> float:
    # OCR suele leer ':' en vez de '.' dentro de números ("2:10" → 2.10)
    return float(s.replace(",", ".").replace(":", "."))


@dataclass
class OcrResult:
    raw_text: str = ""
    dimensions: tuple[float, float, float] | None = None  # largo, ancho, alto (m)
    wood_hint: str | None = None                          # ej. "cedro"
    found: bool = field(default=False)


def extract(image_base64: str) -> OcrResult:
    """OCR de una imagen b64. Nunca lanza: retorna found=False si falla."""
    try:
        import pytesseract
        from PIL import Image
    except ImportError:
        log.warning("pytesseract/Pillow no instalados")
        return OcrResult()
    cmd = os.getenv("TESSERACT_CMD")
    if cmd:
        pytesseract.pytesseract.tesseract_cmd = cmd
    try:
        img = Image.open(io.BytesIO(base64.b64decode(image_base64)))
        # upscale leve + psm bloque uniforme: mejora lectura de etiquetas pequeñas
        if max(img.size) < 1000:
            img = img.resize((img.width * 2, img.height * 2), Image.LANCZOS)
        text = pytesseract.image_to_string(img, config="--psm 6")
    except Exception as e:
        log.warning("OCR falló: %s", e)
        return OcrResult()

    result = OcrResult(raw_text=text.strip(), found=bool(text.strip()))
    low = text.lower()

    for w in _WOODS:
        if w in low:
            result.wood_hint = w.upper()
            break

    # Dimensiones explícitas por lado primero (más precisas)
    sides: dict[str, float] = {}
    for name, val, unit in _SIDE_RE.findall(low):
        canon = ("largo" if name.startswith("lar") else
                 "ancho" if name.startswith("an") else
                 "alto" if name.startswith("al") else "fondo")
        sides[canon] = _to_m(_num(val), unit)
    if len(sides) >= 2:
        result.dimensions = (
            round(sides.get("largo") or sides.get("ancho") or 0, 3),
            round(sides.get("ancho") or sides.get("fondo") or 0, 3),
            round(sides.get("alto") or 0, 3))
        return result

    m = _DIMS_RE.search(low)
    if m:
        a, b = _to_m(_num(m.group(1)), m.group(4)), _to_m(_num(m.group(2)), m.group(4))
        c = _to_m(_num(m.group(3)), m.group(4)) if m.group(3) else 0.0
        result.dimensions = (round(a, 3), round(b, 3), round(c, 3))
    return result


ocr_adapter = extract
