import mlflow
import contextlib
import logging
from typing import Dict, Any, Generator

# Importações lazy para evitar loops se os modulos de config forem chamados circularmente
logger = logging.getLogger(__name__)

@contextlib.contextmanager
def start_agent_span(agent_name: str, run_name: str = None) -> Generator[mlflow.ActiveRun, None, None]:
    """
    Context manager para envolver a execução de um agente em um 'Run'/Span do MLflow.
    Automaticamente aponta para o experimento correto do agente.
    """
    from app.mlflow_config import mlflow_config_manager
    mlflow_config_manager.set_active_agent(agent_name)
    
    run_name = run_name or f"Execution_{agent_name}"
    
    with mlflow.start_run(run_name=run_name, nested=True) as run:
        mlflow.set_tag("agent_type", agent_name)
        try:
            yield run
        except Exception as e:
            mlflow.set_tag("error", str(e))
            raise

def log_agent_metrics(agent_name: str, report: Dict[str, Any], quality_score: float, token_count: int = 0, latency: float = 0.0):
    """
    Loga as métricas extraídas de uma execução de agente diretamente no run ativo.
    """
    try:
        if quality_score:
            mlflow.log_metric("quality_score", quality_score)
        if token_count > 0:
            mlflow.log_metric("tokens_used", token_count)
        if latency > 0.0:
            mlflow.log_metric("latency_seconds", latency)
            
        # Pode logar o payload do report como um dict json nos params
        num_insights = len(report.get("insights", []))
        mlflow.log_metric("num_insights", num_insights)
    except Exception as e:
        logger.warning(f"Falha ao logar métricas do agente {agent_name}: {e}")

def get_active_prompt_version(agent_name: str) -> str:
    """Extrai a versão ativa do prompt para aquele agente (mock por agora, será integrado depois)."""
    return "v1.0.0"

def evaluate_report(agent_name: str, report: Dict[str, Any]) -> float:
    """
    Chama os Judges para calcular o score de qualidade.
    Por enquanto retorna um valor mockado até a implementação dos judges complexos.
    """
    # Aqui posteriormente você integraria com app.mlflow_judges.ReportJudge
    # Por hora, logica básica: report com insights pontua alto.
    score = 0.5
    if report:
        if report.get("insights", []):
            score += 0.3
        if report.get("metrics", {}):
            score += 0.2
    return score

def save_good_example(agent_name: str, input_data: Dict[str, Any], report: Dict[str, Any], score: float):
    """
    Loga este report como um artefato "bom exemplo" no Databricks.
    Será consolidado depois pelo DatasetManager.
    """
    if score < 0.85:
        return
        
    try:
        # Extrair conteúdo e logar como text artifact
        import json
        example_payload = {
            "input": input_data,
            "output": report,
            "score": score
        }
        filename = f"good_examples/{agent_name}_example_{score:.2f}.json"
        
        # log_dict é util para JSON
        mlflow.log_dict(example_payload, filename)
        logger.info(f"✅ Exemplo de alta qualidade (score {score}) salvo para o {agent_name}.")
    except Exception as e:
        logger.warning(f"Falha ao salvar 'good example' para {agent_name}: {e}")
