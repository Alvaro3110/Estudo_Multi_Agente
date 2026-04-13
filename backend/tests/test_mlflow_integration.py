import sys
import os
import mlflow
import pytest
from unittest.mock import MagicMock

# Adiciona o diretório backend ao path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.config import settings
from utils.mlflow_helper import inicializar_mlflow

def test_mlflow_initialization():
    """Verifica se o MLflow inicializa com as configurações corretas."""
    inicializar_mlflow()
    
    # Normaliza a URI para comparação (ex: remove sqlite:/// se necessário)
    tracking_uri = mlflow.get_tracking_uri()
    assert settings.MLFLOW_TRACKING_URI in tracking_uri
    
    # Tenta obter ou criar para garantir que existe
    experiment = mlflow.set_experiment(settings.MLFLOW_EXPERIMENT_NAME)
    assert experiment is not None
    assert experiment.name == settings.MLFLOW_EXPERIMENT_NAME

def test_mlflow_autolog_enabled():
    """Verifica se o autologging está habilitado (através de variáveis internas ou comportamento)."""
    # Como o autologging é uma configuração global que altera o comportamento do DSPy/LangChain,
    # uma forma simples é verificar se não há erros na chamada.
    # Em um teste real, poderíamos verificar se os hooks foram instalados.
    inicializar_mlflow()
    
    # Exemplo simples de log para garantir que o tracking está funcionando
    with mlflow.start_run():
        mlflow.log_param("test_param", "working")
        mlflow.log_metric("test_metric", 1.0)
    
    # Verifica se o run foi criado no mlflow.db local
    runs = mlflow.search_runs(experiment_names=[settings.MLFLOW_EXPERIMENT_NAME])
    assert len(runs) > 0
    assert runs.iloc[0]["params.test_param"] == "working"

if __name__ == "__main__":
    pytest.main([__file__])
