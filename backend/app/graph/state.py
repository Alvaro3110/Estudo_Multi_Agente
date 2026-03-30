from typing import TypedDict, List, Dict, Optional, Annotated, Any

def merge_dicts(a: dict, b: dict) -> dict:
    """
    Função auxiliar para mesclar dicionários de resultados parciais
    no estado do LangGraph (fan-in).
    """
    if not a: return b
    if not b: return a
    return {**a, **b}

def merge_active_nodes(a: str, b: str) -> str:
    """
    Combina múltiplos active_nodes rodando simultaneamente.
    """
    if not a: return b
    if not b: return a
    return f"{a}, {b}"

class GraphState(TypedDict):
    """
    Estado compartilhado do grafo multi-agente.
    """
    query: str
    modelo_selecionado: str
    department_id: str
    group_context: str
    
    # Processamento
    active_node: Annotated[str, merge_active_nodes]
    plano_acao: List[str]
    agentes_selecionados: List[str]
    agentes_recomendados: List[str]
    
    # Transformer & Planner Outputs
    query_enriquecida: str
    hypotheses: str
    normalized_entities: str
    plano_execucao: str
    schema_info: Annotated[Dict[str, Any], merge_dicts]
    dicionario_categorico: Annotated[Dict[str, Any], merge_dicts]
    
    # Resultados (Annotated com merge_dicts para merge automático do fan-in)
    relatorios_agentes: Annotated[Dict[str, str], merge_dicts]
    insights_agentes: Annotated[Dict[str, List[str]], merge_dicts]
    queries_geradas: Annotated[Dict[str, str], merge_dicts]
    dados_databricks: Annotated[Dict[str, List[Dict]], merge_dicts]
    
    # Consolidação e Qualidade
    consolidacao_final: str
    score_confianca: float
    gepar_feedback: str
    veredito_juiz: str
    iteracoes_replanejamento: int
    
    # Memória e Metadata
    sugestoes_follow_up: List[str]
    latencias: Annotated[Dict[str, float], merge_dicts]
    thread_id: str
