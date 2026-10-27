"""Adaptador OUT — Ollama (Llama 3.1 8B).

Usado para narrativa de reportes (CU7) y asistente. Si Ollama no está
disponible, los llamantes usan fallback heurístico.
"""
import logging

import httpx

from app.infrastructure.config.settings import settings

log = logging.getLogger("ollama")


class OllamaAdapter:
    def __init__(self) -> None:
        self.base = settings.ollama_host.rstrip("/")
        self.model = settings.ollama_model
        self.timeout = settings.ollama_timeout

    def is_available(self) -> bool:
        try:
            r = httpx.get(f"{self.base}/api/tags", timeout=3)
            return r.status_code == 200
        except Exception:
            return False

    def generate(self, prompt: str, system: str | None = None) -> str | None:
        """Genera texto. Devuelve None si Ollama no responde."""
        payload: dict = {
            "model": self.model,
            "prompt": prompt,
            "stream": False,
            "options": {"temperature": 0.3, "num_predict": 512},
        }
        if system:
            payload["system"] = system
        try:
            r = httpx.post(f"{self.base}/api/generate", json=payload, timeout=self.timeout)
            r.raise_for_status()
            return r.json().get("response", "").strip()
        except Exception as e:
            log.warning("Ollama no disponible (%s) — usando fallback", e)
            return None

    def narrate_report(self, question: str, rows: list[dict]) -> str | None:
        """Narrativa para CU7: datos → texto en español. None si el LLM falla
        (el llamante decide el fallback — así la cadena respeta el orden)."""
        preview = rows[:20]
        prompt = (
            "Eres un asistente de carpintería. Resume los siguientes datos en 2-3 "
            "oraciones en español, claro y directo.\n\n"
            f"Pregunta del usuario: {question}\n"
            f"Datos: {preview}\n\nRespuesta:"
        )
        return self.generate(prompt)
