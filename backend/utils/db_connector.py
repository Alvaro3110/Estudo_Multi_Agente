import os
import re
import threading
import logging
from databricks import sql as databricks_sql
from typing import List, Dict, Any
from app.core.config import settings

logger = logging.getLogger(__name__)

# ==========================================
# CONNECTION POOL — SINGLETON
# ==========================================
# Mantém até POOL_SIZE conexões abertas e reutiliza entre queries.
# Economiza ~1-2s de handshake por chamada ao Databricks.
# check_same_thread=False necessário pois FastAPI usa threads separadas.
# TODO (produção): usar biblioteca de pool dedicada como SQLAlchemy pool.

_pool_lock = threading.Lock()
_connection_pool: list = []
POOL_SIZE = 5

def _build_connection():
    """Abre uma nova conexão Databricks SQL."""
    host = settings.DATABRICKS_HOST.replace("https://", "").rstrip("/")
    return databricks_sql.connect(
        server_hostname=host,
        http_path=settings.DATABRICKS_WAREHOUSE_ID,
        access_token=settings.DATABRICKS_TOKEN,
    )

def _get_connection():
    """
    Retorna conexão do pool se disponível.
    Caso contrário, abre uma nova.
    """
    with _pool_lock:
        if _connection_pool:
            conn = _connection_pool.pop()
            logger.debug("[Pool] Conexão reutilizada do pool.")
            return conn
    logger.info("[Pool] Pool vazio — abrindo nova conexão Databricks.")
    return _build_connection()

def _release_connection(conn):
    """
    Devolve a conexão ao pool se há espaço.
    Caso contrário, fecha a conexão.
    """
    with _pool_lock:
        if len(_connection_pool) < POOL_SIZE:
            _connection_pool.append(conn)
            logger.debug(f"[Pool] Conexão devolvida. Pool: {len(_connection_pool)}/{POOL_SIZE}")
            return
    conn.close()
    logger.debug("[Pool] Pool cheio — conexão descartada.")

def executar_query_databricks(
    query_sql: str,
    catalog: str = None,
    schema: str = None
) -> List[Dict[Any, Any]]:
    """
    Executa Spark SQL no Databricks Warehouse com limite automático e reuse de pool.
    """
    if catalog is None: catalog = os.environ.get("DATABRICKS_CATALOG", "estudo_multi_agente")
    if schema is None: schema = os.environ.get("DATABRICKS_SCHEMA", "bronze")
    
    if not query_sql:
        return [{"erro": "Query vazia."}]
        
    conn = _get_connection()
    try:
        with conn.cursor() as cursor:
            query_bruta = query_sql.strip().rstrip(";")
            
            # Prevenção contra múltiplas queries geradas pelo LLM (Erro Databricks PARSE_SYNTAX_ERROR)
            queries_separadas = [q.strip() for q in query_bruta.split(';') if q.strip()]
            query_limpa = queries_separadas[0] if queries_separadas else query_bruta
            
            query_upper = query_limpa.upper()
            # Define o contexto explicitamente (Boas práticas Spark)
            cursor.execute(f"USE CATALOG {catalog}")
            cursor.execute(f"USE SCHEMA {schema}")
            
            # Auto-limit para segurança corporativa
            if re.search(r"\bLIMIT\b", query_upper):
                query_to_run = query_limpa
            elif any(kw in query_upper for kw in ["SELECT ", "WITH ", "SHOW ", "DESCRIBE "]):
                # Aplica limit apenas em selects/withs
                if "LIMIT" not in query_upper:
                    query_to_run = f"{query_limpa} LIMIT 50"
                else:
                    query_to_run = query_limpa
            else:
                query_to_run = query_limpa
                
            logger.info(f"[Databricks] Executando em {catalog}.{schema}: {query_to_run[:100]}...")
            cursor.execute(query_to_run)
            
            if cursor.description:
                resultado = cursor.fetchall()
                columns = [desc[0] for desc in cursor.description]
                return [dict(zip(columns, row)) for row in resultado]
            return [{"status": "sucesso", "mensagem": "Comando executado sem retorno de dados."}]
            
    except Exception as e:
        # Conexão com erro — descartar, não devolver ao pool
        try:
            conn.close()
        except Exception:
            pass
        logger.error(f"[Databricks] Erro ao executar query: {e}")
        return [{"erro_sql": str(e), "query_tentada": query_sql}]
    else:
        _release_connection(conn)

def pool_status() -> dict:
    """Retorna status atual do pool (para health check)."""
    with _pool_lock:
        return {
            "conexoes_disponiveis": len(_connection_pool),
            "tamanho_maximo": POOL_SIZE,
        }

def fechar_pool():
    """Fecha todas as conexões do pool (chamar no shutdown)."""
    with _pool_lock:
        while _connection_pool:
            conn = _connection_pool.pop()
            try:
                conn.close()
            except Exception:
                pass
    logger.info("[Pool] Pool encerrado.")
