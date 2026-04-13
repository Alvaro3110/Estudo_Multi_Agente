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

class GerarLTM(dspy.Signature):
    """
    Especialista Cognitivo.
    Analise o relatório e a pergunta do usuário para extrair um único novo aprendizado
    (ex: 'O usuário foca muito em riscos sistêmicos' ou 'O usuário questiona a margem de lucro').
    Seja breve, max 1 linha. Responda apenas o fato aprendido.
    """
    query_usuario = dspy.InputField()
    relatorio = dspy.InputField()
    insight_aprendido = dspy.OutputField(desc="Uma única frase que resume o interesse do usuário na resposta.")

def node_memorizador(state: GraphState) -> dict:
    """
    Nó Memorizador: Encerra a jornada persistindo aprendizado.
    Gera sugestões de próximos passos e extrai LTM.
    """
    logger.info("[NODE] Memorizador salvando insights LTM...")
    
    llm = configurar_modelo(state.get("modelo_selecionado", "GPT-4o Mini (OpenAI)"))
    
    # Gera sugestões e aprende contexto da conversa
    with dspy.context(lm=llm):
        # 1. Sugestões de Follow-up
        predictor_sugestao = dspy.Predict(GerarSugestoes)
        res_sugestao = predictor_sugestao(relatorio=state["consolidacao_final"])
        sugestoes = [s.strip("- ") for s in res_sugestao.sugestoes.split("\n")][:4]

        # 2. Aprendizado de Longo Prazo (Cognitivo)
        predictor_ltm = dspy.Predict(GerarLTM)
        res_ltm = predictor_ltm(
            query_usuario=state.get("query", ""),
            relatorio=state["consolidacao_final"]
        )
        insight_aprendido = res_ltm.insight_aprendido.strip()

    # Persiste na Store
    user_id = state.get("user_id", "Carlos")
    if insight_aprendido:
        from app.core.persona_store import add_preference
        add_preference(user_id, insight_aprendido)
        logger.info(f"[LTM] Novo insight memorizado: {insight_aprendido}")
    
    return {
        "sugestoes_follow_up": sugestoes,
        "active_node": "memorizador"
    }
