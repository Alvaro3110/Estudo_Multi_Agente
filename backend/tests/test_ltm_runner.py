import os
import sqlite3
import sys
from app.core.persona_store import get_preferences, add_preference

def run_tests():
    try:
        # Cleanup (dummy user_id is TEST_LTM_USER)
        if os.path.exists("app/user_personas.sqlite"):
            conn = sqlite3.connect("app/user_personas.sqlite")
            conn.execute("DELETE FROM user_personas WHERE user_id = 'TEST_LTM_USER'")
            conn.commit()
            conn.close()

        user = "TEST_LTM_USER"
        
        # 1. Sem preferencias 
        prefs = get_preferences(user)
        assert prefs == "", "Erro: Esperado string vazia"
        
        # 2. Adiciona primeira preferencia
        add_preference(user, "Gosta de respostas resumidas.")
        prefs = get_preferences(user)
        assert "Gosta de respostas resumidas." in prefs, "Erro step 2"
        
        # 3. Adiciona segunda preferencia (deve apensar)
        add_preference(user, "Foca na região Nordeste.")
        prefs = get_preferences(user)
        assert "Gosta de respostas resumidas." in prefs, "Erro step 3a"
        assert "Foca na região Nordeste." in prefs, "Erro step 3b"
        
        skills = ["agente_vendas", "agente_financeiro", "agente_logistica"]
        for s in skills:
            assert os.path.exists(f"app/graph/skills/{s}.md"), f"Faltando skill file: {s}"
            
        print("✅ TESTES LTM PASSARAM COM SUCESSO!")
    except Exception as e:
        print(f"❌ TESTE FALHOU: {e}")
        sys.exit(1)

if __name__ == "__main__":
    run_tests()
