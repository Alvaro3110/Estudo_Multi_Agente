import os
import time
import shutil
import pytest
from pathlib import Path
from app.core.fs_manager import (
    WORKSPACE_ROOT, MEMORIES_ROOT, garantir_diretorios, 
    salvar_em_workspace, limpar_workspace_antigo, status_filesystem
)

@pytest.fixture(autouse=True)
def setup_teardown():
    # Setup: garante base limpa
    if WORKSPACE_ROOT.exists():
        shutil.rmtree(WORKSPACE_ROOT)
    garantir_diretorios()
    yield
    # Teardown: limpa após teste
    if WORKSPACE_ROOT.exists():
        shutil.rmtree(WORKSPACE_ROOT)

def test_garantir_diretorios():
    garantir_diretorios()
    assert WORKSPACE_ROOT.exists()
    assert MEMORIES_ROOT.exists()

def test_salvar_e_ler_workspace():
    thread_id = "test_thread_123"
    content = {"key": "value"}
    path = salvar_em_workspace(thread_id, "data.json", content)
    
    assert Path(path).exists()
    assert thread_id in path
    
    from app.core.fs_manager import ler_de_workspace
    lido = ler_de_workspace(thread_id, "data.json")
    assert lido == content

def test_limpar_workspace_antigo():
    thread_id = "old_thread"
    salvar_em_workspace(thread_id, "old.txt", "conteudo")
    
    # Mock do mtime para parecer antigo (3 horas atrás)
    old_item = WORKSPACE_ROOT / thread_id
    past_time = time.time() - (3 * 3600)
    os.utime(old_item, (past_time, past_time))
    
    # TTL de 2 horas (7200s)
    removidos = limpar_workspace_antigo(ttl_segundos=7200)
    
    assert removidos == 1
    assert not old_item.exists()

def test_status_filesystem():
    salvar_em_workspace("t1", "f1.txt", "x")
    status = status_filesystem()
    assert status["workspace"]["itens"] >= 1
    assert "tamanho_kb" in status["workspace"]
