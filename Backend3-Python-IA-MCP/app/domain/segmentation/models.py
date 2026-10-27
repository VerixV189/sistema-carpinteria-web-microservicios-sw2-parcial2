"""Dominio — segmentación de clientes (X-Means ≈ KMeans con k estimado, CU1)."""
from dataclasses import dataclass


@dataclass
class ClientFeatures:
    client_id: int
    total_orders: int
    total_spent: float
    recency_days: float


@dataclass
class ClientCluster:
    cluster_id: int
    label: str
    client_ids: list[int]
    centroid: dict
    size: int
