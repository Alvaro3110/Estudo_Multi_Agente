import time
import pytest
from utils.schema_cache import SchemaCache

def test_cache_miss_retorna_none():
    cache = SchemaCache()
    assert cache.get("chave_inexistente") is None

def test_set_e_get():
    cache = SchemaCache()
    cache.set("schema:sales", {"col": "data"})
    assert cache.get("schema:sales") == {"col": "data"}

def test_ttl_expirado_retorna_none():
    cache = SchemaCache(ttl_segundos=1)
    cache.set("chave", "valor")
    time.sleep(1.1)
    assert cache.get("chave") is None

def test_hit_rate_calculado_corretamente():
    cache = SchemaCache()
    cache.set("k1", "v1")
    cache.get("k1")  # hit
    cache.get("k2")  # miss
    stats = cache.stats()
    assert stats["hits"] == 1
    assert stats["misses"] == 1
    assert stats["hit_rate_pct"] == 50.0

def test_invalidate_por_pattern():
    cache = SchemaCache()
    cache.set("schema:sales", 1)
    cache.set("schema:products", 2)
    cache.set("distinct:sales:region", 3)
    removidas = cache.invalidate("schema:")
    assert removidas == 2
    assert cache.get("distinct:sales:region") == 3

def test_invalidate_tudo():
    cache = SchemaCache()
    cache.set("k1", 1)
    cache.set("k2", 2)
    removidas = cache.invalidate()
    assert removidas == 2
    assert cache.stats()["entradas"] == 0

def test_stats_retorna_chaves():
    cache = SchemaCache()
    cache.set("schema:customers", [])
    stats = cache.stats()
    assert "schema:customers" in stats["chaves"]
