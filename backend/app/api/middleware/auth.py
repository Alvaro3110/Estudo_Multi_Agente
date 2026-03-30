from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from app.core.config import settings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    """
    Autenticação JWT simples.
    """
    if token != settings.JWT_SECRET:
        raise HTTPException(status_code=401, detail="Token inválido")
    return {"user": "gestor_santander"}
