from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
import logging
import time
import asyncio

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["auth"])

class LoginCredentials(BaseModel):
    matricula: str
    senha: str

class AuthUser(BaseModel):
    id: str
    nome: str
    matricula: str
    perfil: str
    token: str
    grupos: List[str]

@router.post("/login", response_model=AuthUser)
async def login(credentials: LoginCredentials):
    """
    Endpoint de login (Mock corporativo).
    Valida se a senha tem pelo menos 6 caracteres para fins de demonstração.
    """
    logger.info(f"[AUTH/LOGIN] Tentativa de login para matrícula: {credentials.matricula}")
    
    # Simulação de latência de rede/LDAP
    await asyncio.sleep(0.5)

    if len(credentials.senha) < 6:
        logger.warning(f"[AUTH/LOGIN] Falha no login: senha curta demais para: {credentials.matricula}")
        raise HTTPException(
            status_code=401, 
            detail="Credenciais inválidas ou senha muito curta (mínimo 6 caracteres)."
        )

    logger.info(f"[AUTH/LOGIN] Login bem-sucedido para: {credentials.matricula}")

    # Mock de usuário baseado na matrícula
    return AuthUser(
        id="001",
        nome="Carlos Silva (Prod)",
        matricula=credentials.matricula,
        perfil="Gestor de Carteira",
        token=f"jwt-mock-{int(time.time())}",
        grupos=["varejo-sp", "credito-imob", "agro-premium"]
    )
