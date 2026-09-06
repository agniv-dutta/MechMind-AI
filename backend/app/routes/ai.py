from fastapi import APIRouter, HTTPException, Body
from datetime import datetime
import time

from app.config import settings
from app.services.ai_service import AIService
from app.services.llm_config import (
    effective_llm_config, save_llm_config, load_llm_config
)

router = APIRouter()


@router.get("/config")
async def get_ai_config():
    """Return current AI provider configuration for the settings UI"""
    config = effective_llm_config()
    config["updated_at"] = datetime.now().isoformat()
    return config


@router.get("/models")
async def list_models():
    """List available Groq models"""
    config = effective_llm_config()
    return {
        "provider": "groq",
        "models": settings.groq_models_list,
        "default": config.get("model", settings.GROQ_MODEL)
    }


@router.post("/config")
async def update_ai_config(payload: dict = Body(...)):
    """Persist provider/model overrides selected in the UI"""
    allowed = {"provider", "model"}
    if not isinstance(payload, dict) or not all(k in allowed for k in payload):
        raise HTTPException(status_code=422, detail=f"Only {sorted(allowed)} keys are supported")
    provider = payload.get("provider")
    if provider and provider not in ("groq", "openai"):
        raise HTTPException(status_code=422, detail="Provider must be 'groq' or 'openai'")
    saved = save_llm_config(payload)
    return {"config": saved, "message": "AI configuration saved successfully"}


@router.post("/test")
async def test_ai_connection(payload: dict = Body(default=None)):
    """Test connectivity to the configured LLM provider"""
    model = (payload or {}).get("model")
    try:
        if model:
            # Test with an explicit model (used by the UI before saving)
            ai_service = AIService(model=model)
        else:
            ai_service = AIService()
        result = ai_service.test_connection()
        if not result.get("success"):
            raise HTTPException(status_code=502, detail=result.get("message", "Connection test failed"))
        result["provider"] = ai_service.provider
        result["message"] = "Connection successful"
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Connection test failed: {str(e)}")