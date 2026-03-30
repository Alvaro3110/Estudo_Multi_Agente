import dspy
import logging
from app.graph.state import GraphState
from utils.llm_config import configurar_modelo

logger = logging.getLogger(__name__)

class ClassificadorRouter(dspy.Signature):
    """
    Controlador de Tráfego de Agentes.
    Classifica a query em um ou mais domínios especializados.
    """
    query_enriquecida = dspy.InputField()
    dominios = dspy.OutputField(desc="Lista de domínios: [agente_vendas, agente_financeiro, agente_logistica].")
    justificativa = dspy.OutputField(desc="Por que escolheu esses agentes?")

def node_router(state: GraphState) -> dict:
    """
    Nó Router: Define para quais especialistas a query deve sofrer fan-out.
    Fallback robusto para 'agente_vendas' em caso de dúvida.
    """
    logger.info("[NODE] Router direcionando tráfego...")
    
    llm = configurar_modelo(state.get("modelo_selecionado", "GPT-4o Mini"))
    
    with dspy.context(lm=llm):
        predictor = dspy.Predict(ClassificadorRouter)
        resultado = predictor(query_enriquecida=state["query_enriquecida"])
        
    # Extração e normalização dos domínios
    dominios_brutos = str(resultado.dominios).lower()
    agentes_validos = ["agente_vendas", "agente_financeiro", "agente_logistica"]
    selecionados = [ag for ag in agentes_validos if ag in dominios_brutos]
    
    if not selecionados:
        logger.warning("[ROUTER] Nenhum agente válido detectado. Usando fallback: agente_vendas.")
        selecionados = ["agente_vendas"]
        
    return {
        "agentes_selecionados": selecionados,
        "active_node": "router"
    }
