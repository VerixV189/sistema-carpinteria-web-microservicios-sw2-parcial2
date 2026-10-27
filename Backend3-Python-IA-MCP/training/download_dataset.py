"""Descarga el dataset de muebles desde Wikimedia Commons (fuente abierta).

Estructura YOLO-cls:  training/dataset/<CLASE>/*.jpg
Uso:  python training/download_dataset.py [--per-class 80]
"""
from __future__ import annotations

import argparse
import io
import logging
import random
import time
from pathlib import Path

import httpx

log = logging.getLogger("dataset")
logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")

# Clase del sistema → queries de Commons (categorías de muebles reales)
QUERIES: dict[str, list[str]] = {
    "WARDROBE":        ["wardrobe furniture", "armoire", "closet wooden"],
    "TABLE":           ["dining table wooden", "table furniture", "wooden table"],
    "CHAIR":           ["wooden chair", "chair furniture", "dining chair"],
    "DESK":            ["desk furniture", "office desk", "writing desk wooden"],
    "BOOKSHELF":       ["bookshelf", "bookcase furniture", "shelving unit"],
    "KITCHEN_CABINET": ["kitchen cabinets", "kitchen furniture cabinet"],
    "DOOR":            ["wooden door", "carved door", "interior door"],
    "BED":             ["bed furniture wooden", "wooden bed frame"],
    "OTHER":           ["furniture", "wooden furniture", "furniture piece"],
}

DATASET = Path(__file__).resolve().parent / "dataset"
_UA = {"User-Agent": "carpinteria-train/1.0 (educational; contact: demo@carpinteria.local)"}


def _commons_files(query: str, limit: int) -> list[str]:
    """Títulos File: de Commons para la query (API pública, sin key)."""
    r = httpx.get("https://commons.wikimedia.org/w/api.php", headers=_UA, timeout=20, params={
        "action": "query", "format": "json", "generator": "search",
        "gsrsearch": f"filetype:bitmap {query}", "gsrnamespace": 6,
        "gsrlimit": limit, "prop": "imageinfo", "iiprop": "url",
        "iiurlwidth": 640,
    })
    pages = (r.json().get("query") or {}).get("pages") or {}
    urls = []
    for p in pages.values():
        info = (p.get("imageinfo") or [{}])[0]
        urls.append(info.get("thumburl") or info.get("url") or "")
    return [u for u in urls if u.split("?")[0].lower().endswith((".jpg", ".jpeg"))]


def _valid_jpg(raw: bytes) -> bool:
    try:
        from PIL import Image
        img = Image.open(io.BytesIO(raw))
        img.verify()
        w, h = Image.open(io.BytesIO(raw)).size
        return w >= 100 and h >= 100
    except Exception:
        return False


def download(per_class: int) -> None:
    DATASET.mkdir(exist_ok=True)
    for cls, queries in QUERIES.items():
        out_dir = DATASET / cls
        out_dir.mkdir(exist_ok=True)
        have = len(list(out_dir.glob("*.jpg")))
        if have >= per_class:
            log.info("%-15s ya tiene %d", cls, have)
            continue
        urls: list[str] = []
        for q in queries:
            try:
                urls += _commons_files(q, per_class)
            except Exception as e:
                log.warning("query '%s' falló: %s", q, e)
            if len(urls) >= per_class * 2:
                break
        random.shuffle(urls)
        n = 0
        for url in urls:
            if have + n >= per_class:
                break
            try:
                raw = httpx.get(url, headers=_UA, timeout=30, follow_redirects=True).content
                if not _valid_jpg(raw):
                    continue
                (out_dir / f"{cls.lower()}_{have + n:04d}.jpg").write_bytes(raw)
                n += 1
            except Exception:
                continue
            time.sleep(0.05)
        log.info("%-15s %d imágenes", cls, have + n)


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--per-class", type=int, default=80)
    args = ap.parse_args()
    download(args.per_class)
    total = sum(len(list((DATASET / c).glob("*.jpg"))) for c in QUERIES if (DATASET / c).exists())
    log.info("Total: %d imágenes en %s", total, DATASET)
