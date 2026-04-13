import os
import re
import time
import json
import dspy
import mlflow
import logging
from typing import List, Dict, Any
from app.graph.state import GraphState
from app.graph.models import AgentInput, AgentOutput, GerarSQL, GerarRelatorioDominio
from utils.filesystem_manager import salvar_em_workspace
from utils.helpers import sanitizar_relatorio
from utils.llm_config import configurar_modelo
from app.mlflow_utils import start_agent_span, log_agent_metrics, evaluate_report, save_good_example
from mlflow.exceptions import MlflowException

logger = logging.getLogger(__name__)

def workflow_agente_servico(
    state: GraphState, 
    dominio_formal: str, 
    nome_agente: str, 
    tabelas_permitidas: List[str],
    executar_query_fn
) -> dict:
    """
    Template Genérico para Agentes Especialistas.
    Gera SQL, executa no Databricks e gera relatório interpretativo com retry.
    """
    
    with start_agent_span(nome_agente) as run:
        t_start = time.time()
        llm_name = str(state.get("modelo_selecionado", "GPT-4o Mini (OpenAI)"))
        llm = configurar_modelo(llm_name)
        
        query_usuario = state.get("query_enriquecida", state["query"])
        raw_schema = state.get("schema_info", {})
        schemas_gerais = dict(raw_schema) if isinstance(raw_schema, dict) else {}
        schemas_filtrados = {k: v for k, v in schemas_gerais.items() if k in tabelas_permitidas}
        
        # Contexto Semântico
        dicionario_categorico = state.get("dicionario_categorico", {})
        contexto_semantico = ""
        if dicionario_categorico:
            contexto_semantico = "\n\n=== DICIONÁRIO SEMÂNTICO DE CATEGORIAS ===\n"
            for entry_key, info in dicionario_categorico.items():
                tabela_ref = info.get("tabela", entry_key.split(".")[0])
                if tabela_ref in tabelas_permitidas:
                    col_name = info.get("coluna", entry_key.split(".")[1] if "." in entry_key else entry_key)
                    vals = info.get("valores_vistos", [])
                    contexto_semantico += f"Coluna '{col_name}' (Valores Reais vistos: {', '.join(vals)})\n"
        
        # Extração de Colunas (Blindagem)
        colunas_por_tabela = {}
        for tabela, schema_text in schemas_filtrados.items():
            names = re.findall(r"Coluna '([^']+)'", schema_text)
            if not names: names = re.findall(r"(\w+)\(", schema_text)
            if names: colunas_por_tabela[tabela] = list(set(names))

        whitelist_colunas_str = ""
        for tab, cols in colunas_por_tabela.items():
            whitelist_colunas_str += f"- Tabela {tab}: [{', '.join(cols)}]\n"

        cat = os.environ.get("DATABRICKS_CATALOG", "estudo_multi_agente")
        sch = os.environ.get("DATABRICKS_SCHEMA", "bronze")
        whitelist_fqn = [f"{cat}.{sch}.{t}" for t in tabelas_permitidas]
        
        prompt_schema_context = f"""
TABELAS PERMITIDAS: {', '.join(whitelist_fqn)}
COLUNAS DISPONÍVEIS: {whitelist_colunas_str}
Dicionário Detalhado:\n{"\n".join(schemas_filtrados.values())}
{contexto_semantico}
"""

        with dspy.context(lm=llm):
            sql_gerador = dspy.Predict(GerarSQL)
            tentativa = 0
            dados = []
            sql_final = ""
            
            while tentativa < 2:
                tentativa += 1
                prompt_query = query_usuario
                if tentativa > 1 and dados and "erro_sql" in dados[0]:
                    prompt_query += f"\n\nERRO ANTERIOR: {dados[0]['erro_sql']}\nCorrija o SQL respeitando as colunas acima."
                
                pred_sql = sql_gerador(schema_disponivel=prompt_schema_context, query=prompt_query, dominio_do_agente=dominio_formal)
                sql_final = pred_sql.sql_query.replace("```sql", "").replace("```", "").strip()
                
                # Validação antecipada
                sql_lavado = sql_final.upper().strip()
                tokens_validos = ["SELECT", "WITH", "SHOW", "DESCRIBE", "EXPLAIN"]
                
                if any(sql_lavado.startswith(kw) for kw in tokens_validos):
                    dados = executar_query_fn(sql_final)
                else:
                    logger.warning(f"[{nome_agente}] SQL gerado não parece válido.")
                    dados = []
                    break 
                
                if dados and isinstance(dados, list) and len(dados) > 0 and "erro_sql" in dados[0]:
                    if tentativa < 2: continue 
                
                if not dados or "erro_sql" not in dados[0]: break

            # Relatório Interpretativo
            relatorio = "Processando..."
            insights = []
            incerteza = False
            
            if not dados:
                relatorio = "Nenhum dado retornado para esta consulta."
                rationale = "Sem resultados."
            elif "erro_sql" in dados[0]:
                relatorio = f"Erro na extração: {dados[0]['erro_sql']}"
                rationale = "Falha crítica de SQL."
            else:
                agent_key = nome_agente.replace("agente_", "")
                if agent_key == "financeiro": agent_key = "financial"
                elif agent_key == "vendas": agent_key = "sales"
                elif agent_key == "logistica": agent_key = "logistics"
                
                # MLflow GenAI OSS Rationale integration
                try:
                    requested_version = state.get("prompt_version", "latest")
                    prompt_obj = mlflow.genai.load_prompt(f"prompts:/{agent_key}_agent@{requested_version}")
                    
                    # Formatting logic com variaveis de state
                    instrucoes_de_skill = prompt_obj.format(
                        period=state.get("period", "2026-04"),
                        context=state.get("query_enriquecida", "")[:100]
                    )
                    mlflow.log_param("genai_loaded_prompt", f"{agent_key}_agent")
                    
                except Exception as e:
                    logger.warning(f"MLflow GenAI load falhou, tentando fallback local: {e}")
                    try:
                        with open(f"app/graph/skills/{nome_agente}.md", "r", encoding="utf-8") as f:
                            instrucoes_de_skill = f.read()
                    except FileNotFoundError:
                        instrucoes_de_skill = f"Siga as regras padrão para o agente de {dominio_formal}."
                
                relator = dspy.ChainOfThought(GerarRelatorioDominio)
                pred_rel = relator(
                    query_usuario=query_usuario, 
                    json_extraido_do_banco=json.dumps(dados[:50], default=str),
                    instrucoes_de_skill=instrucoes_de_skill
                )
                relatorio = sanitizar_relatorio(pred_rel.relatorio)
                insights = getattr(pred_rel, 'insights', [])
                incerteza = getattr(pred_rel, 'incerteza_escalar', False)
                rationale = getattr(pred_rel, 'reasoning', 'Sucesso.')

        # Metadata
        thread_id = state.get("thread_id", "default")
        p_sql = salvar_em_workspace(thread_id, f"{nome_agente}_query.sql", sql_final)
        p_data = salvar_em_workspace(thread_id, f"{nome_agente}_data.json", dados)
        
        latency = time.time() - t_start
        
        # Cria payload para avaliar e logar
        payload = {
            "insights": insights,
            "metrics": {"row_count": len(dados) if dados else 0},
            "report": relatorio
        }
        score = evaluate_report(nome_agente, payload)
        
        # Loga a qualidade e a latência especificamente para esta run deste agente
        log_agent_metrics(nome_agente, payload, score, token_count=1000, latency=latency)
        
        # Salva para dataset DSPy future optimization
        save_good_example(nome_agente, {"query": query_usuario}, payload, score)
        
        # Registro legado para UI Customizada, mantendo estabilidade
        agent_key = nome_agente.replace("agente_", "")
        if agent_key == "financeiro": agent_key = "financial"
        
        try:
            active_version = state.get("prompt_version", "latest")
            mlflow.log_param("app_agent_version", active_version)
        except Exception as e:
            pass
            
        return {
            "relatorios_agentes": {nome_agente: relatorio},
            "insights_agentes": {nome_agente: insights},
            "dados_databricks": {nome_agente: dados},
            "queries_geradas": {nome_agente: sql_final},
            "latencias": {nome_agente: latency},
            "active_node": nome_agente
        }
