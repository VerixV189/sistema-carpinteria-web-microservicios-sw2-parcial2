"""Adaptador OUT — MongoDB read (cotizaciones para reportes CU7)."""
import logging

from pymongo import MongoClient

from app.infrastructure.config.settings import settings

log = logging.getLogger("mongo")


def quotations_collection():
    try:
        client = MongoClient(settings.mongo_uri, serverSelectionTimeoutMS=3000)
        return client["carpinteria"]["quotations"]
    except Exception as e:
        log.warning("Mongo no disponible: %s", e)
        return None


def list_quotations(limit: int = 50) -> list[dict]:
    col = quotations_collection()
    if col is None:
        return []
    try:
        docs = list(col.find().sort("createdAt", -1).limit(limit))
        for d in docs:
            d["_id"] = str(d["_id"])
        return docs
    except Exception:
        return []
