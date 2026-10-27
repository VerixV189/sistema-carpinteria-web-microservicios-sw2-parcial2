"""Adaptador OUT — ElevenLabs TTS (opcional).

Convierte texto a audio MP3 para respuestas de voz del agente (WhatsApp).
Sin ELEVENLABS_API_KEY devuelve None y el consumidor hace fallback a texto.
"""
import logging

import httpx

from app.infrastructure.config.settings import settings

log = logging.getLogger("elevenlabs")

_URL = "https://api.elevenlabs.io/v1/text-to-speech/{voice}"

MAX_CHARS = 1000  # nota de voz corta — evita gasto excesivo


def synthesize(text: str) -> bytes | None:
    """Texto → bytes MP3, o None si no está configurado/falla."""
    key = settings.elevenlabs_api_key
    if not key:
        return None
    try:
        r = httpx.post(
            _URL.format(voice=settings.elevenlabs_voice),
            headers={"xi-api-key": key},
            json={
                "text": text[:MAX_CHARS],
                "model_id": "eleven_multilingual_v2",
                "voice_settings": {"stability": 0.5, "similarity_boost": 0.7},
            },
            timeout=30,
        )
        r.raise_for_status()
        return r.content
    except httpx.HTTPError as e:
        log.warning("ElevenLabs falló (%s)", e)
        return None
