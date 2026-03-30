import logging
import uvicorn
from fastapi import FastAPI
from app.core.config import settings
from app.api.middleware.cors import add_cors
from app.api.routes.agent import router as agent_router
from app.api.routes.health import router as health_router

logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO),
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Santander AI — Multi-Agent Backend",
    description="API de orquestração de agentes IA com LangGraph + Databricks",
    version="1.0.0",
)

add_cors(app)
app.include_router(agent_router, prefix="/api")
app.include_router(health_router, prefix="/api")

@app.on_event("startup")
async def startup():
    logger.info("🔴 Santander AI Backend iniciando...")
    
    # Filesystem Lifecycle
    from app.core.fs_manager import executar_cleanup_startup, status_filesystem
    stats = executar_cleanup_startup()
    fs_status = status_filesystem()
    logger.info(f"📁 FS Cleanup: {stats}")
    logger.info(f"📊 FS Status: {fs_status}")
    
    logger.info(f"   Databricks: {settings.DATABRICKS_HOST}")
    logger.info(f"   Ambiente: {settings.NODE_ENV}")
    
    try:
        from app.engine import compilar_multi_agentes
        compilar_multi_agentes()
        logger.info("✅ Grafo LangGraph pré-compilado com sucesso.")
    except Exception as e:
        logger.warning(f"Engine loading error: {e}. Certifique-se que o código do LangGraph existe.")

    # NOVO: warmup do cache em background
    import asyncio
    asyncio.create_task(_warmup_cache())

async def _warmup_cache():
    """
    Pré-aquece o cache de schemas logo após o startup.
    Quando o primeiro usuário fizer uma query, o cache já estará populado.
    """
    import asyncio
    try:
        logger.info("[WARMUP] Iniciando pré-aquecimento do cache Databricks...")
        await asyncio.to_thread(_warmup_sync)
        logger.info("[WARMUP] ✅ Cache de schemas pronto — primeira query será rápida.")
    except Exception as e:
        logger.warning(
            f"[WARMUP] ⚠️ Falhou (não crítico — cache será populado na 1ª query): {e}"
        )

def _warmup_sync():
    """Executa o data_scanner e semantic_layer para popular o cache."""
    from app.graph.nodes.scanner import node_data_scanner
    from app.graph.nodes.semantic_layer import node_categorical_semantic
    state = {}
    state = node_data_scanner(state)
    node_categorical_semantic(state)

@app.on_event("shutdown")
async def shutdown():
    from utils.db_connector import fechar_pool
    fechar_pool()
    logger.info("🔴 Pool de conexões Databricks encerrado.")

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=settings.PORT,
        reload=settings.NODE_ENV == "development",
        log_level=settings.LOG_LEVEL.lower(),
    )
