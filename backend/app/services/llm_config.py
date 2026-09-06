import os
import json
from typing import Optional

from app.config import settings

LLM_CONFIG_PATH = "./data/llm_config.json"


def load_llm_config() -> dict:
    """Load user-selected LLM overrides (provider/model) persisted to disk"""
    config = {}
    try:
        if os.path.exists(LLM_CONFIG_PATH):
            with open(LLM_CONFIG_PATH, 'r', encoding='utf-8') as f:
                config = json.load(f)
    except Exception as e:
        print(f"Error loading LLM config: {e}")
    return config


def save_llm_config(config: dict) -> dict:
    """Persist LLM overrides, returning the merged config"""
    merged = {"provider": settings.LLM_PROVIDER, "model": settings.GROQ_MODEL}
    for key in ("provider", "model"):
        if key in config and config[key]:
            merged[key] = str(config[key]).strip()
    os.makedirs("./data", exist_ok=True)
    with open(LLM_CONFIG_PATH, 'w', encoding='utf-8') as f:
        json.dump(merged, f, indent=2)
    return merged


def effective_llm_config() -> dict:
    """Effective runtime config (env settings overlaid with persisted overrides)"""
    overrides = load_llm_config()
    provider = overrides.get("provider", settings.LLM_PROVIDER)
    model = overrides.get("model", settings.GROQ_MODEL)
    key_configured = bool(settings.GROQ_API_KEY) if provider == "groq" else bool(settings.OPENAI_API_KEY)
    return {
        "provider": provider,
        "model": model,
        "mode": ("groq" if key_configured else "offline"),
        "api_key_configured": key_configured,
        "available_models": settings.groq_models_list,
        "temperature": 0.7,
        "max_tokens": 2048,
    }