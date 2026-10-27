"""CU1 — Segmentación de clientes (X-Means/KMeans) sobre pedidos reales."""
from app.domain.segmentation.models import ClientFeatures
from app.infrastructure.ml.client_clusterer import cluster_clients
from app.infrastructure.persistence.postgres_reader import postgres_reader

SQL = """
SELECT c.id AS client_id,
       COUNT(o.id) AS total_orders,
       COALESCE(SUM(o.total_price), 0) AS total_spent,
       COALESCE(EXTRACT(DAY FROM NOW() - MAX(o.created_at)), 365) AS recency_days
FROM clients c
LEFT JOIN orders o ON o.client_id = c.id
GROUP BY c.id
"""


def cluster_clients_usecase() -> dict:
    rows = postgres_reader.safe_select(SQL)
    features = [
        ClientFeatures(
            client_id=r["client_id"],
            total_orders=int(r["total_orders"]),
            total_spent=float(r["total_spent"]),
            recency_days=float(r["recency_days"]),
        )
        for r in rows
    ]
    clusters = cluster_clients(features)
    return {
        "algorithm": "X-Means (KMeans + silhouette, k estimado)",
        "clusters": [
            {
                "clusterId": c.cluster_id,
                "label": c.label,
                "size": c.size,
                "clientIds": c.client_ids,
                "centroid": c.centroid,
            }
            for c in clusters
        ],
    }
