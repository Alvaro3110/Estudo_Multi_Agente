import dspy
import logging
import json
from app.graph.state import GraphState
from utils.llm_config import configurar_modelo

logger = logging.getLogger(__name__)

class GerarConsolidacao(dspy.Signature):
    """
    C-Level Editor-in-Chief.
    Consolida relatórios de múltiplos agentes em uma única narrativa executiva.
    Insere tags [CHART:N] onde fizer sentido visual.
    """
    query_original = dspy.InputField()
    relatorios_agentes = dspy.InputField()
    dados_databricks = dspy.InputField()
    
    status_executivo = dspy.OutputField(desc="Resumo de alto nível (Sucesso/Atenção/Erro).")
    relatorio_markdown = dspy.OutputField(desc="""
        Relatório executivo completo em Markdown (Santander Style). 
        ESTRUTURA OBRIGATÓRIA:
        1. Título principal (#).
        2. Resumo Executivo (##).
        3. Análise Detalhada por Agente (##).
        4. Tabela de Dados Comparativos (se houver dados numéricos).
        5. Conclusão e Próximos Passos (##).
        REGRAS DE FORMATAÇÃO:
        - Use DUAS quebras de linha entre seções e tabelas.
        - Use negrito para valores monetários e percentuais.
    """)
    decisoes_grafico = dspy.OutputField(desc="JSON com até 3 visualizações recomendadas.")

def node_consolidador(state: GraphState) -> dict:
    """
    Nó Consolidador: Unifica a inteligência dos especialistas.
    Foca em fidelidade aos dados e clareza executiva.
    """
    logger.info("[NODE] Consolidador unificando inteligência...")
    
    llm = configurar_modelo(state.get("modelo_selecionado", "GPT-4o Mini"))
    
    if not state.get("relatorios_agentes"):
        logger.error("[CONSOLIDADOR] Nenhum relatório recebido dos agentes.")
        relatorio_erro = """
# Relatório de Indisponibilidade
Infelizmente, não foi possível extrair dados para esta consulta.
Por favor, verifique se as tabelas solicitadas estão disponíveis no Databricks.
"""
        return {"consolidacao_final": relatorio_erro, "active_node": "consolidador"}

    with dspy.context(lm=llm):
        predictor = dspy.ChainOfThought(GerarConsolidacao)
        resultado = predictor(
            query_original=state["query"],
            relatorios_agentes=str(state["relatorios_agentes"]),
            dados_databricks=str(state["dados_databricks"])
        )
        
    return {
        "consolidacao_final": resultado.relatorio_markdown,
        "decisoes_visuais": resultado.decisoes_grafico,
        "active_node": "consolidador"
    }
