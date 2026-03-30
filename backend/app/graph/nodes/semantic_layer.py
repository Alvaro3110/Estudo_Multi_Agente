import logging
from concurrent.futures import ThreadPoolExecutor, as_completed
from app.graph.state import GraphState
from utils.db_connector import executar_query_databricks
from utils.schema_cache import schema_cache

logger = logging.getLogger(__name__)

def _buscar_distinct(tabela: str, coluna: str) -> tuple[str, str, list]:
    """
    Busca valores distintos de uma coluna com cache.
    Retorna (tabela, coluna, valores) para o ThreadPoolExecutor.
    """
    cache_key = f"distinct:{tabela}:{coluna}"
    cached = schema_cache.get(cache_key)
    if cached is not None:
        return tabela, coluna, cached

    try:
        query = f"SELECT DISTINCT {coluna} FROM {tabela} LIMIT 10"
        res = executar_query_databricks(query)
        valores = []
        if isinstance(res, list):
            valores = [str(list(v.values())[0]) for v in res][:5]
        schema_cache.set(cache_key, valores)
        return tabela, coluna, valores
    except Exception as e:
        logger.warning(f"[SemanticLayer] Erro em {tabela}.{coluna}: {e}")
        return tabela, coluna, []

def node_categorical_semantic(state: GraphState) -> dict:
    """
    Nó Semantic Layer: Identifica colunas categóricas e busca valores DISTINTOS.
    ThreadPoolExecutor com max_workers=5 — reduz latência drásticamente.
    """
    schema_info = state.get("schema_info", {})
    logger.info("[NODE] Semantic Layer detectando categorias (paralelo + cache)...")
    
    dicionario_categorico = {}
    keywords = ["region", "status", "segment", "category", "name", "_id"]
    tarefas = []

    for tabela, cols_str in schema_info.items():
        if "Erro" in cols_str or "não disponível" in cols_str: continue
        
        colunas = [c.split(" (")[0] for c in cols_str.split(", ")]
        for col in colunas:
            if any(k in col.lower() for k in keywords):
                tarefas.append((tabela, col))

    with ThreadPoolExecutor(max_workers=5) as executor:
        futures = {
            executor.submit(_buscar_distinct, tabela, coluna): (tabela, coluna)
            for tabela, coluna in tarefas
        }
        for future in as_completed(futures):
            try:
                tabela, coluna, valores = future.result(timeout=10)
                if valores:
                    dicionario_categorico[f"{tabela}.{coluna}"] = {
                        "tabela": tabela,
                        "coluna": coluna,
                        "valores_vistos": valores
                    }
            except Exception as e:
                tabela, coluna = futures[future]
                logger.error(f"[SemanticLayer] Timeout/erro em {tabela}.{coluna}: {e}")

    logger.info(
        f"[SemanticLayer] {len(dicionario_categorico)} mapeamentos concluídos "
        f"({len(tarefas)} colunas processadas em paralelo)."
    )

    return {
        "dicionario_categorico": dicionario_categorico,
        "active_node": "categorical_semantic"
    }
