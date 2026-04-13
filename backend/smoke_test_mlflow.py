import os
import dspy
import mlflow
import logging
from app.core.config import settings
from utils.mlflow_helper import inicializar_mlflow
from app.graph.models import GerarSQL

# Configuração de logs
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def smoke_test():
    # 1. Inicializa MLflow
    inicializar_mlflow()
    
    # 2. Configura um modelo simples (usando DSPy)
    # Se você tiver a API_KEY no .env, isso fará uma chamada real.
    # Caso contrário, o MLflow ainda registrará a tentativa e o rastro.
    logger.info("🎬 Iniciando Smoke Test de Rastreamento...")
    
    lm = dspy.LM("openai/gpt-4o-mini", api_key=os.environ.get("OPENAI_API_KEY", "fake-key"))
    
    with dspy.context(lm=lm):
        predictor = dspy.Predict(GerarSQL)
        
        # 3. Executa uma predição (Isso deve gerar um rastro no MLflow)
        try:
            with mlflow.start_run(run_name="Smoke-Test-Manual"):
                logger.info("📡 Chamando preditor DSPy (isso aparecerá no MLflow Traces)...")
                resultado = predictor(
                    schema_disponivel="Tabela: sales (colunas: id, amount, date)",
                    query="Qual o total de vendas?",
                    dominio_do_agente="Vendas"
                )
                logger.info(f"✅ Resultado obtido: {resultado.sql_query}")
        except Exception as e:
            logger.warning(f"⚠️ Ocorreu um erro no LLM (esperado se a key for inválida), mas o rastro deve estar no MLflow: {e}")

    logger.info("\n✨ Smoke Test concluído!")
    logger.info("Para ver o resultado, execute:")
    logger.info("cd backend && mlflow ui --backend-store-uri sqlite:///mlflow.db")

if __name__ == "__main__":
    smoke_test()
