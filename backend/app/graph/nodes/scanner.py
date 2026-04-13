import logging
from app.graph.state import GraphState
from utils.db_connector import executar_query_databricks
from utils.schema_cache import schema_cache

logger = logging.getLogger(__name__)

TABELAS_WHITELIST = [
    "sales_transactions", 
    "products", 
    "financials", 
    "logistics_shipments", 
    "customers"
]

def node_data_scanner(state: GraphState) -> dict:
    """
    Nó Data Scanner: Busca o schema real no Databricks Information Schema.
    Cache de 30min — evita DESCRIBE TABLE a cada execução.
    """
    schema_info = {}
    
    # Heurística Token Saving: Limitar scan de schema baseado nos agentes recomendados
    agentes_str = str(state.get("agentes_recomendados", "")).lower()
    tabelas_foco = []
    
    if "vendas" in agentes_str:
        tabelas_foco.extend(["sales_transactions", "products"])
    if "financeiro" in agentes_str:
        tabelas_foco.extend(["financials"])
    if "logistica" in agentes_str:
        tabelas_foco.extend(["logistics_shipments"])
        
    # Fallback seguro < 5
    if not tabelas_foco:
        tabelas_foco = ["sales_transactions", "products", "customers"]
        
    # Garantia final (hard cap)
    tabelas_foco = list(set(tabelas_foco))[:4]
    
    logger.info(f"[NODE] Data Scanner explorando whitelist reduzida (max 4): {tabelas_foco}")
    
    for tabela in tabelas_foco:
        cache_key = f"schema:{tabela}"
        cached = schema_cache.get(cache_key)

        if cached is not None:
            schema_info[tabela] = cached
            logger.info(f"[Scanner] Cache HIT: {tabela}")
            continue

        # Cache miss — busca no Databricks e armazena
        logger.info(f"[Scanner] Cache MISS — buscando schema: {tabela}")
        query = f"DESCRIBE TABLE {tabela}"
        try:
            colunas = executar_query_databricks(query)
            if isinstance(colunas, list) and len(colunas) > 0:
                schema_str = ", ".join([f"{c.get('col_name')} ({c.get('data_type')})" for c in colunas if 'col_name' in c])
                schema_cache.set(cache_key, schema_str)
                schema_info[tabela] = schema_str
            else:
                schema_info[tabela] = "Schema não disponível via DESCRIBE."
        except Exception as e:
            logger.error(f"[SCANNER] Erro ao descrever {tabela}: {e}")
            schema_info[tabela] = "Erro na descoberta de schema."

    return {
        "schema_info": schema_info,
        "active_node": "data_scanner"
    }
