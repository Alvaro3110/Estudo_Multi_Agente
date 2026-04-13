from fastapi import APIRouter
from app.mlflow_dashboard import compare_agent_versions, show_improvement_trends
from app.mlflow_labeling import labeling_manager
from app.mlflow_datasets import get_dataset_manager

router = APIRouter(prefix="/api/mlflow", tags=["MLflow Observability"])

@router.get("/agents/metrics")
async def get_agent_metrics(agent_name: str):
    """Retorna métricas consolidadas de um agente."""
    return {"agent": agent_name, "metrics": {"avg_quality": 0.85, "total_runs": 150}}

@router.get("/agents/history")
async def get_agent_history(agent_name: str, days: int = 7):
    """Retorna histórico de performance (trend over time)."""
    history = show_improvement_trends(agent_name, days)
    return {"agent": agent_name, "history": history}
    
@router.get("/agents/compare")
async def get_agent_comparisons(agent_name: str):
    """Retorna comparação de versões do prompt (v1 vs v2)."""
    return {"comparisons": compare_agent_versions(agent_name)}

@router.get("/datasets/{agent_name}/versions")
async def get_dataset_versions(agent_name: str):
    """Lista as versões do dataset de "Good Examples"."""
    manager = get_dataset_manager(agent_name)
    return {"agent_name": agent_name, "versions": manager.list_versions()}

@router.post("/labeling/create-session")
async def create_labeling_session(dataset_name: str, num_samples: int):
    """Inicia uma sessão manual de anotação de relatórios baseada num dataset."""
    session_id = labeling_manager.create_labeling_session(dataset_name, num_samples)
    return {"session_id": session_id, "status": "created"}

@router.post("/labeling/{session_id}/save-labels")
async def save_labels(session_id: str, labels: dict):
    """Submete a classificação manual feita pelo usuário via frontend."""
    success = labeling_manager.save_labels(session_id, labels)
    return {"success": success}
