"""Adaptador REST (entrada) — endpoints /ai/*."""
import base64
import binascii

from fastapi import APIRouter, Header, HTTPException, Query, Response
from pydantic import AliasChoices, BaseModel, Field, field_validator

from app.application.agent import agent_answer
from app.application.check_delivery import check_delivery_date
from app.application.cluster_clients import cluster_clients_usecase
from app.application.estimate_furniture import estimate_furniture
from app.application.generate_report import generate_report
from app.infrastructure.messaging import rabbitmq

router = APIRouter(prefix="/ai", tags=["ai"])

# Upload hardening: las fotos entran como base64 en JSON — límite 7MB
# (≈5MB binario) y solo JPEG/PNG/WebP/GIF reales (magic bytes).
MAX_B64_LEN = 7 * 1024 * 1024
_MAGIC = (b"\xff\xd8\xff", b"\x89PNG\r\n\x1a\n", b"RIFF", b"GIF8")


def _valid_image_b64(v: str | None) -> str | None:
    if v is None:
        return v
    if "," in v[:64]:  # data URL → quitar el prefijo
        v = v.split(",", 1)[1]
    if len(v) > MAX_B64_LEN:
        raise ValueError("Imagen supera el límite de 5MB")
    try:
        raw = base64.b64decode(v, validate=True)
    except (binascii.Error, ValueError):
        raise ValueError("imageBase64 no es base64 válido")
    if not any(raw.startswith(m) for m in _MAGIC):
        raise ValueError("Solo se aceptan imágenes JPEG/PNG/WebP/GIF")
    return v


class ClassifyRequest(BaseModel):
    description: str | None = None
    imageBase64: str | None = None

    _check_img = field_validator("imageBase64")(_valid_image_b64)


class PredictPriceRequest(BaseModel):
    furnitureType: str
    woodType: str | None = None
    dimensions: dict | None = None


class EstimateRequest(BaseModel):
    description: str | None = None
    imageBase64: str | None = None
    furnitureType: str | None = None
    woodType: str | None = None
    dimensions: dict | None = None

    _check_img = field_validator("imageBase64")(_valid_image_b64)


class ReportRequest(BaseModel):
    query: str


class AgentRequest(BaseModel):
    query: str
    # memoria de conversación (A3) — acepta ambos estilos de cliente
    session_id: str | None = Field(
        default=None, validation_alias=AliasChoices("session_id", "sessionId"))


@router.post("/classify-furniture")
def classify(req: ClassifyRequest):
    est = estimate_furniture(description=req.description, image_base64=req.imageBase64)
    return {"furnitureType": est.furniture_type.value, "confidence": est.confidence}


@router.post("/predict-price")
def predict_price(req: PredictPriceRequest):
    est = estimate_furniture(
        furniture_type=req.furnitureType,
        wood_type=req.woodType,
        dimensions=req.dimensions,
    )
    return {
        "estimatedPrice": est.estimated_price,
        "currency": est.currency,
        "factors": est.factors,
        "furnitureType": est.furniture_type.value,
        "confidence": est.confidence,
    }


@router.post("/estimate")
def estimate(req: EstimateRequest):
    """Combinación usada por quotation-payment-service (CU3)."""
    est = estimate_furniture(
        description=req.description,
        image_base64=req.imageBase64,
        furniture_type=req.furnitureType,
        wood_type=req.woodType,
        dimensions=req.dimensions,
    )
    rabbitmq.publish("estimation.completed", {
        "furnitureType": est.furniture_type.value,
        "estimatedPrice": est.estimated_price,
    })
    return {
        "furnitureType": est.furniture_type.value,
        "confidence": est.confidence,
        "estimatedPrice": est.estimated_price,
        "currency": est.currency,
        "factors": est.factors,
    }


@router.get("/delivery/check")
def delivery_check(date: str = Query(..., description="YYYY-MM-DD")):
    return check_delivery_date(date)


@router.post("/cluster-clients")
def cluster_clients():
    return cluster_clients_usecase()


@router.post("/report")
def report(req: ReportRequest):
    result = generate_report(req.query)
    return {
        "query": result.query,
        "sql": result.sql,
        "rows": result.rows,
        "narrative": result.narrative,
        "source": result.source,
    }


@router.post("/agent")
def agent(req: AgentRequest,
          x_user_role: str | None = Header(None),
          x_user_email: str | None = Header(None)):
    """CU4 — agente inteligente: interpreta NL y actúa vía tools/GraphQL.
    El gateway inyecta x-user-role/x-user-email tras validar el JWT;
    llamadas internas (n8n, sin rol) conservan acceso completo."""
    return agent_answer(req.query, session_id=req.session_id,
                        role=x_user_role, user_email=x_user_email)


class TtsRequest(BaseModel):
    text: str


@router.post("/tts")
def tts(req: TtsRequest):
    """Texto → audio MP3 (ElevenLabs). 503 si no hay ELEVENLABS_API_KEY."""
    from app.infrastructure.tts.elevenlabs_adapter import synthesize

    audio = synthesize(req.text)
    if audio is None:
        raise HTTPException(503, "TTS no configurado (ELEVENLABS_API_KEY ausente) o ElevenLabs falló")
    return Response(content=audio, media_type="audio/mpeg")
