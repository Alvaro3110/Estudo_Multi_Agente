from app.graph.state import GraphState
from app.graph.agents.base_agent import workflow_agente_servico
from utils.db_connector import executar_query_databricks

def node_agente_logistica(state: GraphState) -> dict:
    return workflow_agente_servico(
        state=state,
        dominio_formal="Logística e Entregas",
        nome_agente="agente_logistica",
        tabelas_permitidas=["logistics_shipments", "customers"],
        executar_query_fn=executar_query_databricks
    )
