import logging
import uvicorn
from fastapi import FastAPI
from app.core.config import settings
from app.api.middleware.cors import add_cors
from app.api.routes.agent import router as agent_router
from app.api.routes.health import router as health_router
from app.api.routes.auth import router as auth_router
from app.api.routes.user import router as user_router
from app.api.routes.mlflow import router as mlflow_router
from app.api.routes.prompts import router as prompts_router

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
app.include_router(auth_router, prefix="/api")
app.include_router(user_router, prefix="/api")
app.include_router(mlflow_router, prefix="/api")
app.include_router(prompts_router, prefix="/api")

@app.middleware("http")
async def log_requests(request, call_next):
    logger.info(f"🔍 [REQUEST] {request.method} {request.url}")
    response = await call_next(request)
    logger.info(f"📊 [RESPONSE] {request.method} {request.url} - {response.status_code}")
    return response

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

    # MLflow Lifecycle
    try:
        from utils.mlflow_helper import inicializar_mlflow
        inicializar_mlflow()
        
        # Opcional: Seed de prompts
        # from app.prompts.financial_agent import init_financial_prompts
        # init_financial_prompts()
        # Movido para warmup background para não travar o startup da porta 4000
    except Exception as e:
        logger.warning(f"⚠️ Erro ao inicializar MLflow: {e}")

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
    """Executa o data_scanner e semantic_layer e prompts mlflow."""
    try:
        from app.prompts.genai_setup import setup_genai_prompts
        setup_genai_prompts()
    except Exception as e:
        import logging
        logging.getLogger(__name__).warning(f"Erro ao inicializar seed prompts no background: {e}")
        
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
