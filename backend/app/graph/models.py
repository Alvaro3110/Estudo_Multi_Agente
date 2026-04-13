import dspy
from pydantic import BaseModel, Field
from typing import List, Dict, Optional

class GerarSQL(dspy.Signature):
    """
    Gera uma query SQL válida para Spark SQL (Databricks) baseada no schema fornecido.
    Importante: Use nomes de tabelas qualificados (catalog.schema.table).
    """
    schema_disponivel = dspy.InputField(desc="Informações de tabelas, colunas e tipos.")
    query = dspy.InputField(desc="Pergunta do usuário em linguagem natural.")
    dominio_do_agente = dspy.InputField(desc="Especialidade do agente (ex: Vendas, Financeiro).")
    sql_query = dspy.OutputField(desc="A query SQL gerada.")

class GerarRelatorioDominio(dspy.Signature):
    """
    Transforma dados JSON do banco em um relatório executivo estratégico.
    """
    query_usuario = dspy.InputField(desc="A pergunta original.")
    json_extraido_do_banco = dspy.InputField(desc="Dados JSON brutos.")
    instrucoes_de_skill = dspy.InputField(desc="Instrucões de conduta textuais (Skill) definidas para este agente.", default="")
    relatorio = dspy.OutputField(desc="""
        Relatório executivo estruturado em Markdown. 
        REGRAS: 
        1. Use h1 (#) para o título e h2 (##) para seções. 
        2. Use Tabelas Markdown para dados comparativos.
        3. Use negrito para KPIs importantes.
        4. Insira DUAS quebras de linha entre parágrafos e seções.
    """)
    insights = dspy.OutputField(desc="Lista de insights estratégicos.")
    incerteza_escalar = dspy.OutputField(desc="True se os dados forem inconclusivos.")

class AgentInput(BaseModel):
    query: str
    department_id: str
    thread_id: str

class AgentOutput(BaseModel):
    relatorio: str
    insights: List[str]
    sql: str
