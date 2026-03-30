from app.core.session_store import SessionStore
import asyncio

def test_create_e_get():
    store = SessionStore()
    s = store.create("sid1", "tid1", "financeiro", "Varejo SP", "claude")
    assert store.get("sid1") is s

def test_resume_aprovado():
    store = SessionStore()
    store.create("sid2", "tid2", "rh", "Varejo SP", "claude")
    ok = store.resume("sid2", approved=True)
    assert ok is True
    assert store.get("sid2").approved is True

def test_resume_session_inexistente():
    store = SessionStore()
    ok = store.resume("nao-existe", approved=True)
    assert ok is False

def test_close_desativa_sessao():
    store = SessionStore()
    store.create("sid3", "tid3", "logistica", "Varejo SP", "claude")
    store.close("sid3")
    assert store.get("sid3").is_active is False

def test_active_count():
    store = SessionStore()
    store.create("sid4", "tid4", "financeiro", "Varejo SP", "claude")
    store.create("sid5", "tid5", "rh", "Varejo SP", "claude")
    store.close("sid4")
    assert store.active_count() == 1
