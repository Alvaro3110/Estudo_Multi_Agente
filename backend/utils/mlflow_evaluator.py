import os
import json
import pandas as pd
import mlflow
import logging
from app.core.config import settings
from utils.mlflow_helper import inicializar_mlflow
from app.engine import compilar_multi_agentes

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def evaluate_agent():
    """
    Executa uma avaliação completa do agente usando MLflow Evaluate.
    """
    inicializar_mlflow()
    
    # 1. Carrega o Dataset de Avaliação
    dataset_path = "tests/eval_dataset.json"
    with open(dataset_path, "r") as f:
        eval_data = json.load(f)
    
    df = pd.DataFrame(eval_data)
    
    # 2. Define a função de inferência (Wrapper para o LangGraph)
    def agent_inference(inputs):
        app = compilar_multi_agentes()
        results = []
        for i, row in inputs.iterrows():
            config = {"configurable": {"thread_id": f"eval_{i}"}}
            state_input = {
                "query": row["query"],
                "department_id": row["department_id"],
                "modelo_selecionado": "GPT-4o Mini (OpenAI)",
                "prompt_version": os.environ.get("PROMPT_VERSION", "v1.0")
            }
            # Roda o grafo até o final
            final_state = app.invoke(state_input, config=config)
            
            # Captura a consolidação final e as queries geradas
            results.append({
                "report": final_state.get("consolidacao_final", ""),
                "sql": json.dumps(final_state.get("queries_geradas", {}))
            })
        return pd.DataFrame(results)

        # Define a métrica customizada como parte do mlflow.evaluate
        def sql_accuracy_metric(eval_df):
            # Função placeholder para lógica mais complexa se necessário
            return [1.0] * len(eval_df)

        result = mlflow.evaluate(
            model=agent_inference,
            data=df,
            targets="expected_tables",
            model_type="text",
            evaluators="default"
        )
        
        logger.info(f"📊 Avaliação Concluída! Métricas: {result.metrics}")

if __name__ == "__main__":
    evaluate_agent()
