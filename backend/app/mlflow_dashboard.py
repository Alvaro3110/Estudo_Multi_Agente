import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

def compare_agent_versions(agent_name: str) -> List[Dict[str, Any]]:
    """Compara performance de versões diferentes do mesmo agente."""
    # Na integração final, extrairia dados via mlflow.search_runs usando MLflowClient
    return [{"version": "v1.0", "avg_score": 0.82}, {"version": "v1.1", "avg_score": 0.88}]

def show_improvement_trends(agent_name: str, days: int = 7) -> List[Dict[str, Any]]:
    """Mostra tendência de melhoria (Score x Tempo)."""
    # Mock para frontend
    return [{"day": "2024-04-10", "score": 0.75}, {"day": "2024-04-11", "score": 0.85}]

def get_best_examples_by_agent() -> Dict[str, Any]:
    """Retorna os melhores exemplos armazenados consolidados por agente."""
    return {"financeiro": 12, "vendas": 8}
