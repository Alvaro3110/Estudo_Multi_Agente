import dspy
import logging
from app.graph.state import GraphState
from utils.llm_config import configurar_modelo

logger = logging.getLogger(__name__)

class RefletirQualidade(dspy.Signature):
    """
    Garantia de Qualidade e Anti-Viés.
    Analisa o relatório consolidado, ajusta o tom Santander e verifica consistência factualmente.
    """
    relatorio_consolidado = dspy.InputField()
    dados_referencia = dspy.InputField()
    
    relatorio_refinado = dspy.OutputField(desc="Markdown final sanitizado e revisado.")
    score_confianca = dspy.OutputField(desc="0.0 a 1.0 indicando adesão aos dados.")
    feedback_melhoria = dspy.OutputField(desc="Feedback para o próximo loop se houver replanejamento.")

def node_gepa(state: GraphState) -> dict:
    """
    Nó GEPA: Camada de reflexão final (Reflection Pattern).
    Busca consistência e tom corporativo.
    """
    logger.info("[NODE] GEPA revisando qualidade final...")
    
    llm = configurar_modelo(state.get("modelo_selecionado", "GPT-4o Mini"))
    
    with dspy.context(lm=llm):
        predictor = dspy.Predict(RefletirQualidade)
        resultado = predictor(
            relatorio_consolidado=state["consolidacao_final"],
            dados_referencia=str(state["dados_databricks"])
        )
        
    return {
        "consolidacao_final": resultado.relatorio_refinado,
        "score_confianca": float(resultado.score_confianca or 1.0),
        "gepar_feedback": resultado.feedback_melhoria,
        "active_node": "gepa"
    }
