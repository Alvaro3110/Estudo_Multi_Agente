from pydantic import BaseModel
from typing import Optional, Literal

class ChatInput(BaseModel):
    message: str
    department_id: str           # ex: "financeiro", "rh", "logistica"
    group_context: str           # ex: "Varejo Digital SP"
    model_name: str = "claude-sonnet-4-5"

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
        "thinking",    # spinner de processamento
        "action",      # executando uma etapa (com nome do nó)
        "agent_report",# relatório parcial de um agente especialista
        "checkpoint",  # HITL — frontend deve exibir card de aprovação
        "stream",      # chunk de texto do relatório final
        "complete",    # execução finalizada
        "error"        # erro inesperado
    ]
    agent_id: Optional[str] = None    # ex: "agente_financeiro"
    session_id: Optional[str] = None  # obrigatório em checkpoints
    content: str = ""
    metadata: Optional[dict] = None   # dados extras (score, latência etc.)
    pipeline_state: Optional[PipelineState] = None
