from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/users", tags=["users"])

class UserGroup(BaseModel):
    id: str
    name: str
    iconType: str
    color: str
    locked: bool
    active: bool

@router.get("/me/groups", response_model=List[UserGroup])
async def get_my_groups():
    """
    Retorna os grupos do usuário logado.
    """
    logger.info("[USER/GROUPS] Buscando grupos do usuário corrente...")
    
    return [
        { 
            "id": "varejo-sp", "name": "Varejo Digital SP", 
            "iconType": "phone", "color": "red", "locked": False, "active": True 
        },
        { 
            "id": "credito-imob", "name": "Crédito Imobiliário", 
            "iconType": "home", "color": "blue", "locked": True, "active": False 
        },
        { 
            "id": "agro-premium", "name": "Agro Premium", 
            "iconType": "leaf", "color": "green", "locked": True, "active": False 
        },
    ]
