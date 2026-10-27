"""Adaptador OUT — clustering de clientes (CU1).

X-Means estima k automáticamente; usamos KMeans probando k=2..5 y
eligiendo por silhouette (documentado como atajo del plan).
"""
import logging
import math

import numpy as np
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
from sklearn.preprocessing import StandardScaler

from app.domain.segmentation.models import ClientCluster, ClientFeatures

log = logging.getLogger("clusterer")

LABELS = ["ESTÁNDAR", "VALIOSOS", "EN RIESGO", "NUEVOS", "VIP"]


def cluster_clients(features: list[ClientFeatures], max_k: int = 5) -> list[ClientCluster]:
    if len(features) < 3:
        return [ClientCluster(0, "ÚNICOS", [f.client_id for f in features], {}, len(features))]

    X = np.array([[f.total_orders, f.total_spent, f.recency_days] for f in features], dtype=float)
    Xs = StandardScaler().fit_transform(X)

    best_k, best_score, best_labels = 2, -1.0, None
    for k in range(2, min(max_k, len(features) - 1) + 1):
        km = KMeans(n_clusters=k, n_init=10, random_state=42).fit(Xs)
        try:
            score = silhouette_score(Xs, km.labels_)
        except Exception:
            score = -1
        if score > best_score:
            best_k, best_score, best_labels = k, score, km.labels_

    clusters: list[ClientCluster] = []
    for c in range(best_k):
        members = [f for i, f in enumerate(features) if best_labels[i] == c]
        if not members:
            continue
        centroid = {
            "total_orders": round(float(np.mean([m.total_orders for m in members])), 2),
            "total_spent": round(float(np.mean([m.total_spent for m in members])), 2),
            "recency_days": round(float(np.mean([m.recency_days for m in members])), 2),
        }
        # Etiqueta heurística: gasto alto + recencia baja → VALIOSOS/VIP
        spent_rank = centroid["total_spent"]
        label = LABELS[min(c, len(LABELS) - 1)]
        if spent_rank > 15000:
            label = "VIP"
        elif centroid["recency_days"] > 90:
            label = "EN RIESGO"
        clusters.append(ClientCluster(c, label, [m.client_id for m in members], centroid, len(members)))
    return clusters


def moving_average(series: list[float], window: int = 3) -> list[float]:
    """Atajo documentado: promedio móvil en lugar de Prophet."""
    if not series:
        return []
    return [
        float(np.mean(series[max(0, i - window + 1): i + 1]))
        for i in range(len(series))
    ]
