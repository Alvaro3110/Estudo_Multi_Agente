import pytest
import os
import sqlite3
from app.core.persona_store import get_preferences, add_preference

@pytest.fixture(autouse=True)
def setup_teardown():
    # Setup test DB or just use a dummy user_id
    yield
    # Cleanup (dummy user_id is TEST_LTM_USER)
    conn = sqlite3.connect("app/user_personas.sqlite")
    conn.execute("DELETE FROM user_personas WHERE user_id = 'TEST_LTM_USER'")
    conn.commit()
    conn.close()

def test_ltm_add_and_retrieve():
    user = "TEST_LTM_USER"
    
    # 1. Sem preferencias 
    prefs = get_preferences(user)
    assert prefs == ""
    
    # 2. Adiciona primeira preferencia
    add_preference(user, "Gosta de respostas resumidas.")
    prefs = get_preferences(user)
    assert "Gosta de respostas resumidas." in prefs
    
    # 3. Adiciona segunda preferencia (deve apensar)
    add_preference(user, "Foca na região Nordeste.")
    prefs = get_preferences(user)
    assert "Gosta de respostas resumidas." in prefs
    assert "Foca na região Nordeste." in prefs
    
def test_skill_files_existence():
    skills = ["agente_vendas", "agente_financeiro", "agente_logistica"]
    for s in skills:
        assert os.path.exists(f"app/graph/skills/{s}.md"), f"Faltando skill file para {s}"
