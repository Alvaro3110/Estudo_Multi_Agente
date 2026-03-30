import os
import shutil
import time
import logging
import json
from pathlib import Path

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Configuração das Raízes (Centralizado em backend/)
# ---------------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent.parent
WORKSPACE_ROOT = BASE_DIR / "workspace"
MEMORIES_ROOT  = BASE_DIR / "memories"
LOGS_ROOT      = BASE_DIR / "logs"

# ---------------------------------------------------------------------------
# TTL (Time-To-Live) por zona — em segundos
# ---------------------------------------------------------------------------
WORKSPACE_TTL_SECONDS = 2 * 60 * 60   # 2 horas
LOGS_TTL_SECONDS      = 24 * 60 * 60  # 24 horas

def garantir_diretorios():
    """Cria as pastas base se não existirem."""
    for pasta in [WORKSPACE_ROOT, MEMORIES_ROOT, LOGS_ROOT]:
        pasta.mkdir(parents=True, exist_ok=True)

def limpar_workspace_antigo(ttl_segundos: int = WORKSPACE_TTL_SECONDS) -> int:
    garantir_diretorios()
    agora = time.time()
    removidos = 0
    if not WORKSPACE_ROOT.exists(): return 0
    
    for item in WORKSPACE_ROOT.iterdir():
        if not item.is_dir():
            continue
        try:
            ultimo_acesso = item.stat().st_mtime
            idade = agora - ultimo_acesso
            if idade > ttl_segundos:
                shutil.rmtree(item)
                logger.info(f"[FS Lifecycle] 🗑️ Workspace expirado removido: {item.name}")
                removidos += 1
        except Exception as e:
            logger.warning(f"[FS Lifecycle] ⚠️ Erro ao remover {item}: {e}")
    return removidos

def limpar_workspace_thread(thread_id: str):
    pasta = WORKSPACE_ROOT / str(thread_id)
    if pasta.exists():
        try:
            shutil.rmtree(pasta)
        except Exception as e:
            logger.warning(f"[FS Lifecycle] ⚠️ Erro ao remover workspace '{thread_id}': {e}")

def limpar_logs_antigos(ttl_segundos: int = LOGS_TTL_SECONDS) -> int:
    garantir_diretorios()
    agora = time.time()
    removidos = 0
    if not LOGS_ROOT.exists(): return 0
    
    for item in LOGS_ROOT.rglob("*"):
        if item.is_file():
            try:
                if (agora - item.stat().st_mtime) > ttl_segundos:
                    item.unlink()
                    removidos += 1
            except Exception as e:
                logger.warning(f"[FS Lifecycle] ⚠️ Erro ao remover log {item}: {e}")
    return removidos

def executar_cleanup_startup():
    garantir_diretorios()
    logger.info("[FS Lifecycle] 🚀 Executando cleanup de startup...")
    ws_removidos = limpar_workspace_antigo()
    log_removidos = limpar_logs_antigos()
    return {"workspaces_removidos": ws_removidos, "logs_removidos": log_removidos}

def salvar_em_workspace(thread_id: str, filename: str, content, mode: str = "w") -> str:
    garantir_diretorios()
    thread_dir = WORKSPACE_ROOT / str(thread_id)
    thread_dir.mkdir(parents=True, exist_ok=True)
    file_path = thread_dir / filename
    with open(file_path, mode, encoding="utf-8") as f:
        if isinstance(content, (dict, list)):
            json.dump(content, f, indent=4, ensure_ascii=False, default=str)
        else:
            f.write(str(content))
    return str(file_path)

def ler_de_workspace(thread_id: str, filename: str):
    file_path = WORKSPACE_ROOT / str(thread_id) / filename
    if file_path.exists():
        with open(file_path, "r", encoding="utf-8") as f:
            if filename.endswith(".json"):
                try:
                    return json.load(f)
                except Exception:
                    return f.read()
            return f.read()
    return None

def registrar_memoria(tipo: str, key: str, content: str) -> str:
    garantir_diretorios()
    file_path = MEMORIES_ROOT / f"{tipo}.md"
    timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
    with open(file_path, "a", encoding="utf-8") as f:
        f.write(f"\n### [{timestamp}] {key}\n{content}\n")
    return str(file_path)

def status_filesystem() -> dict:
    garantir_diretorios()
    def _dir_info(path: Path) -> dict:
        itens = list(path.iterdir()) if path.exists() else []
        total_bytes = sum(f.stat().st_size for f in path.rglob("*") if f.is_file()) if path.exists() else 0
        return {"itens": len(itens), "tamanho_kb": round(total_bytes / 1024, 1)}
    return {
        "workspace": _dir_info(WORKSPACE_ROOT),
        "memories": _dir_info(MEMORIES_ROOT),
        "logs": _dir_info(LOGS_ROOT),
        "ttl_workspace_horas": WORKSPACE_TTL_SECONDS / 3600,
    }
