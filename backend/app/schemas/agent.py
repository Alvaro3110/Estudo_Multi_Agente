from pydantic import BaseModel
from typing import Optional, Literal, Any


# ─────────────────────────────────────────────────────────────────────────────
# MODELOS DE TABELA ESTRUTURADA
# ─────────────────────────────────────────────────────────────────────────────

class TableColumn(BaseModel):
    """Define uma coluna da tabela, incluindo tipo, alinhamento e agrupamento."""
    key: str                          # chave no dict de dados
    label: str                        # cabeçalho visível
    type: Literal[
        'text', 'number', 'currency',
        'percent', 'delta', 'region', 'status'
    ]
    align: Literal['left', 'right', 'center'] = 'left'
    group: Optional[str] = None       # grupo de colunas (ex: "Receita")
    group_color: Optional[str] = None # cor do grupo (hex)
    width: Optional[str] = None       # ex: "140px"
    sortable: bool = False
    show_sparkline: bool = False      # mini gráfico inline


class ReportTable(BaseModel):
    """Tabela estruturada extraída dos dados reais do Databricks."""
    title: str                        # ex: "Desempenho por região"
    subtitle: Optional[str] = None    # ex: "out/2025 · 2 regiões"
    source_table: Optional[str] = None # ex: "sales_transactions"
    columns: list[TableColumn]
    rows: list[dict[str, Any]]
    delta_row: Optional[dict[str, Any]] = None  # linha Δ comparativa
    total_row: Optional[dict[str, Any]] = None  # linha de totais
    legend: Optional[list[dict[str, str]]] = None
    # ex: [{"color": "#EC0000", "label": "RJ — maior receita"}]


# ─────────────────────────────────────────────────────────────────────────────
# MODELO DE SEÇÃO DO RELATÓRIO
# ─────────────────────────────────────────────────────────────────────────────

class ReportSection(BaseModel):
    """Uma seção tipada dentro do relatório estruturado."""
    type: Literal[
        'narrative',    # texto narrativo com markdown
        'table',        # tabela estruturada
        'action_list',  # lista de ações numeradas
        'conclusion',   # box de conclusão com border esquerda
        'kpi_strip',    # 3-4 KPIs em linha
        'farol',        # lista com dots coloridos
    ]
    label: Optional[str] = None  # label da seção (ex: "resumo executivo")
    content: Optional[str] = None  # para narrative, conclusion
    table: Optional[ReportTable] = None
    items: Optional[list[dict]] = None  # para action_list e farol
    kpis: Optional[list[dict]] = None   # para kpi_strip


# ─────────────────────────────────────────────────────────────────────────────
# MODELO DO RELATÓRIO COMPLETO ESTRUTURADO
# ─────────────────────────────────────────────────────────────────────────────

class ReportStructured(BaseModel):
    """Relatório estruturado gerado pelo consolidador, enviado no evento 'complete'."""
    title: str
    badge_text: Optional[str] = None
    badge_variant: Literal['ok', 'warn', 'error'] = 'ok'
    sections: list[ReportSection]
    score_confianca: Optional[float] = None   # 0.0 a 1.0
    row_count: Optional[int] = None
    source_warning: Optional[str] = None     # ex: "dados financeiros parciais"
    generated_at: Optional[str] = None


# ─────────────────────────────────────────────────────────────────────────────
# MODELOS DE PIPELINE
# ─────────────────────────────────────────────────────────────────────────────

class ChatInput(BaseModel):
    message: str
    department_id: str           # ex: "financeiro", "rh", "logistica"
    group_context: str           # ex: "Varejo Digital SP"
    model_name: str = "claude-sonnet-4-5"
    prompt_version: Optional[str] = "v1.0"


class ResumeInput(BaseModel):
    session_id: str
    approved: bool


class PipelineState(BaseModel):
    steps_done: list[str] = []      # nós já concluídos
    step_active: Optional[str] = None  # nó em execução agora
    steps_pending: list[str] = []   # nós ainda não executados
    current_label: str = ""         # texto humano do que está fazendo
    is_replanning: bool = False     # se está no loop juiz→planner
    replan_count: int = 0           # quantas vezes replanejou
    total_steps: int = 8            # total de nós no grafo


class AgentStep(BaseModel):
    """
    Formato padrão de evento SSE enviado ao Angular.
    O Angular identifica pelo 'type' para renderizar o componente correto.
    """
    type: Literal[
        "thinking",     # spinner de processamento
        "action",       # executando uma etapa (com nome do nó)
        "agent_report", # relatório parcial de um agente especialista
        "checkpoint",   # HITL — frontend deve exibir card de aprovação
        "stream",       # chunk de texto do relatório final
        "complete",     # execução finalizada
        "error"         # erro inesperado
    ]
    agent_id: Optional[str] = None    # ex: "agente_financeiro"
    session_id: Optional[str] = None  # obrigatório em checkpoints
    content: str = ""
    metadata: Optional[dict] = None   # dados extras (score, latência etc.)
    pipeline_state: Optional[PipelineState] = None
    node_detail: Optional[dict] = None  # dados internos de cada nó para o drawer de monitoramento

    # NOVO: relatório estruturado (presente quando type='complete')
    report: Optional[ReportStructured] = None
