import os
import mlflow
import mlflow.dspy
import mlflow.langchain
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

def inicializar_mlflow():
    """
    Inicializa o rastreamento do MLflow e ativa o autologging.
    """
    try:
        # Configuração de Tracking Local (SQLite) para liberar Model Registry e genai API
        mlflow.set_tracking_uri("sqlite:///mlruns.db")
        mlflow.set_registry_uri("sqlite:///mlruns.db")
        mlflow.set_experiment(settings.MLFLOW_EXPERIMENT_NAME)
        
        # Ativa Autologging
        mlflow.dspy.autolog()
        logger.info("📊 MLflow DSPy Autologging ativado.")
        
        mlflow.langchain.autolog()
        logger.info("📊 MLflow LangChain Autologging ativado.")
        
        # Tagging global para evolução
        mlflow.set_tag("system_version", os.environ.get("SYSTEM_VERSION", "v1.0.0"))
        
        logger.info(f"🚀 MLflow inicializado em: {settings.MLFLOW_TRACKING_URI}")
        logger.info(f"📁 Experimento: {settings.MLFLOW_EXPERIMENT_NAME}")
        
    except Exception as e:
        logger.error(f"❌ Falha ao inicializar MLflow: {e}")
        
        logger.info(f"🚀 MLflow inicializado em: {settings.MLFLOW_TRACKING_URI}")
        logger.info(f"📁 Experimento: {settings.MLFLOW_EXPERIMENT_NAME}")
        
    except Exception as e:
        logger.error(f"❌ Falha ao inicializar MLflow: {e}")
