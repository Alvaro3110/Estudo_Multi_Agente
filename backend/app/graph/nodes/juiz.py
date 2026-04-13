import dspy
import logging
from app.graph.state import GraphState
from utils.llm_config import configurar_modelo

logger = logging.getLogger(__name__)

class AvaliarResultado(dspy.Signature):
    """
    Juiz e Controlador de Loop.
    Decide se o relatório é satisfatório ou se precisa de replanejamento.
    """
    query = dspy.InputField()
    relatorio_final = dspy.InputField()
    schema_context = dspy.InputField()
    
    veredito = dspy.OutputField(desc="'replanejar' ou 'finalizar'.")
    justificativa = dspy.OutputField(desc="Por que o veredito foi dado?")

def node_juiz(state: GraphState) -> dict:
    """
    Nó Juiz: Ponto Crítico de Controle.
    Validação heurística sem uso de tokens de LLM (Token Saving).
    """
    logger.info("[NODE] Juiz avaliando consistência (SEM LLM)...")
    
    veredito = "finalizar"
    
    # Heurística 1: Há erro de SQL nas extrações Databricks?
    dados_db = state.get("dados_databricks", {})
    tem_erro_sql = False
    
    for agent_id, dados in dados_db.items():
        if isinstance(dados, list) and len(dados) > 0:
            if "erro_sql" in str(dados[0]):
                tem_erro_sql = True
                break
                
    if tem_erro_sql:
        logger.warning("[JUIZ] Heurística ativada: Erro de sintaxe SQL detectado. Replanejando.")
        veredito = "replanejar"

    # Heurística 2: Orquestração perdeu controle dos agentes?
    if not state.get("agentes_selecionados"):
        logger.warning("[JUIZ] Heurística ativada: Nenhum agente atribuído. Replanejando.")
        veredito = "replanejar"

    logger.info(f"[JUIZ] Veredito final: {veredito}")
    return {
        "veredito_juiz": veredito,
        "active_node": "juiz"
    }
