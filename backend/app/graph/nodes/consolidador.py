import re
import dspy
import logging
import json
from datetime import datetime
from typing import Optional
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
    Foca em fidelidade aos dados e clareza executiva SEM CHAMAR LLM.
    """
    logger.info("[NODE] Consolidador unificando inteligência (SEM LLM - Token Saving)...")

    relatorios = state.get("relatorios_agentes", {})

    if not relatorios:
        logger.error("[CONSOLIDADOR] Nenhum relatório recebido dos agentes.")
        relatorio_erro = """
# Relatório de Indisponibilidade
Infelizmente, não foi possível extrair dados para esta consulta.
Por favor, verifique se as tabelas solicitadas estão disponíveis no Databricks.
"""
        return {"consolidacao_final": relatorio_erro, "active_node": "consolidador"}

    # Construção de Markdown Determinística para zero LLM calls
    linhas = [
        "# Relatório Executivo Consolidado",
        "",
        "## Resumo Executivo",
        "Este relatório foi extraído nativamente das camadas especialistas do Databricks via arquitetura determinística de pipeline de agentes IA.",
        "",
        "## Análise Detalhada"
    ]
    
    for agente, texto_report in relatorios.items():
        ag_nome = str(agente).replace("agente_", "").title()
        linhas.append(f"### Perspectiva de {ag_nome}")
        linhas.append(str(texto_report))
        linhas.append("")
        
    linhas.append("## Próximos Passos")
    linhas.append("1. **Revisar Operação** — Solicite auditoria dos dados de negócio aos administradores.")
    linhas.append("2. **Refinar Filtros** — Informe novos parâmetros de precisão.")
    
    return {
        "consolidacao_final": "\n".join(linhas),
        "decisoes_visuais": "{}",
        "active_node": "consolidador"
    }


# ─────────────────────────────────────────────────────────────────────────────
# FUNÇÕES AUXILIARES DE ESTRUTURAÇÃO DO RELATÓRIO
# Estas funções NÃO alteram o nó node_consolidador — apenas transformam
# o estado já produzido em um ReportStructured para o frontend.
# ─────────────────────────────────────────────────────────────────────────────

def estruturar_relatorio(state: dict) -> "ReportStructured":
    """
    Converte o texto do consolidador em ReportStructured.
    Detecta tabelas nos dados do Databricks e as estrutura corretamente.
    Importação lazy para evitar circular imports.
    """
    # Importação lazy dos schemas para evitar circular import no boot
    from app.schemas.agent import ReportStructured, ReportSection

    sections = []

    consolidacao = state.get("consolidacao_final", "") or ""

    # 1. RESUMO EXECUTIVO — sempre presente
    resumo = extrair_secao(consolidacao, ["## Resumo", "## Resume", "Resumo Executivo"])
    if resumo:
        sections.append(ReportSection(
            type="narrative",
            label="resumo executivo",
            content=resumo,
        ))

    # 2. TABELAS — detectar em dados_databricks de cada agente
    dados_databricks = state.get("dados_databricks", {}) or {}
    for agent_id, dados in dados_databricks.items():
        if not dados or not isinstance(dados, list) or len(dados) == 0:
            continue
        if "erro_sql" in str(dados[0]):
            continue

        table = construir_table(agent_id, dados, state)
        if table:
            nome_agente = agent_id.replace("agente_", "").replace("_", " ")
            sections.append(ReportSection(
                type="table",
                label=f"dados — {nome_agente}",
                table=table,
            ))

    # 3. ANÁLISE NARRATIVA — texto após as tabelas
    analise = extrair_secao(consolidacao, ["## Análise", "## Analise", "## Análise Detalhada"])
    if analise:
        sections.append(ReportSection(
            type="narrative",
            label="análise detalhada",
            content=analise,
        ))

    # 4. AÇÕES RECOMENDADAS — detectar lista numerada
    acoes = extrair_acoes(consolidacao)
    if acoes:
        sections.append(ReportSection(
            type="action_list",
            label="ações recomendadas",
            items=acoes,
        ))

    # 5. CONCLUSÃO
    conclusao = extrair_secao(consolidacao, ["## Conclusão", "## Conclusao", "## Próximos Passos"])
    if conclusao:
        sections.append(ReportSection(
            type="conclusion",
            label="conclusão",
            content=conclusao,
        ))

    # Fallback: se não parsear nenhuma seção, inclui tudo como narrativa
    if not sections and consolidacao.strip():
        sections.append(ReportSection(
            type="narrative",
            label="relatório",
            content=consolidacao,
        ))

    return ReportStructured(
        title=extrair_titulo(consolidacao),
        badge_text=calcular_badge(state),
        badge_variant=calcular_badge_variant(state),
        sections=sections,
        score_confianca=state.get("score_confianca") or 0.0,
        row_count=calcular_total_registros(state),
        source_warning=detectar_aviso(state),
        generated_at=datetime.now().strftime("%H:%M"),
    )


def construir_table(
    agent_id: str,
    dados: list,
    state: dict
) -> Optional["ReportTable"]:
    """
    Constrói um ReportTable a partir dos dados brutos do Databricks.
    Detecta automaticamente tipos de colunas pelo nome.
    Retorna None se não houver dados válidos.
    """
    from app.schemas.agent import TableColumn, ReportTable

    if not dados:
        return None

    # Valida que os dados não são só erros de SQL
    if "erro_sql" in str(dados[0]):
        return None

    colunas_raw = list(dados[0].keys())
    columns = []

    for col in colunas_raw[:8]:  # máximo 8 colunas
        col_lower = col.lower()

        # Detectar grupo pelo padrão do nome
        group, group_color = detectar_grupo(col_lower)

        # Detectar tipo da coluna
        if any(k in col_lower for k in
               ["value", "amount", "revenue", "cost", "price",
                "receita", "valor", "custo", "total_r"]):
            tipo = "currency"
            align = "right"
        elif any(k in col_lower for k in
                 ["pct", "percent", "taxa", "margem", "efficiency"]):
            tipo = "percent"
            align = "right"
        elif any(k in col_lower for k in
                 ["var", "change", "delta", "variacao", "delta_"]):
            tipo = "delta"
            align = "right"
        elif any(k in col_lower for k in
                 ["region", "regiao", "status", "estado"]):
            tipo = "region"
            align = "left"
        elif any(k in col_lower for k in
                 ["count", "total", "quantidade", "qty",
                  "transactions", "transacoes"]):
            tipo = "number"
            align = "right"
        else:
            tipo = "text"
            align = "left"

        columns.append(TableColumn(
            key=col,
            label=formatar_label_coluna(col),
            type=tipo,
            align=align,
            group=group,
            group_color=group_color,
            sortable=(tipo in ["currency", "number", "percent"]),
        ))

    # Calcular delta e total quando houver 2 linhas de região
    delta_row = None
    total_row = None
    tem_regiao = any("region" in c.lower() or "regiao" in c.lower()
                     for c in colunas_raw)
    if len(dados) == 2 and tem_regiao:
        delta_row = calcular_delta_row(dados[0], dados[1], columns)
        total_row = calcular_total_row(dados, columns)

    # Extrair nome da tabela de origem da query SQL
    query_sql = (state.get("queries_geradas") or {}).get(agent_id, "")
    source_table = None
    if "FROM" in query_sql.upper():
        partes = query_sql.upper().split("FROM")
        if len(partes) > 1:
            source_table = partes[1].strip().split()[0].lower()

    return ReportTable(
        title=f"Desempenho — {agent_id.replace('agente_', '').replace('_', ' ').title()}",
        subtitle=f"out/2025 · {len(dados)} registros",
        source_table=source_table,
        columns=columns,
        rows=dados,
        delta_row=delta_row,
        total_row=total_row,
        legend=gerar_legenda(dados, columns),
    )


def detectar_grupo(col_lower: str) -> tuple:
    """Identifica grupo semântico da coluna pelo nome."""
    if any(k in col_lower for k in ["receita", "revenue", "vendas", "sales"]):
        return "Receita", "#EC0000"
    if any(k in col_lower for k in ["custo", "cost", "despesa"]):
        return "Custo", "#1565C0"
    if any(k in col_lower for k in
           ["quantidade", "qty", "count", "volume", "transac", "transaction"]):
        return "Volume", "#2E7D32"
    return None, None


def calcular_delta_row(row1: dict, row2: dict, columns: list) -> dict:
    """Calcula a diferença entre duas linhas para exibição como Δ comparativo."""
    delta = {"_label": "Δ comparativo"}
    for col in columns:
        v1 = row1.get(col.key)
        v2 = row2.get(col.key)
        if col.type in ["currency", "number", "percent"] and v1 is not None and v2 is not None:
            try:
                diff = float(v1) - float(v2)
                delta[col.key] = {"value": diff, "type": "delta"}
            except (ValueError, TypeError):
                delta[col.key] = None
        else:
            delta[col.key] = None
    return delta


def calcular_total_row(rows: list, columns: list) -> dict:
    """Soma colunas numéricas para exibir uma linha de totais."""
    total = {"_label": "Total"}
    for col in columns:
        if col.type in ["currency", "number"]:
            valores = []
            for row in rows:
                try:
                    valores.append(float(row.get(col.key, 0) or 0))
                except (ValueError, TypeError):
                    pass
            total[col.key] = sum(valores) if valores else None
        else:
            total[col.key] = None
    return total


def extrair_secao(texto: str, cabecalhos: list) -> str:
    """
    Extrai o conteúdo de uma seção markdown pelo cabeçalho.
    Aceita uma lista de variações de cabeçalho.
    """
    if not texto:
        return ""

    linhas = texto.split("\n")
    capturando = False
    resultado = []

    for linha in linhas:
        linha_limpa = linha.strip()

        # Verifica se é um dos cabeçalhos buscados
        eh_cabecalho_buscado = any(
            linha_limpa.lower().startswith(cab.lower()) or
            linha_limpa.lower().replace("#", "").strip().startswith(
                cab.lstrip("#").strip().lower()
            )
            for cab in cabecalhos
        )

        if eh_cabecalho_buscado:
            capturando = True
            continue

        # Para de capturar ao encontrar outro cabeçalho ## (exceto o buscado)
        if capturando and linha_limpa.startswith("## ") and not eh_cabecalho_buscado:
            break
        if capturando and linha_limpa.startswith("# "):
            break

        if capturando:
            resultado.append(linha)

    return "\n".join(resultado).strip()


def extrair_titulo(texto: str) -> str:
    """Extrai o título principal (# ...) do markdown."""
    if not texto:
        return "Relatório Multi-Agente"
    for linha in texto.split("\n"):
        linha_limpa = linha.strip()
        if linha_limpa.startswith("# ") and not linha_limpa.startswith("## "):
            return linha_limpa.lstrip("# ").strip()
    return "Relatório Multi-Agente"


def extrair_acoes(texto: str) -> list:
    """
    Detecta listas numeradas no markdown e extrai como items de action_list.
    Padrão: '1. Título' ou '1. **Título** — descrição'
    """
    if not texto:
        return []

    acoes = []
    padrao = re.compile(r"^\d+\.\s+(.+)$", re.MULTILINE)
    matches = padrao.findall(texto)

    for match in matches:
        # Separa título de descrição se houver "—" ou ":" no texto
        partes = re.split(r"\s+[—–-]\s+|:\s+", match, maxsplit=1)
        titulo = partes[0].replace("**", "").strip()
        descricao = partes[1].strip() if len(partes) > 1 else ""
        acoes.append({"title": titulo, "description": descricao})

    return acoes


def formatar_label_coluna(col_key: str) -> str:
    """Converte snake_case para label legível com capitalização."""
    mapa = {
        "total_revenue": "Receita Total",
        "total_cost": "Custo Total",
        "total_quantity": "Quantidade",
        "total_transactions": "Transações",
        "region": "Região",
        "regiao": "Região",
        "status": "Status",
        "efficiency": "Eficiência",
        "margem": "Margem",
        "taxa": "Taxa",
    }
    if col_key.lower() in mapa:
        return mapa[col_key.lower()]
    return col_key.replace("_", " ").title()


def calcular_badge(state: dict) -> str:
    """Define o texto do badge de status baseado no score e dados."""
    score = state.get("score_confianca") or 0.0
    if score >= 0.85:
        return "Análise concluída"
    if score >= 0.65:
        return "Atenção: confiança moderada"
    return "Verificação recomendada"


def calcular_badge_variant(state: dict) -> str:
    """Define a variante de cor do badge baseado no score."""
    score = state.get("score_confianca") or 0.0
    if score >= 0.85:
        return "ok"
    if score >= 0.65:
        return "warn"
    return "error"


def calcular_total_registros(state: dict) -> Optional[int]:
    """Soma o total de registros analisados de todos os agentes."""
    dados_db = state.get("dados_databricks") or {}
    total = 0
    for dados in dados_db.values():
        if isinstance(dados, list):
            total += len(dados)
    return total if total > 0 else None


def detectar_aviso(state: dict) -> Optional[str]:
    """
    Detecta situações que merecem aviso: dados parciais, sem registros, etc.
    """
    dados_db = state.get("dados_databricks") or {}
    agentes_sem_dados = []

    for agent_id, dados in dados_db.items():
        if not dados or len(dados) == 0:
            nome = agent_id.replace("agente_", "").replace("_", " ")
            agentes_sem_dados.append(nome)

    if agentes_sem_dados:
        return f"Dados parciais: {', '.join(agentes_sem_dados)} sem retorno"
    return None


def gerar_legenda(dados: list, columns: list) -> Optional[list]:
    """
    Gera a legenda para tabelas de região (ex: RJ → vermelho, SP → azul).
    """
    if not dados:
        return None

    col_regiao = next((c for c in columns if c.type == "region"), None)
    if not col_regiao:
        return None

    CORES_REGIAO = {
        "RJ": "#EC0000",
        "SP": "#1565C0",
        "MG": "#2E7D32",
        "RS": "#6A1B9A",
        "BA": "#E65100",
    }

    legenda = []
    regioes_vistas = set()

    for row in dados:
        regiao = str(row.get(col_regiao.key, "")).upper()
        if regiao and regiao not in regioes_vistas:
            regioes_vistas.add(regiao)
            cor = CORES_REGIAO.get(regiao, "#888888")
            legenda.append({"color": cor, "label": f"{regiao} — região analisada"})

    return legenda if legenda else None
