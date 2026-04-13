import os
import dspy
import logging
from app.graph.state import GraphState
from utils.llm_config import configurar_modelo
from utils.filesystem_manager import salvar_em_workspace

logger = logging.getLogger(__name__)

class GerarPlano(dspy.Signature):
    """
    Arquiteto de Soluções de Dados.
    Cria um plano de execução detalhado para responder a query do usuário.
    O plano deve incluir as tabelas prováveis e a lógica de agregação.
    """
    query_enriquecida = dspy.InputField()
    plano_detalhado = dspy.OutputField(desc="Markdown com as etapas de execução e estratégia de dados.")
    agentes_provaveis = dspy.OutputField(desc="Lista de agentes recomendados (Vendas, Financeiro, Logística).")

def node_planner(state: GraphState) -> dict:
    """
    Nó Planner: Define a estratégia de ataque aos dados.
    Salva o plano em disco para transparência (HITL).
    """
    logger.info("[NODE] Planner criando estratégia...")
    
    llm = configurar_modelo(state.get("modelo_selecionado", "GPT-4o Mini"))
    
    import mlflow
    with mlflow.start_span(name="node_planner", span_type="TOOL") as span:
        with dspy.context(lm=llm):
            predictor = dspy.ChainOfThought(GerarPlano)
            resultado = predictor(query_enriquecida=state["query_enriquecida"])
        
    # Persistência no Workspace da Thread
    thread_id = state.get("thread_id", "default")
    caminho = salvar_em_workspace(
        thread_id, 
        "plano_execucao.md", 
        resultado.plano_detalhado
    )
    logger.info(f"[PLANNER] Plano salvo em: {caminho}")

    return {
        "plano_execucao": resultado.plano_detalhado,
        "active_node": "planner",
        "agentes_recomendados": resultado.agentes_provaveis
    }
