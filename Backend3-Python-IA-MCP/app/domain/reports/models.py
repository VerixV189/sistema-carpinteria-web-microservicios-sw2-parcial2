"""Dominio — reportes: resultado de una consulta en lenguaje natural (CU7)."""
from dataclasses import dataclass, field


@dataclass
class ReportResult:
    query: str
    sql: str
    rows: list[dict]
    narrative: str
    source: str = "template"  # template | llm | fallback


@dataclass
class ReportTemplate:
    """Plantilla SQL parametrizable (atajo seguro vs Text-to-SQL libre)."""
    name: str
    keywords: list[str]
    sql: str
    description: str = ""
    params: list[str] = field(default_factory=list)
