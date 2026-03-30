import time
import logging
from typing import Any

logger = logging.getLogger(__name__)

class SchemaCache:
    """
    Cache em memória para schemas e valores distintos do Databricks.

    TTL padrão: 30 minutos — schemas Delta raramente mudam.
    Primeira execução popula o cache (cache miss).
    Execuções subsequentes servem do cache (economia de 20-40s).

    TODO (produção): substituir por Redis para suporte
    multi-processo e persistência entre restarts.
    """

    def __init__(self, ttl_segundos: int = 1800):
        self._cache: dict[str, tuple[Any, float]] = {}
        self._hits = 0
        self._misses = 0
        self.ttl = ttl_segundos

    def get(self, key: str) -> Any | None:
        if key not in self._cache:
            self._misses += 1
            return None
        value, timestamp = self._cache[key]
        if time.time() - timestamp > self.ttl:
            del self._cache[key]
            self._misses += 1
            logger.info(f"[SchemaCache] TTL expirado: {key}")
            return None
        self._hits += 1
        logger.debug(f"[SchemaCache] HIT: {key}")
        return value

    def set(self, key: str, value: Any) -> None:
        self._cache[key] = (value, time.time())
        logger.debug(f"[SchemaCache] SET: {key}")

    def invalidate(self, pattern: str = "") -> int:
        """
        Invalida entradas do cache por padrão no nome da chave.
        Se pattern vazio, limpa tudo.
        Retorna número de entradas removidas.
        """
        if not pattern:
            count = len(self._cache)
            self._cache.clear()
            logger.info(f"[SchemaCache] Cache totalmente limpo ({count} entradas).")
            return count
        keys = [k for k in self._cache if pattern in k]
        for k in keys:
            del self._cache[k]
        logger.info(f"[SchemaCache] Invalidadas {len(keys)} entradas com '{pattern}'.")
        return len(keys)

    def stats(self) -> dict:
        total = self._hits + self._misses
        hit_rate = round(self._hits / total * 100, 1) if total > 0 else 0
        return {
            "entradas": len(self._cache),
            "hits": self._hits,
            "misses": self._misses,
            "hit_rate_pct": hit_rate,
            "ttl_segundos": self.ttl,
            "chaves": list(self._cache.keys()),
        }


# Singleton global — importar em scanner.py e semantic_layer.py
schema_cache = SchemaCache(ttl_segundos=1800)
