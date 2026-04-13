import asyncio
import uuid
import logging
import threading
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from app.schemas.agent import ChatInput, ResumeInput, AgentStep
from app.core.session_store import session_store
from app.core.sse_formatter import format_sse, format_sse_done, format_sse_error
from app.engine import compilar_multi_agentes
from app.graph.nodes.consolidador import estruturar_relatorio

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/agent", tags=["agent"])


# ==========================================
# MAPEAMENTO: nó LangGraph → tipo SSE
# ==========================================
NODE_TO_TYPE = {
    "transformer":          "thinking",
    "planner":              "thinking",
    "data_scanner":         "action",
    "categorical_semantic": "action",
    "router":               "action",
    "agente_vendas":        "agent_report",
    "agente_financeiro":    "agent_report",
    "agente_logistica":     "agent_report",
    "consolidador":         "action",
    "gepa":                 "thinking",
    "juiz":                 "thinking",
    "memorizador":          "action",
}

PIPELINE_ORDER = [
    'transformer', 'planner', 'data_scanner', 
    'categorical_semantic', 'router', 
    'agente_vendas', 'agente_financeiro', 'agente_logistica', 
    'consolidador', 'gepa', 'juiz', 'memorizador'
]

INTERNAL_NODES = ['juiz', 'memorizador', 'gepa']

NODE_LABELS = {
    "transformer":          "Compreendendo o contexto da consulta…",
    "planner":              "Planejando estratégia de análise…",
    "data_scanner":         "Buscando metadados no Databricks…",
    "categorical_semantic": "Mapeando dicionário de negócios…",
    "router":               "Acionando agentes especializados…",
    "agente_vendas":        "Agente de Vendas analisando dados…",
    "agente_financeiro":    "Agente Financeiro consultando Databricks…",
    "agente_logistica":     "Agente de Logística processando…",
    "consolidador":         "Consolidando relatórios dos agentes…",
    "gepa":                 "Reflexão sobre qualidade da resposta…",
    "juiz":                 "Avaliando qualidade final…",
    "memorizador":          "Salvando memória da sessão…",
}

def calcular_pipeline_state(
    node: str,
    rendered_nodes: set,
    iteracoes_replanejamento: int = 0
):
    from app.schemas.agent import PipelineState
    visible_nodes = [n for n in PIPELINE_ORDER if n not in INTERNAL_NODES]

    steps_done = [n for n in visible_nodes if n in rendered_nodes]
    step_active = node if node in visible_nodes else None
    steps_pending = [n for n in visible_nodes if n not in rendered_nodes and n != node]

    is_replanning = iteracoes_replanejamento > 0
    label = NODE_LABELS.get(node, f'Processando {node}...')

    return PipelineState(
        steps_done=steps_done,
        step_active=step_active,
        steps_pending=steps_pending,
        current_label=label,
        is_replanning=is_replanning,
        replan_count=iteracoes_replanejamento,
        total_steps=len(PIPELINE_ORDER) - len(INTERNAL_NODES),
    )


def calcular_delta_sem_repeticao(last_consolidacao: str, nova_consolidacao: str) -> str:
    """
    Calcula o delta de texto novo para o stream SSE evitando repetições.
    Problema original: quando o LLM emite o mesmo texto mais de uma vez na fila,
    o simples slicing por len() gera chunks duplicados.
    Solução: verifica se o delta não repete o sufixo do conteúdo já emitido.
    """
    if not nova_consolidacao or nova_consolidacao == last_consolidacao:
        return ""

    # Delta simples por comprimento
    delta = nova_consolidacao[len(last_consolidacao):]

    # Validação anti-repetição: se o final do last já contém o início do delta
    if last_consolidacao and delta:
        # Pega até 100 chars do sufixo do last para verificar sobreposição
        sufixo = last_consolidacao[-min(100, len(last_consolidacao)):]
        if delta.startswith(sufixo) or sufixo in delta:
            # Tenta encontrar onde realmente começa o conteúdo novo
            idx = nova_consolidacao.rfind(sufixo)
            if idx != -1:
                delta = nova_consolidacao[idx + len(sufixo):]

    return delta


async def _run_graph_stream(
    chat_input: ChatInput,
    thread_id: str,
    session_id: str,
):
    """
    Generator assíncrono que faz a ponte entre o LangGraph (Síncrono/SQLite) 
    e o FastAPI (Assíncrono/SSE) usando uma Fila (Queue).
    """
    app = compilar_multi_agentes()
    queue = asyncio.Queue()
    loop = asyncio.get_event_loop()

    config = {"configurable": {"thread_id": thread_id}}
    inputs = {
        "query": chat_input.message,
        "modelo_selecionado": chat_input.model_name,
        "department_id": chat_input.department_id,
        "group_context": chat_input.group_context,
        "thread_id": thread_id,
        "prompt_version": chat_input.prompt_version
    }

    def _producer():
        """Producer: Roda em thread secundária."""
        try:
            logger.info("PRODUCER START")
            for event in app.stream(inputs, config=config, stream_mode="values"):
                logger.info(f"PRODUCER EVENT: {event}")
                loop.call_soon_threadsafe(queue.put_nowait, event)
            logger.info("PRODUCER DONE")
            loop.call_soon_threadsafe(queue.put_nowait, "__DONE__")
        except Exception as e:
            logger.exception(f"[PRODUCER] Erro no stream: {e}")
            loop.call_soon_threadsafe(queue.put_nowait, ("__ERROR__", str(e)))

    # Inicia o producer em uma thread secundária
    logger.info("STARTING PRODUCER THREAD")
    threading.Thread(target=_producer, daemon=True).start()
    
    rendered_nodes = set()
    rendered_reports = set()
    last_consolidacao = ""

    # --- 0. Emite step inicial imediato para evitar timeout/abort do browser ---
    yield format_sse(AgentStep(
        type="thinking",
        session_id=session_id,
        content="Iniciando inteligência multi-agente...",
        pipeline_state=calcular_pipeline_state("transformer", set(), 0)
    ))

    try:
        while True:
            try:
                # Espera por um evento com timeout para enviar heartbeat (keep-alive)
                event = await asyncio.wait_for(queue.get(), timeout=15.0)
            except asyncio.TimeoutError:
                # Envia um comentário SSE como heartbeat para manter a conexão ativa
                yield ": heartbeat\n\n"
                continue
            
            if event == "__DONE__": break
            if isinstance(event, tuple) and event[0] == "__ERROR__":
                yield format_sse_error(event[1])
                break

            node = event.get("active_node", "pensando")
            replan_count = event.get('iteracoes_replanejamento', 0)

            # --- 1. Emite step de status para todos os nós ---
            if node not in rendered_nodes:
                step_type = NODE_TO_TYPE.get(node, "thinking")
                label = NODE_LABELS.get(node, f"Processando {node}…")

                pipeline = calcular_pipeline_state(node, rendered_nodes, replan_count)
                
                # Monta dados ricos para o Drawer de monitoramento
                node_detail: dict = {
                    "node": node,
                    "label": label,
                    "type": step_type,
                    "session_id": session_id,
                    "thread_id": thread_id,
                    "timestamp": asyncio.get_event_loop().time(),
                }
                
                # Dados específicos por nó
                if node == "transformer":
                    node_detail["query_enriquecida"] = event.get("query_enriquecida", "")
                    node_detail["hypotheses"] = event.get("hypotheses", "")
                    node_detail["user_preferences"] = event.get("user_preferences", "")
                    node_detail["model_name"] = chat_input.model_name
                elif node == "planner":
                    plano = event.get("plano_execucao", "")
                    node_detail["plano_execucao"] = plano
                    node_detail["agentes_selecionados"] = event.get("agentes_selecionados", [])
                elif node == "router":
                    node_detail["agentes_selecionados"] = event.get("agentes_selecionados", [])
                elif node == "data_scanner":
                    node_detail["schema_info"] = event.get("schema_info", {})
                elif node == "categorical_semantic":
                    node_detail["dicionario_categorico"] = event.get("dicionario_categorico", {})
                elif node == "consolidador":
                    node_detail["consolidacao_final"] = event.get("consolidacao_final", "")
                elif node == "gepa":
                    node_detail["score_confianca"] = event.get("score_confianca", 1.0)
                    node_detail["feedback_gepa"] = event.get("gepar_feedback", "")
                elif node.startswith("agente_"):
                    node_detail["query_sql"] = event.get("queries_geradas", {}).get(node, "")
                    node_detail["row_count"] = len(event.get("dados_databricks", {}).get(node, []))
                    node_detail["latency"] = event.get("latencias", {}).get(node, 0)
                elif node == "juiz":
                    node_detail["veredito"] = event.get("veredito_juiz", "")
                    node_detail["score_confianca"] = event.get("score_confianca", 1.0)
                    node_detail["iteracoes"] = replan_count
                elif node == "memorizador":
                    node_detail["sugestoes"] = event.get("sugestoes_follow_up", [])
                    node_detail["ltm_user_id"] = event.get("user_id", "")
                
                step = AgentStep(
                    type=step_type,
                    agent_id=node if node.startswith("agente_") else None,
                    session_id=session_id,
                    content=label,
                    pipeline_state=pipeline,
                    node_detail=node_detail
                )
                yield format_sse(step)
                rendered_nodes.add(node)

            # --- 2. Relatório parcial de agente especialista ---
            if node.startswith("agente_"):
                # Captura do dicionário aninhado (Annotated merge_dicts)
                relatorio = event.get("relatorios_agentes", {}).get(node, "")
                if relatorio:
                    insights = event.get("insights_agentes", {}).get(node, [])
                    query_sql = event.get("queries_geradas", {}).get(node, "")
                    dados = event.get("dados_databricks", {}).get(node, [])

                    report_key = f"{node}:{hash(relatorio)}"
                    if report_key not in rendered_reports:
                        step = AgentStep(
                            type="agent_report",
                            agent_id=node,
                            session_id=session_id,
                            content=relatorio,
                            metadata={
                                "insights": insights,
                                "query_sql": query_sql,
                                "row_count": len(dados) if isinstance(dados, list) else 0,
                            }
                        )
                        yield format_sse(step)
                        rendered_reports.add(report_key)

            # --- 3. Consolidação final: emite como stream com fix anti-repetição ---
            consolidacao = event.get("consolidacao_final", "")
            if consolidacao and consolidacao != last_consolidacao:
                delta = calcular_delta_sem_repeticao(last_consolidacao, consolidacao)
                last_consolidacao = consolidacao
                if delta:
                    step = AgentStep(
                        type="stream",
                        session_id=session_id,
                        content=delta,
                    )
                    yield format_sse(step)

            # --- 4. Finalização (Memorizador): inclui relatório estruturado ---
            if node == "memorizador":
                # Monta o relatório estruturado a partir do estado final
                relatorio_estruturado = None
                try:
                    relatorio_estruturado = estruturar_relatorio(event)
                except Exception as e:
                    logger.warning(f"[COMPLETE] Falha ao estruturar relatório: {e}")

                step = AgentStep(
                    type="complete",
                    session_id=session_id,
                    content="Análise corporativa concluída.",
                    report=relatorio_estruturado,
                    metadata={
                        "latencias": event.get("latencias", {}),
                        "sugestoes": event.get("sugestoes_follow_up", []),
                        "score_confianca": event.get("score_confianca", 1.0),
                    }
                )
                yield format_sse(step)

        # O loop termina via __DONE__ ou __ERROR__ enviado pelo producer
        pass
        yield format_sse_done()

    except Exception as e:
        logger.exception(f"[AGENT_ROUTE] Erro ao consumir fila: {e}")
        yield format_sse_error(str(e))
        yield format_sse_done()
    finally:
        session_store.close(session_id)



@router.post("/chat")
async def chat(payload: ChatInput):
    """
    Inicia uma execução do grafo multi-agente com streaming SSE.
    """
    session_id = str(uuid.uuid4())
    thread_id = str(uuid.uuid4())

    session_store.create(
        session_id=session_id,
        thread_id=thread_id,
        department_id=payload.department_id,
        group_context=payload.group_context,
        model_name=payload.model_name,
    )

    logger.info(
        f"[AGENT] Nova sessão: {session_id} | "
        f"Dept: {payload.department_id} | "
        f"Grupo: {payload.group_context}"
    )

    return StreamingResponse(
        _run_graph_stream(payload, thread_id, session_id),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "X-Session-Id": session_id,
        }
    )


@router.post("/resume")
async def resume(payload: ResumeInput):
    """
    Retoma execução pausada em checkpoint HITL.
    """
    success = session_store.resume(payload.session_id, payload.approved)
    if not success:
        raise HTTPException(
            status_code=404,
            detail=f"Sessão {payload.session_id} não encontrada ou inativa."
        )
    action = "aprovada" if payload.approved else "rejeitada"
    logger.info(f"[HITL] Sessão {payload.session_id} {action}.")
    return {"status": "resumed", "approved": payload.approved}


@router.get("/sessions/active")
async def active_sessions():
    """Retorna contagem de sessões ativas (debug/monitoramento)."""
    return {"active_sessions": session_store.active_count()}
