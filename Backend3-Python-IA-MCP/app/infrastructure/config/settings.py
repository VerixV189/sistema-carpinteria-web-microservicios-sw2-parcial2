"""Configuración central (pydantic-settings)."""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    port: int = 8100
    mcp_port: int = 8110
    mcp_api_key: str | None = "carpinteria-mcp-dev"  # MCP exige Bearer (cambiar en prod)
    internal_secret: str = "carpinteria-internal-dev"  # mesh servicio↔servicio (cambiar en prod)

    ollama_host: str = "http://localhost:11434"
    ollama_model: str = "llama3.2:3b"
    ollama_timeout: int = 30

    # LLM del agente — Groq (OpenAI-compatible). Si hay key, tiene prioridad sobre Ollama.
    groq_api_key: str | None = None
    groq_model: str = "llama-3.3-70b-versatile"

    # Visión de muebles — Gemini. Si hay key + imagen, reemplaza la heurística.
    gemini_api_key: str | None = None
    gemini_model: str = "gemini-2.5-flash"

    # Voz para respuestas del agente (WhatsApp, opcional)
    elevenlabs_api_key: str | None = None
    elevenlabs_voice: str = "21m00Tcm4TlvDq8ikWAM"  # Rachel (multilingüe)

    business_service_url: str = "http://localhost:8080"

    postgres_host: str = "localhost"
    postgres_port: int = 5432
    postgres_user: str = "carpinteria"
    postgres_password: str = "carpinteria"
    postgres_db: str = "carpinteria"
    postgres_ro_user: str = "carpinteria_ro"      # rol read-only para Text-to-SQL
    postgres_ro_password: str = "carpinteria_ro_dev"

    mongo_uri: str = "mongodb://carpinteria:carpinteria@localhost:27017/carpinteria?authSource=admin"
    rabbitmq_url: str = "amqp://carpinteria:carpinteria@localhost:5672"
    rabbitmq_exchange: str = "carpinteria.events"

    @property
    def postgres_dsn(self) -> str:
        return (
            f"host={self.postgres_host} port={self.postgres_port} "
            f"user={self.postgres_user} password={self.postgres_password} "
            f"dbname={self.postgres_db}"
        )

    @property
    def postgres_ro_dsn(self) -> str:
        """DSN del rol read-only: los reportes Text-to-SQL nunca usan el superuser."""
        return (
            f"host={self.postgres_host} port={self.postgres_port} "
            f"user={self.postgres_ro_user} password={self.postgres_ro_password} "
            f"dbname={self.postgres_db}"
        )


settings = Settings()
