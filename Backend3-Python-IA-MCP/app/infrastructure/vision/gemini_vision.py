"""Adaptador OUT — Gemini Vision para clasificar muebles por foto (CU3).

Si hay GEMINI_API_KEY + imagen, devuelve (FurnitureType, confianza).
Si falla o no hay key, devuelve None y el clasificador cae a la heurística.
"""
import base64
import json
import logging
import re

import httpx

from app.domain.furniture.models import FurnitureType
from app.infrastructure.config.settings import settings

log = logging.getLogger("gemini")

_URL = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}"

_PROMPT = (
    "Eres un experto en muebles de carpintería. Clasifica la imagen en EXACTAMENTE "
    "uno de estos tipos: wardrobe, table, chair, bookshelf, desk, kitchen_cabinet, "
    "door, bed, other. Responde SOLO un JSON: {\"type\": \"<tipo>\", "
    "\"confidence\": <0-1>, \"material_hint\": \"<madera probable o null>\"}."
)

_MAGIC_MIME = [
    (b"\xff\xd8\xff", "image/jpeg"),
    (b"\x89PNG", "image/png"),
    (b"RIFF", "image/webp"),
    (b"GIF8", "image/gif"),
]


def _mime(b64: str) -> str:
    try:
        head = base64.b64decode(b64[:32] + "==")
        for magic, mime in _MAGIC_MIME:
            if head.startswith(magic):
                return mime
    except Exception:
        pass
    return "image/jpeg"


def classify_with_gemini(image_base64: str) -> tuple[FurnitureType, float] | None:
    if not settings.gemini_api_key:
        return None
    try:
        r = httpx.post(
            _URL.format(model=settings.gemini_model, key=settings.gemini_api_key),
            json={
                "contents": [{
                    "parts": [
                        {"text": _PROMPT},
                        {"inline_data": {
                            "mime_type": _mime(image_base64),
                            "data": image_base64,
                        }},
                    ]
                }],
                "generationConfig": {
                    "temperature": 0.1,
                    "maxOutputTokens": 512,  # gemini-2.5 gasta tokens en razonamiento
                    "responseMimeType": "application/json",
                },
            },
            timeout=30,
        )
        r.raise_for_status()
        text = r.json()["candidates"][0]["content"]["parts"][0]["text"]
        m = re.search(r"\{.*\}", text, re.S)
        if not m:
            return None
        data = json.loads(m.group())
        ftype = FurnitureType(str(data.get("type", "other")).upper())
        confidence = max(0.0, min(1.0, float(data.get("confidence", 0.5))))
        log.info("Gemini clasificó: %s (%.2f)", ftype.value, confidence)
        return ftype, round(confidence, 2)
    except (ValueError, KeyError, httpx.HTTPError) as e:
        log.warning("Gemini vision falló (%s) — heurística", e)
        return None
