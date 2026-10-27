# ai-service

IA, ML y Servidor MCP — **Python FastAPI + Ollama + MCP SDK**. Cubre **CU3** (estimación), **CU4** (check_delivery_date), **CU7** (reportes NL) y **CU1** (clustering).

- REST `:8100` — `/ai/classify-furniture`, `/ai/predict-price`, `/ai/estimate`, `/ai/report`, `/ai/delivery/check`, `/ai/cluster-clients`
- MCP SSE `:8110` — tools: `estimate_furniture_cost`, `optimize_wood_cuts`, `check_delivery_date`, `generate_report`, `search_inventory` · resources: `carpinteria://catalogo/{categoria}`, `carpinteria://inventario/resumen` · prompt: `carpenter_assistant`
- Ollama (Llama 3.2 3B) para planificación del agente/Text-to-SQL con fallback determinista
- Postgres read-only (whitelist de plantillas SQL) + MongoDB read

## Stack IA local (todo corre sin red en el contenedor)

| Pieza | Implementación | Artefacto |
|---|---|---|
| Clasificación de mueble | YOLOv8n-cls fine-tuned (9 clases, ~93% acc) | `models/furniture-cls.onnx` |
| OCR de etiquetas | Tesseract (`apt`) → dimensiones + madera | binario sistema |
| Fusión multi-señal | visión + OCR + keywords con política de desacuerdo | `vision/fusion.py` |
| Precio | GradientBoosting (tipo/madera/volumen→Bs) | `models/price_model.joblib` |
| Agente LLM | Ollama → Groq (key válida) → heurística regex | — |
| Respaldo visión | Gemini (solo si hay `GEMINI_API_KEY`) | — |

Pipeline de re-entrenamiento documentado en `training/README.md`.

## Dev

```bash
cp .env.example .env
python -m venv .venv && .venv/Scripts/activate   # Windows
pip install -r requirements.txt
python main.py          # REST :8100 + MCP :8110
```

Probar MCP: conectar un cliente MCP a `http://localhost:8110/sse`.

## Atajos documentados

| En vez de | Implementado |
|-----------|--------------|
| Text-to-SQL libre | Whitelist de plantillas + LLM valida SELECT |
| Prophet | Promedio móvil en `client_clusterer.moving_average` |

Fallbacks activos: sin `models/*.onnx` la clasificación cae a keywords;
sin `price_model.joblib` el precio usa regresión por factores — el
servicio nunca falla por artefactos ausentes.
