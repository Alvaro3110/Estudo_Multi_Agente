"""
Testes unitários para as funções auxiliares de estruturação de relatórios.
Cobre: construir_table, calcular_delta_row, calcular_total_row, estruturar_relatorio.

Executar com: pytest tests/test_relatorio_estruturado.py -v
"""
import pytest
from app.graph.nodes.consolidador import (
    construir_table,
    calcular_delta_row,
    calcular_total_row,
    detectar_grupo,
    estruturar_relatorio,
    extrair_titulo,
    extrair_acoes,
    calcular_total_registros,
)
from app.schemas.agent import ReportStructured, ReportTable, TableColumn


# ─────────────────────────────────────────────────────────────────────────────
# FIXTURES
# ─────────────────────────────────────────────────────────────────────────────

DADOS_REGIAO = [
    {
        "region": "RJ",
        "total_revenue": 1688622216.50,
        "total_cost": 326950677.18,
        "total_quantity": 6493215,
        "total_transactions": 2164622,
    },
    {
        "region": "SP",
        "total_revenue": 1686104508.75,
        "total_cost": 326430683.26,
        "total_quantity": 6485269,
        "total_transactions": 2164299,
    },
]

MOCK_STATE = {
    "consolidacao_final": """
## Relatório de Vendas

## Resumo Executivo
O presente relatório analisa vendas e custos.

## Análise Detalhada
RJ lidera com margem comprimida.

## Conclusão e Próximos Passos
Foco em redução de custos.

1. Reduzir custos operacionais em RJ
2. Expandir portfólio em SP
""",
    "dados_databricks": {"agente_vendas": DADOS_REGIAO},
    "score_confianca": 0.78,
    "queries_geradas": {
        "agente_vendas": "SELECT * FROM sales_transactions WHERE region IN ('RJ','SP')"
    },
}


# ─────────────────────────────────────────────────────────────────────────────
# TESTES: construir_table
# ─────────────────────────────────────────────────────────────────────────────

def test_construir_table_retorna_objeto():
    table = construir_table("agente_vendas", DADOS_REGIAO, {})
    assert isinstance(table, ReportTable)


def test_construir_table_detecta_currency():
    table = construir_table("agente_vendas", DADOS_REGIAO, {})
    col_revenue = next(c for c in table.columns if "revenue" in c.key)
    assert col_revenue.type == "currency"
    assert col_revenue.align == "right"


def test_construir_table_detecta_number():
    table = construir_table("agente_vendas", DADOS_REGIAO, {})
    col_qty = next(c for c in table.columns if "quantity" in c.key)
    assert col_qty.type == "number"


def test_construir_table_detecta_grupo_receita():
    table = construir_table("agente_vendas", DADOS_REGIAO, {})
    col_revenue = next(c for c in table.columns if "revenue" in c.key)
    assert col_revenue.group == "Receita"
    assert col_revenue.group_color == "#EC0000"


def test_construir_table_detecta_grupo_custo():
    table = construir_table("agente_vendas", DADOS_REGIAO, {})
    col_cost = next(c for c in table.columns if "cost" in c.key)
    assert col_cost.group == "Custo"
    assert col_cost.group_color == "#1565C0"


def test_construir_table_gera_delta_row_com_2_regioes():
    table = construir_table("agente_vendas", DADOS_REGIAO, {})
    assert table.delta_row is not None
    assert "_label" in table.delta_row


def test_construir_table_gera_total_row():
    table = construir_table("agente_vendas", DADOS_REGIAO, {})
    assert table.total_row is not None
    total_rev = table.total_row.get("total_revenue")
    assert total_rev == pytest.approx(
        DADOS_REGIAO[0]["total_revenue"] + DADOS_REGIAO[1]["total_revenue"]
    )


def test_construir_table_maximo_8_colunas():
    dados = [{f"col_{i}": i for i in range(12)}]
    table = construir_table("agente_test", dados, {})
    assert len(table.columns) <= 8


def test_construir_table_dados_vazios_retorna_none():
    result = construir_table("agente_test", [], {})
    assert result is None


def test_construir_table_dados_com_erro_sql_retorna_none():
    dados_erro = [{"erro_sql": "UNRESOLVED_COLUMN"}]
    result = construir_table("agente_test", dados_erro, {})
    assert result is None


def test_construir_table_extrai_source_table():
    state = {
        "queries_geradas": {
            "agente_vendas": "SELECT * FROM sales_transactions WHERE region = 'RJ'"
        }
    }
    table = construir_table("agente_vendas", DADOS_REGIAO, state)
    assert table.source_table == "sales_transactions"


# ─────────────────────────────────────────────────────────────────────────────
# TESTES: calcular_delta_row
# ─────────────────────────────────────────────────────────────────────────────

def test_delta_row_calcula_diferenca():
    columns = [
        TableColumn(key="region", label="Região", type="region", align="left",
                    sortable=False, show_sparkline=False),
        TableColumn(key="revenue", label="Receita", type="currency", align="right",
                    sortable=True, show_sparkline=False),
    ]
    row1 = {"region": "RJ", "revenue": 1000}
    row2 = {"region": "SP", "revenue": 900}
    delta = calcular_delta_row(row1, row2, columns)
    assert delta["revenue"]["value"] == pytest.approx(100.0)


def test_delta_row_ignora_coluna_texto():
    columns = [
        TableColumn(key="region", label="Região", type="region", align="left",
                    sortable=False, show_sparkline=False)
    ]
    delta = calcular_delta_row({"region": "RJ"}, {"region": "SP"}, columns)
    assert delta.get("region") is None


def test_delta_row_label():
    columns = []
    delta = calcular_delta_row({}, {}, columns)
    assert "_label" in delta
    assert delta["_label"] == "Δ comparativo"


# ─────────────────────────────────────────────────────────────────────────────
# TESTES: calcular_total_row
# ─────────────────────────────────────────────────────────────────────────────

def test_total_row_soma_valores():
    columns = [
        TableColumn(key="region", label="Região", type="region", align="left",
                    sortable=False, show_sparkline=False),
        TableColumn(key="revenue", label="Receita", type="currency", align="right",
                    sortable=True, show_sparkline=False),
    ]
    rows = [{"region": "RJ", "revenue": 1000}, {"region": "SP", "revenue": 900}]
    total = calcular_total_row(rows, columns)
    assert total["revenue"] == pytest.approx(1900.0)


def test_total_row_coluna_texto_eh_none():
    columns = [
        TableColumn(key="region", label="Região", type="region", align="left",
                    sortable=False, show_sparkline=False),
    ]
    rows = [{"region": "RJ"}, {"region": "SP"}]
    total = calcular_total_row(rows, columns)
    assert total.get("region") is None


# ─────────────────────────────────────────────────────────────────────────────
# TESTES: estruturar_relatorio
# ─────────────────────────────────────────────────────────────────────────────

def test_estruturar_relatorio_retorna_objeto():
    report = estruturar_relatorio(MOCK_STATE)
    assert isinstance(report, ReportStructured)


def test_estruturar_relatorio_tem_secoes():
    report = estruturar_relatorio(MOCK_STATE)
    assert len(report.sections) > 0


def test_estruturar_relatorio_inclui_tabela():
    report = estruturar_relatorio(MOCK_STATE)
    tipos = [s.type for s in report.sections]
    assert "table" in tipos


def test_estruturar_relatorio_score_preservado():
    report = estruturar_relatorio(MOCK_STATE)
    assert report.score_confianca == pytest.approx(0.78)


def test_estruturar_relatorio_sem_dados_retorna_sem_tabela():
    state_sem_dados = {**MOCK_STATE, "dados_databricks": {}}
    report = estruturar_relatorio(state_sem_dados)
    tipos = [s.type for s in report.sections]
    assert "table" not in tipos


def test_estruturar_relatorio_fallback_quando_sem_secoes():
    """Se não parsear nenhuma seção, deve incluir conteúdo como narrativa fallback."""
    state_simples = {
        "consolidacao_final": "Texto simples sem headings.",
        "dados_databricks": {},
        "score_confianca": 0.9,
    }
    report = estruturar_relatorio(state_simples)
    assert len(report.sections) == 1
    assert report.sections[0].type == "narrative"


def test_estruturar_relatorio_inclui_acoes():
    report = estruturar_relatorio(MOCK_STATE)
    tipos = [s.type for s in report.sections]
    assert "action_list" in tipos


# ─────────────────────────────────────────────────────────────────────────────
# TESTES: bug de texto repetido no SSE
# ─────────────────────────────────────────────────────────────────────────────

def test_delta_nao_repete_sufixo():
    from app.api.routes.agent import calcular_delta_sem_repeticao
    last = "Texto inicial. Mais conteúdo"
    new_full = "Texto inicial. Mais conteúdo adicionado aqui"
    delta = calcular_delta_sem_repeticao(last, new_full)
    assert delta == " adicionado aqui"


def test_delta_retorna_vazio_quando_igual():
    from app.api.routes.agent import calcular_delta_sem_repeticao
    texto = "Texto já emitido."
    delta = calcular_delta_sem_repeticao(texto, texto)
    assert delta == ""


def test_delta_retorna_vazio_quando_nova_eh_vazia():
    from app.api.routes.agent import calcular_delta_sem_repeticao
    delta = calcular_delta_sem_repeticao("algum texto", "")
    assert delta == ""
