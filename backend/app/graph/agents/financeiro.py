from app.graph.state import GraphState
from app.graph.agents.base_agent import workflow_agente_servico
from utils.db_connector import executar_query_databricks

def node_agente_financeiro(state: GraphState) -> dict:
    return workflow_agente_servico(
        state=state,
        dominio_formal="Financeiro e Cobrança",
        nome_agente="agente_financeiro",
        tabelas_permitidas=["financials", "sales_transactions"],
        executar_query_fn=executar_query_databricks
    )
