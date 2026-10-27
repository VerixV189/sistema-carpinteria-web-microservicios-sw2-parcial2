# Training — artefactos ML locales del ai-service

Todo el pipeline corre **offline** y produce artefactos que el servicio
carga en runtime (sin torch en la imagen de producción).

## Artefactos producidos (commiteados en `../models/`)

| Archivo | Origen | Consumidor |
|---|---|---|
| `furniture-cls.onnx` | `train_vision.py` (YOLOv8n-cls fine-tuned) | `vision/yolo_classifier.py` |
| `furniture-classes.txt` | `train_vision.py` | ídem (orden de etiquetas) |
| `price_model.joblib` | `train_price_model.py` (GradientBoosting) | `ml/price_model.py` |

Si un artefacto falta, el servicio degrada limpio a keywords/factores.

## Setup

```bash
python -m venv .venv-train
.venv-train\Scripts\pip install -r requirements-train.txt   # torch+ultralytics (~3GB)
```

## 1. Dataset de visión (Wikimedia Commons)

```bash
python download_dataset.py            # ~80 imgs/clase × 9 tipos → dataset/
```

Las clases se mapean a `FurnitureType` del dominio. `dataset/` y
`dataset_split/` están gitignored — no se commitean.

## 2. Fine-tune YOLO-cls → ONNX

```bash
python train_vision.py                # CPU ~1h → ../models/furniture-cls.onnx
```

15 épocas sobre `yolov8n-cls.pt` preentrenado (ImageNet). Exporta ONNX —
el runtime solo necesita `onnxruntime`.

**Ojo**: el ONNX de ultralytics embebe la normalización ImageNet en el
grafo — el preproceso del servicio es resize borde-menor→224 + crop
centrado + `/255`, SIN normalizar (verificado: ~93% acc en muestreo).

## 3. Modelo de precio → joblib

```bash
python train_price_model.py           # → ../models/price_model.joblib
```

Lee `order_items` reales de PostgreSQL si está accesible; si no, genera
un dataset sintético con la misma distribución (tipo/madera/volumen→Bs).

## OCR (sin entrenamiento)

Tesseract es binario del sistema: `apt install tesseract-ocr` (Dockerfile)
o https://github.com/UB-Mannheim/tesseract/wiki en Windows — configurable
con `TESSERACT_CMD`. Extrae dimensiones (`1.80x0.90`, `Largo: 2.10m`) y
madera de etiquetas fotografiadas; ver `vision/ocr_adapter.py`.
