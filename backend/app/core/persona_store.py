import sqlite3
import os
import logging
from functools import lru_cache

logger = logging.getLogger(__name__)

PERSONA_DB_PATH = "app/user_personas.sqlite"

@lru_cache(maxsize=1)
def __get_persona_connection() -> sqlite3.Connection:
    os.makedirs(os.path.dirname(PERSONA_DB_PATH), exist_ok=True)
    conn = sqlite3.connect(PERSONA_DB_PATH, check_same_thread=False)
    
    # Criar tabela se não existir
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_personas (
            user_id TEXT PRIMARY KEY,
            preferences TEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    return conn

def get_preferences(user_id: str) -> str:
    """Busca as preferências/aprendizados de longo prazo de um usuário."""
    if not user_id: return ""
    conn = __get_persona_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT preferences FROM user_personas WHERE user_id = ?", (user_id,))
    row = cursor.fetchone()
    return row[0] if row else ""

def add_preference(user_id: str, nova_preferencia: str):
    """Adiciona/Atualiza um novo insight aprendido sobre o usuário."""
    if not user_id or not nova_preferencia: return
    
    conn = __get_persona_connection()
    cursor = conn.cursor()
    
    prefs_atuais = get_preferences(user_id)
    # Se já existir contexto, apensa com quebra de linha. Se não, apenas salva.
    nova_string = f"{prefs_atuais}\n- {nova_preferencia}".strip() if prefs_atuais else f"- {nova_preferencia}"
    
    # Limita o tamanho do LTM para não estourar o limite de tokens do LLM (ex: manter as últimas 2000 letras)
    if len(nova_string) > 2000:
        nova_string = nova_string[-2000:]
        
    cursor.execute("""
        INSERT INTO user_personas (user_id, preferences)
        VALUES (?, ?)
        ON CONFLICT(user_id) DO UPDATE SET 
            preferences = excluded.preferences,
            updated_at = CURRENT_TIMESTAMP
    """, (user_id, nova_string))
    
    conn.commit()
    logger.info(f"[LTM] Preferência aprendida para user '{user_id}': {nova_preferencia}")
