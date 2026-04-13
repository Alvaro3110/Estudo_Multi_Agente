from fastapi import APIRouter
from app.prompts_manager import prompts_manager as pm

router = APIRouter(prefix="/api/prompts", tags=["prompts"])

@router.get("/agents/{agent_name}/versions")
async def get_prompt_versions(agent_name: str):
    """Retorna histórico de todas as versões"""
    return pm.get_prompt_history(agent_name)

@router.get("/agents/{agent_name}/current")
async def get_current_prompt(agent_name: str):
    """Retorna a versão em produção"""
    return {
        "agent_name": agent_name,
        "current_version": pm.current_versions.get(agent_name),
        "prompt_text": pm.get_prompt_text(agent_name)
    }

@router.get("/agents/{agent_name}/compare")
async def compare_prompts(agent_name: str, v1: str, v2: str):
    """Compara 2 versões"""
    return pm.compare_versions(agent_name, v1, v2)

@router.post("/agents/{agent_name}/new-version")
async def create_new_version(agent_name: str, prompt_text: str):
    """Cria nova versão de prompt"""
    version = pm.create_prompt_version(agent_name, prompt_text)
    return {"version": version, "status": "created"}

@router.put("/agents/{agent_name}/promote")
async def promote_to_production(agent_name: str, version: str):
    """Promove versão pra produção"""
    pm.set_production_version(agent_name, version)
    return {"status": "promoted", "version": version, "agent_name": agent_name}

@router.get("/comparison-report")
async def get_comparison_report(agent_name: str, v1: str, v2: str):
    """
    Relatório visual de comparação
    Útil pra decidir se promove v2 ou não
    """
    comparison = pm.compare_versions(agent_name, v1, v2)
    
    # Safe checks if delta metrics are present
    try:
        quality_delta = comparison.get("improvement", {}).get("quality_delta", 0)
        recommendation = "Promover " + v2 if quality_delta > 0.05 else "Manter " + v1
    except Exception:
        recommendation = "Aguardando mais dados"
    
    return {
        "agent_name": agent_name,
        "comparison": comparison,
        "recommendation": recommendation
    }
