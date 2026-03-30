from app.graph.state import GraphState
from app.graph.agents.base_agent import workflow_agente_servico
from utils.db_connector import executar_query_databricks

def node_agente_vendas(state: GraphState) -> dict:
    return workflow_agente_servico(
        state=state,
        dominio_formal="Vendas e Produtos",
        nome_agente="agente_vendas",
        tabelas_permitidas=["sales_transactions", "products"],
        executar_query_fn=executar_query_databricks
    )
