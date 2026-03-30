import os
import sqlite3
import logging
import functools
from dotenv import load_dotenv
from langgraph.graph import StateGraph
from langgraph.checkpoint.sqlite import SqliteSaver

# --- Shared Imports ---
from app.graph.state import GraphState
from utils.llm_config import configurar_modelo, MODELOS_DISPONIVEIS
from utils.db_connector import executar_query_databricks

# --- Node Imports ---
from app.graph.nodes.transformer import node_query_transformer
from app.graph.nodes.planner import node_planner
from app.graph.nodes.scanner import node_data_scanner
from app.graph.nodes.semantic_layer import node_categorical_semantic
from app.graph.nodes.router import node_router
from app.graph.nodes.consolidador import node_consolidador
from app.graph.nodes.juiz import node_juiz
from app.graph.nodes.memorizador import node_memorizador
from app.graph.nodes.gepa import node_gepa

# --- Agent Imports ---
from app.graph.agents.vendas import node_agente_vendas
from app.graph.agents.financeiro import node_agente_financeiro
from app.graph.agents.logistica import node_agente_logistica

logger = logging.getLogger(__name__)
load_dotenv()

# ==========================================
# 🔒 LIMITES E CONSTANTES
# ==========================================

MAX_ITERACOES_REPLANEJAMENTO = 2
CHECKPOINT_DB_PATH = "app/checkpoints.sqlite"

@functools.lru_cache(maxsize=1)
def _get_sqlite_connection() -> sqlite3.Connection:
    os.makedirs(os.path.dirname(CHECKPOINT_DB_PATH), exist_ok=True)
    conn = sqlite3.connect(CHECKPOINT_DB_PATH, check_same_thread=False)
    logger.info(f"[ENGINE] Conexão SQLite aberta: {CHECKPOINT_DB_PATH}")
    return conn

def workflow_conditional_edge(state: GraphState):
    agentes_selecionados = state.get("agentes_selecionados", [])
    mapping = {
        "agente_vendas":    "agente_vendas",
        "agente_financeiro": "agente_financeiro",
        "agente_logistica": "agente_logistica",
    }
    destinos = [mapping[ag] for ag in agentes_selecionados if ag in mapping]

    if not destinos:
        logger.warning("[ENGINE] Nenhum agente selecionado — indo direto ao consolidador.")
        return ["consolidador"]

    logger.info(f"[ENGINE] Fan-out para agentes: {destinos}")
    return destinos

def juiz_conditional_edge(state: GraphState):
    veredito = state.get("veredito_juiz", "finalizar")
    iteracoes = state.get("iteracoes_replanejamento", 0)

    if veredito == "replanejar":
        if iteracoes >= MAX_ITERACOES_REPLANEJAMENTO:
            logger.warning(f"[ENGINE] Limite de replanejamento atingido. Forçando finalização.")
            return "finalizar"
        return "replanejar"

    return "finalizar"

def node_planner_com_contador(state: GraphState) -> dict:
    resultado = node_planner(state)
    iteracoes_atual = state.get("iteracoes_replanejamento", 0)
    if state.get("veredito_juiz") == "replanejar":
        resultado["iteracoes_replanejamento"] = iteracoes_atual + 1
    return resultado

@functools.lru_cache(maxsize=1)
def compilar_multi_agentes():
    """
    Compila o grafo com persistência em SQLite singleton.
    """
    logger.info("[ENGINE] Compilando grafo multi-agente...")
    workflow = StateGraph(GraphState)

    workflow.add_node("transformer",          node_query_transformer)
    workflow.add_node("planner",              node_planner_com_contador)
    workflow.add_node("data_scanner",         node_data_scanner)
    workflow.add_node("categorical_semantic", node_categorical_semantic)
    workflow.add_node("router",               node_router)
    workflow.add_node("agente_vendas",        node_agente_vendas)
    workflow.add_node("agente_financeiro",    node_agente_financeiro)
    workflow.add_node("agente_logistica",     node_agente_logistica)
    workflow.add_node("consolidador",         node_consolidador)
    workflow.add_node("gepa",                 node_gepa)
    workflow.add_node("juiz",                 node_juiz)
    workflow.add_node("memorizador",          node_memorizador)

    workflow.set_entry_point("transformer")
    workflow.add_edge("transformer",          "planner")
    workflow.add_edge("planner",              "data_scanner")
    workflow.add_edge("data_scanner",         "categorical_semantic")
    workflow.add_edge("categorical_semantic", "router")

    workflow.add_conditional_edges(
        "router",
        workflow_conditional_edge,
        {
            "agente_vendas":    "agente_vendas",
            "agente_financeiro": "agente_financeiro",
            "agente_logistica": "agente_logistica",
            "consolidador":     "consolidador",
        }
    )

    workflow.add_edge("agente_vendas",    "consolidador")
    workflow.add_edge("agente_financeiro", "consolidador")
    workflow.add_edge("agente_logistica", "consolidador")
    workflow.add_edge("consolidador", "gepa")
    workflow.add_edge("gepa",         "juiz")

    workflow.add_conditional_edges(
        "juiz",
        juiz_conditional_edge,
        {
            "replanejar": "planner",
            "finalizar":  "memorizador",
        }
    )

    workflow.add_edge("memorizador", "__end__")

    conn = _get_sqlite_connection()
    memory = SqliteSaver(conn)
    return workflow.compile(checkpointer=memory)

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    app = compilar_multi_agentes()
    print("✅ Grafo compilado com sucesso.")
