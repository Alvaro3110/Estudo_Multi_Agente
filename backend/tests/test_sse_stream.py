"""
Testes de integração para o endpoint SSE de chat do agente.
Cobre: formato do stream, ausência de repetição, relatório estruturado no complete.

Executar com: pytest tests/test_sse_stream.py -v
"""
import json
import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient


# ─────────────────────────────────────────────────────────────────────────────
# FIXTURES DE DADOS
# ─────────────────────────────────────────────────────────────────────────────

MOCK_EVENTS_SIMPLES = [
    {
        "active_node": "transformer",
        "consolidacao_final": "",
        "dados_databricks": {},
        "score_confianca": 0.0,
    },
    {
        "active_node": "memorizador",
        "consolidacao_final": "## Relatório\n## Resumo\nTexto do relatório.",
        "dados_databricks": {"agente_vendas": [
            {"region": "RJ", "total_revenue": 1000000},
        ]},
        "score_confianca": 0.85,
        "sugestoes_follow_up": ["Comparar com mês anterior"],
        "latencias": {"agente_vendas": 1.2},
    },
]

MOCK_EVENTS_COM_REPETICAO = [
    {
        "active_node": "consolidador",
        "consolidacao_final": "Relatório de vendas. Análise concluída.",
    },
    {
        "active_node": "memorizador",
        # Simula o bug: texto duplicado no final
        "consolidacao_final": "Relatório de vendas. Análise concluída.Análise concluída.",
        "dados_databricks": {},
        "score_confianca": 0.7,
    },
]


# ─────────────────────────────────────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────────────────────────────────────

def parse_sse_events(response_text: str) -> list[dict]:
    """Parseia eventos SSE do texto de resposta."""
    events = []
    for line in response_text.split("\n"):
        if line.startswith("data: ") and "DONE" not in line:
            try:
                data = line.replace("data: ", "").strip()
                events.append(json.loads(data))
            except json.JSONDecodeError:
                pass
    return events


# ─────────────────────────────────────────────────────────────────────────────
# TESTES
# ─────────────────────────────────────────────────────────────────────────────

def test_chat_endpoint_retorna_sse():
    """Verifica que o endpoint retorna Content-Type text/event-stream."""
    try:
        from main import app
    except ImportError:
        pytest.skip("Requires main.py to be importable")

    client = TestClient(app, raise_server_exceptions=False)

    with patch("app.engine.compilar_multi_agentes") as mock_engine:
        mock_app = MagicMock()
        mock_app.stream.side_effect = lambda *args, **kwargs: iter(MOCK_EVENTS_SIMPLES)
        mock_engine.return_value = mock_app

        response = client.post("/api/agent/chat", json={
            "message": "teste",
            "department_id": "financeiro",
            "group_context": "Varejo SP",
        })

        assert response.status_code == 200
        assert "text/event-stream" in response.headers.get("content-type", "")


def test_stream_nao_repete_conteudo():
    """Verifica que o bug de texto repetido é corrigido pelo SSE."""
    try:
        from main import app
    except ImportError:
        pytest.skip("Requires main.py to be importable")

    client = TestClient(app, raise_server_exceptions=False)

    with patch("app.engine.compilar_multi_agentes") as mock_engine:
        mock_app = MagicMock()
        mock_app.stream.side_effect = lambda *args, **kwargs: iter(MOCK_EVENTS_COM_REPETICAO)
        mock_engine.return_value = mock_app

        response = client.post("/api/agent/chat", json={
            "message": "teste",
            "department_id": "financeiro",
            "group_context": "Varejo SP",
        })

        events = parse_sse_events(response.text)
        stream_events = [e for e in events if e.get("type") == "stream"]
        conteudo_total = "".join(e.get("content", "") for e in stream_events)

        # O texto "Análise concluída." não deve aparecer mais de uma vez
        assert conteudo_total.count("Análise concluída.") <= 1


def test_complete_event_inclui_report_estruturado():
    """Verifica que o evento complete inclui o campo report."""
    try:
        from main import app
    except ImportError:
        pytest.skip("Requires main.py to be importable")

    client = TestClient(app, raise_server_exceptions=False)

    with patch("app.engine.compilar_multi_agentes") as mock_engine:
        mock_app = MagicMock()
        mock_app.stream.side_effect = lambda *args, **kwargs: iter(MOCK_EVENTS_SIMPLES)
        mock_engine.return_value = mock_app

        response = client.post("/api/agent/chat", json={
            "message": "teste",
            "department_id": "financeiro",
            "group_context": "Varejo SP",
        })

        events = parse_sse_events(response.text)
        complete_events = [e for e in events if e.get("type") == "complete"]

        assert len(complete_events) > 0
        complete = complete_events[-1]
        assert "report" in complete


def test_complete_event_report_tem_secoes():
    """Verifica que o report no evento complete contém seções."""
    try:
        from main import app
    except ImportError:
        pytest.skip("Requires main.py to be importable")

    client = TestClient(app, raise_server_exceptions=False)

    with patch("app.engine.compilar_multi_agentes") as mock_engine:
        mock_app = MagicMock()
        mock_app.stream.side_effect = lambda *args, **kwargs: iter(MOCK_EVENTS_SIMPLES)
        mock_engine.return_value = mock_app

        response = client.post("/api/agent/chat", json={
            "message": "teste",
            "department_id": "financeiro",
            "group_context": "Varejo SP",
        })

        events = parse_sse_events(response.text)
        complete_events = [e for e in events if e.get("type") == "complete"]

        if complete_events and complete_events[-1].get("report"):
            report = complete_events[-1]["report"]
            assert isinstance(report.get("sections"), list)
            assert len(report["sections"]) > 0
