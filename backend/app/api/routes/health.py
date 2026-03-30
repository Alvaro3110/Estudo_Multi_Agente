from fastapi import APIRouter
from app.core.config import settings

router = APIRouter(prefix="/health", tags=["health"])

@router.get("")
async def health():
    return {
        "status": "ok",
        "env": settings.NODE_ENV,
        "databricks_host": settings.DATABRICKS_HOST,
    }

from utils.schema_cache import schema_cache
from utils.db_connector import pool_status

@router.get("/cache/stats")
async def cache_stats():
    """Retorna métricas do cache de schemas e status do pool."""
    return {
        "schema_cache": schema_cache.stats(),
        "connection_pool": pool_status(),
    }

@router.post("/cache/invalidate")
async def invalidate_cache(pattern: str = ""):
    """Invalida entradas do cache por padrão no nome da chave."""
    removidas = schema_cache.invalidate(pattern)
    return {
        "status": "ok",
        "pattern": pattern or "tudo",
        "entradas_removidas": removidas,
    }

@router.post("/cache/warmup")
async def trigger_warmup():
    """Força re-populamento do cache manualmente."""
    import asyncio
    from main import _warmup_cache
    asyncio.create_task(_warmup_cache())
    return {"status": "warmup iniciado em background"}
