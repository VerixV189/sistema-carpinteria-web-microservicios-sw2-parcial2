"""Adaptador OUT — Postgres read-only (CU7 Text-to-SQL)."""
import logging
import re

import psycopg
from psycopg.rows import dict_row

from app.infrastructure.config.settings import settings

log = logging.getLogger("postgres")

FORBIDDEN = ("insert", "update", "delete", "drop", "alter", "truncate", "grant", "revoke",
             "copy", "call", "execute", "do ", "create", "comment on")
# Funciones/objetos peligrosos aun dentro de un SELECT (server-side read/DoS)
DANGEROUS = ("pg_read_file", "pg_ls_dir", "pg_stat_file", "pg_sleep", "lo_import",
             "lo_export", "dblink", "set_config", "pg_terminate_backend",
             "pg_cancel_backend", "current_setting", "information_schema.role")
_COMMENT_RE = re.compile(r"(--[^\n]*)|(/\*.*?\*/)", re.S)


def _sanitize(sql: str) -> str:
    """Quita comentarios y el ';' final; rechaza multi-statement."""
    cleaned = _COMMENT_RE.sub(" ", sql).strip()
    if cleaned.endswith(";"):
        cleaned = cleaned[:-1].strip()
    if ";" in cleaned:
        raise ValueError("No se permiten sentencias múltiples")
    return cleaned


class PostgresReader:
    """Ejecuta SOLO consultas SELECT sobre el esquema de negocio.

    Doble defensa: validación sintáctica + conexión con rol `carpinteria_ro`
    que solo tiene GRANT SELECT (ni funciones de servidor ni escritura).
    """

    def run_select(self, sql: str, params: tuple | None = None) -> list[dict]:
        lowered = _sanitize(sql).lower()
        if not (lowered.startswith("select") or lowered.startswith("with")):
            raise ValueError("Solo se permiten consultas SELECT")
        if any(k in lowered for k in FORBIDDEN + DANGEROUS):
            raise ValueError("Consulta contiene elementos no permitidos")
        try:
            with psycopg.connect(settings.postgres_ro_dsn, autocommit=True) as conn:
                with conn.cursor(row_factory=dict_row) as cur:
                    cur.execute(sql, params or ())
                    return [dict(r) for r in cur.fetchall()]
        except Exception as e:
            log.warning("Postgres read falló: %s", e)
            raise

    def safe_select(self, sql: str, params: tuple | None = None) -> list[dict]:
        try:
            return self.run_select(sql, params)
        except Exception:
            return []

    def schema_summary(self) -> str:
        rows = self.safe_select(
            """
            SELECT table_name, column_name, data_type
            FROM information_schema.columns
            WHERE table_schema = 'public'
            ORDER BY table_name, ordinal_position
            """
        )
        lines: dict[str, list[str]] = {}
        for r in rows:
            lines.setdefault(r["table_name"], []).append(f"{r['column_name']}:{r['data_type']}")
        return "\n".join(f"- {t}: {', '.join(cols)}" for t, cols in lines.items())


postgres_reader = PostgresReader()
