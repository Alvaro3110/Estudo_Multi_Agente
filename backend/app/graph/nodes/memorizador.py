import os
import dspy
import logging
from app.graph.state import GraphState
from utils.llm_config import configurar_modelo
from utils.filesystem_manager import salvar_em_workspace

logger = logging.getLogger(__name__)

class GerarSugestoes(dspy.Signature):
    """
    Especialista em Engajamento.
    Gera as 4 próximas melhores perguntas baseadas no relatório atual.
    """
    relatorio = dspy.InputField()
    sugestoes = dspy.OutputField(desc="4 perguntas de follow-up (lista Markdown).")

def node_memorizador(state: GraphState) -> dict:
    """
    Nó Memorizador: Encerra a jornada persistindo aprendizado.
    Gera sugestões de próximos passos.
    """
    logger.info("[NODE] Memorizador salvando insights LTM...")
    
    llm = configurar_modelo(state.get("modelo_selecionado", "GPT-4o Mini"))
    
    # Gera sugestões de follow-up
    with dspy.context(lm=llm):
        predictor = dspy.Predict(GerarSugestoes)
        res = predictor(relatorio=state["consolidacao_final"])
        
    sugestoes = [s.strip("- ") for s in res.sugestoes.split("\n")][:4]

    # TODO: Persistência em LTM (/memories) pode ser implementada aqui
    
    return {
        "sugestoes_follow_up": sugestoes,
        "active_node": "memorizador"
    }
