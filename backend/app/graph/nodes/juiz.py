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
    Evita alucinações e garante que a query foi realmente respondida.
    """
    logger.info("[NODE] Juiz avaliando consistência...")
    
    llm = configurar_modelo(state.get("modelo_selecionado", "GPT-4o Mini"))
    
    try:
        with dspy.context(lm=llm):
            predictor = dspy.Predict(AvaliarResultado)
            res = predictor(
                query=state["query"],
                relatorio_final=state["consolidacao_final"],
                schema_context=str(state.get("schema_info", {}))
            )
            veredito = res.veredito.strip().lower()
            if "replanejar" in veredito: veredito = "replanejar"
            else: veredito = "finalizar"
    except Exception as e:
        logger.error(f"[JUIZ] Falha técnica na avaliação: {e}")
        veredito = "finalizar" # Fallback conservador

    logger.info(f"[JUIZ] Veredito final: {veredito}")
    return {
        "veredito_juiz": veredito,
        "active_node": "juiz"
    }
