import json
from app.schemas.agent import AgentStep

def format_sse(step: AgentStep) -> str:
    """
    Formata um AgentStep como evento SSE válido.
    Formato: 'data: {json}\\n\\n'
    O Angular parseia o JSON e roteia para o componente correto via step.type.
    """
    return f"data: {step.model_dump_json()}\n\n"

def format_sse_done() -> str:
    return "data: [DONE]\n\n"

def format_sse_error(message: str) -> str:
    step = AgentStep(type="error", content=message)
    return f"data: {step.model_dump_json()}\n\n"
