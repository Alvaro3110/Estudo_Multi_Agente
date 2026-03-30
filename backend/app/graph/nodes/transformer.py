import dspy
import logging
from typing import List
from app.graph.state import GraphState
from utils.llm_config import configurar_modelo

logger = logging.getLogger(__name__)

class EnriquecerQuery(dspy.Signature):
    """
    Especialista em NLP Bancário.
    Enriquece a query do usuário, resolve ambiguidades, normaliza entidades 
    e gera múltiplas hipóteses de intenção para guiar o SQL.
    """
    query_bruta = dspy.InputField()
    contexto_negocio = dspy.InputField()
    
    query_enriquecida = dspy.OutputField(desc="Query expandida com termos técnicos e normalização de entidades.")
    hipoteses = dspy.OutputField(desc="Lista de 2-3 hipóteses de interpretação da intenção do usuário.")
    entidades_normalizadas = dspy.OutputField(desc="Dicionário de entidades identificadas (ex: data, região, produto).")

def node_query_transformer(state: GraphState) -> dict:
    """
    Nó Transformer: Primeiro estágio do pipeline.
    Foca em traduzir a linguagem do usuário para o 'bancários' e 'dados'.
    """
    logger.info(f"[NODE] Transformer processando query: {state['query']}")
    
    llm = configurar_modelo(state.get("modelo_selecionado", "GPT-4o Mini (OpenAI)"))
    logger.info("[NODE] Transformer chamando LLM...")
    try:
        with dspy.context(lm=llm):
            predictor = dspy.ChainOfThought(EnriquecerQuery)
            resultado = predictor(
                query_bruta=state["query"],
                contexto_negocio=state.get("group_context", "Analista Santander")
            )
        logger.info("[NODE] Transformer recebeu resposta do LLM.")
    except Exception as e:
        logger.error(f"[NODE] Erro no Transformer LLM: {e}")
        raise e
        
    return {
        "query_enriquecida": resultado.query_enriquecida,
        "active_node": "transformer",
        "hypotheses": resultado.hipoteses,
        "normalized_entities": resultado.entidades_normalizadas
    }
