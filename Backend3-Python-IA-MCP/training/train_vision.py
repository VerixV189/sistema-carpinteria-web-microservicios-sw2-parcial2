"""Fine-tuning YOLOv8n-cls sobre training/dataset → models/furniture-cls.onnx.

Requiere: pip install -r training/requirements-train.txt  (entorno de
entrenamiento — torch NO entra al contenedor de producción; el artefacto
final es ONNX y corre con onnxruntime).

Uso:  python training/train_vision.py [--epochs 15]
"""
from __future__ import annotations

import argparse
import logging
import shutil
from pathlib import Path

log = logging.getLogger("train_vision")
logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")

ROOT = Path(__file__).resolve().parent.parent
DATASET = ROOT / "training" / "dataset"
MODELS = ROOT / "models"
OUT_ONNX = MODELS / "furniture-cls.onnx"
CLASSES_TXT = MODELS / "furniture-classes.txt"


def train(epochs: int) -> Path:
    try:
        from ultralytics import YOLO
    except ImportError:
        raise SystemExit(
            "ultralytics no instalado. pip install -r training/requirements-train.txt")
    if not DATASET.exists() or len(list(DATASET.iterdir())) < 3:
        raise SystemExit(f"Dataset vacío: corre download_dataset.py primero ({DATASET})")

    # Ultralytics cls espera estructura dataset/train/<cls>/ y val/<cls>/.
    # Split 85/15 dentro de una carpeta temporal.
    split_dir = ROOT / "training" / "dataset_split"
    if split_dir.exists():
        shutil.rmtree(split_dir)
    import random
    rng = random.Random(42)
    for cls_dir in DATASET.iterdir():
        if not cls_dir.is_dir():
            continue
        imgs = sorted(cls_dir.glob("*.jpg"))
        rng.shuffle(imgs)
        cut = max(1, int(len(imgs) * 0.85))
        for i, img in enumerate(imgs):
            dst = split_dir / ("train" if i < cut else "val") / cls_dir.name
            dst.mkdir(parents=True, exist_ok=True)
            (dst / img.name).write_bytes(img.read_bytes())
    counts = {d.name: len(list(d.glob('*/*.jpg'))) for d in split_dir.iterdir()}
    log.info("Split: %s", counts)

    model = YOLO("yolov8n-cls.pt")  # pesos preentrenados ImageNet (~5MB)
    model.train(data=str(split_dir), epochs=epochs, imgsz=224, batch=16,
                device="cpu", workers=0, verbose=False)

    exported = model.export(format="onnx", imgsz=224, half=False)
    MODELS.mkdir(exist_ok=True)
    shutil.move(str(exported), OUT_ONNX)

    classes = sorted(p.name for p in (split_dir / "train").iterdir() if p.is_dir())
    CLASSES_TXT.write_text("\n".join(classes))
    log.info("Clases: %s", classes)
    log.info("Modelo ONNX → %s (%.1f MB)", OUT_ONNX, OUT_ONNX.stat().st_size / 1e6)

    metrics = model.val()
    log.info("top-1 accuracy: %.3f", getattr(metrics, "top1", 0))
    return OUT_ONNX


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--epochs", type=int, default=15)
    args = ap.parse_args()
    train(args.epochs)
