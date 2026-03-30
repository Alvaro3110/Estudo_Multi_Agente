import os
import dspy
import logging
from dotenv import load_dotenv

logger = logging.getLogger(__name__)
load_dotenv()

# ==========================================
# MODELOS DISPONÍVEIS (OpenAI + Databricks)
# ==========================================
MODELOS_DISPONIVEIS = {
    "GPT-4o Mini (OpenAI)": {
        "id": "openai/gpt-4o-mini",
        "api_key_env": "OPENAI_API_KEY",
        "provider": "openai"
    },
    "GPT-4o (OpenAI)": {
        "id": "openai/gpt-4o",
        "api_key_env": "OPENAI_API_KEY",
        "provider": "openai"
    },
    "GPT-4.1 Mini (OpenAI)": {
        "id": "openai/gpt-4.1-mini",
        "api_key_env": "OPENAI_API_KEY",
        "provider": "openai"
    },
    "DBRX Instruct (Databricks)": {
        "id": "databricks/databricks-dbrx-instruct",
        "api_key_env": "DATABRICKS_TOKEN",
        "api_base": "DATABRICKS_HOST",
        "provider": "databricks"
    },
    "Meta Llama 3.1 70B (Databricks)": {
        "id": "databricks/databricks-meta-llama-3-1-70b-instruct",
        "api_key_env": "DATABRICKS_TOKEN",
        "api_base": "DATABRICKS_HOST",
        "provider": "databricks"
    },
    "Meta Llama 4 Maverick (Databricks)": {
        "id": "databricks/databricks-meta-llama-4-maverick",
        "api_key_env": "DATABRICKS_TOKEN",
        "api_base": "DATABRICKS_HOST",
        "provider": "databricks"
    },
}

def configurar_modelo(nome_modelo: str = "GPT-4o Mini (OpenAI)", set_global: bool = False):
    """Configura o DSPy com o modelo selecionado. Suporta OpenAI e Databricks."""
    config = MODELOS_DISPONIVEIS.get(nome_modelo)
    if not config:
        logger.error(f"Modelo desconhecido: {nome_modelo}")
        config = MODELOS_DISPONIVEIS["GPT-4o Mini (OpenAI)"]
    
    model_id = config["id"]
    key = os.environ.get(config["api_key_env"], "")
    
    # Parâmetros padrão do Master Prompt
    params = {
        "max_tokens": 4096,
        "temperature": 0.2,
        "cache": True
    }
    
    if config["provider"] == "databricks":
        base_url = os.environ.get(config.get("api_base", ""), "")
        if base_url:
            base_url = f"{base_url}/serving-endpoints"
        llm = dspy.LM(model_id, api_key=key, api_base=base_url, **params)
    else:
        llm = dspy.LM(model_id, api_key=key, **params)
    
    if set_global:
        try:
            dspy.set_settings(lm=llm)
            logger.info(f"[Config] Global: Modelo ativo -> {nome_modelo}")
        except Exception as e:
            logger.warning(f"[Config] Aviso de Threading no Global: {e}. DSPy Settings permanecerão locais.")
            dspy.settings.lm = llm
            
    return llm
