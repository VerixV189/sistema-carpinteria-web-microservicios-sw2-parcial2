"""Adaptador OUT — Groq (endpoint OpenAI-compatible).

Prioridad sobre Ollama cuando hay GROQ_API_KEY: es la forma rápida
de tener un LLM real sin descargar el modelo local.
"""
import logging

import httpx

from app.infrastructure.config.settings import settings

log = logging.getLogger("groq")

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"


class GroqAdapter:
    """Misma interfaz que OllamaAdapter: generate(prompt, system)."""

    def __init__(self) -> None:
        self.key = settings.groq_api_key
        self.model = settings.groq_model

    def is_available(self) -> bool:
        return bool(self.key)

    def generate(self, prompt: str, system: str | None = None) -> str | None:
        if not self.key:
            return None
        messages = ([{"role": "system", "content": system}] if system else []) + [
            {"role": "user", "content": prompt}
        ]
        try:
            r = httpx.post(
                GROQ_URL,
                headers={"Authorization": f"Bearer {self.key}"},
                json={"model": self.model, "messages": messages,
                      "temperature": 0.3, "max_tokens": 512},
                timeout=30,
            )
            r.raise_for_status()
            return r.json()["choices"][0]["message"]["content"].strip()
        except Exception as e:
            log.warning("Groq no disponible (%s) — usando fallback", e)
            return None


    def narrate_report(self, question: str, rows: list[dict]) -> str | None:
        """Narrativa para CU7: datos → texto en español. None si el LLM falla
        (el llamante decide el fallback — así la cadena puede caer a Ollama)."""
        prompt = (
            "Eres un asistente de carpintería. Resume los siguientes datos en 2-3 "
            "oraciones en español, claro y directo.\n\n"
            f"Pregunta del usuario: {question}\n"
            f"Datos: {rows[:20]}\n\nRespuesta:"
        )
        return self.generate(prompt)


groq_adapter = GroqAdapter()
