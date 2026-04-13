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
    Foca em traduzir a linguagem do usuário para o 'bancários' e 'dados'
    e engloba as preferências de longo prazo do usuário (LTM).
    """
    logger.info(f"[NODE] Transformer processando query: {state['query']}")
    
    # Busca a LTM do usuário ativo. No MVP, assumimos "Carlos" como ID geral.
    user_id = state.get("user_id", "Carlos")
    from app.core.persona_store import get_preferences
    user_preferences = get_preferences(user_id) or "Gosta de respostas curtas e objetivas."
    
    llm = configurar_modelo(state.get("modelo_selecionado", "GPT-4o Mini (OpenAI)"))
    logger.info("[NODE] Transformer chamando LLM e injetando Memória LTM...")
    import mlflow
    try:
        with mlflow.start_span(name="node_query_transformer", span_type="TOOL") as span:
            with dspy.context(lm=llm):
                predictor = dspy.ChainOfThought(EnriquecerQuery)
                
                # Incorpora as preferências ao contexto do dspy
                contexto_enriquecido = f"Contexto de negócio: {state.get('group_context', 'Analista Santander')} | Preferências do Usuário (LTM): {user_preferences}"
                
                from app.core.prompt_cache import transformer_cache_manager
                cache_hit = transformer_cache_manager.get("transformer", state["query"])
                
                if cache_hit:
                    resultado = cache_hit
                    logger.info("[NODE] Transformer utilizou cache. Bypass do LLM (Token Saving).")
                else:
                    resultado = predictor(
                        query_bruta=state["query"],
                        contexto_negocio=contexto_enriquecido
                    )
                    transformer_cache_manager.set("transformer", state["query"], resultado)
            logger.info("[NODE] Transformer finalizou processamento.")
    except Exception as e:
        logger.error(f"[NODE] Erro no Transformer LLM: {e}")
        raise e
        
    return {
        "user_id": user_id,
        "user_preferences": user_preferences,
        "query_enriquecida": resultado.query_enriquecida,
        "active_node": "transformer",
        "hypotheses": resultado.hipoteses,
        "normalized_entities": resultado.entidades_normalizadas
    }
