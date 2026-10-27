"""Selector de LLM con cadena de respaldo: Groq > Ollama local.

Los consumidores llaman `llm()` y reciben un adaptador con la interfaz
común: is_available() / generate(prompt, system) / narrate_report(q, rows).
Cada método prueba los adaptadores en orden: si Groq tiene key pero la
llamada falla (401, red, etc.), cae a Ollama en vez de devolver None.
"""
import logging

from app.infrastructure.llm.groq_adapter import groq_adapter
from app.infrastructure.llm.ollama_adapter import OllamaAdapter

log = logging.getLogger("llm-provider")


class _ChainAdapter:
    def __init__(self, adapters: list) -> None:
        self._adapters = adapters

    def is_available(self) -> bool:
        return any(a.is_available() for a in self._adapters)

    def _try(self, method: str, *args):
        for a in self._adapters:
            if not a.is_available():
                continue
            out = getattr(a, method)(*args)
            if out:
                return out
            log.warning("%s.%s falló → probando siguiente adaptador",
                        type(a).__name__, method)
        return None

    def generate(self, prompt: str, system: str | None = None) -> str | None:
        return self._try("generate", prompt, system)

    def narrate_report(self, question: str, rows: list[dict]) -> str | None:
        return self._try("narrate_report", question, rows)


def llm():
    return _ChainAdapter([groq_adapter, OllamaAdapter()])
