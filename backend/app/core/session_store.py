import asyncio
from typing import Dict, Optional
from dataclasses import dataclass, field
from datetime import datetime

@dataclass
class HitlSession:
    session_id: str
    thread_id: str           # thread_id do LangGraph
    department_id: str
    group_context: str
    model_name: str
    created_at: datetime = field(default_factory=datetime.now)
    # Future: generator reference para retomar stream
    resume_event: asyncio.Event = field(default_factory=asyncio.Event)
    approved: Optional[bool] = None
    is_active: bool = True

class SessionStore:
    """
    TODO (produção): substituir por Redis com TTL de 30 minutos.
    Implementação atual: dict em memória, adequado para desenvolvimento.
    """
    def __init__(self):
        self._sessions: Dict[str, HitlSession] = {}

    def create(self, session_id: str, thread_id: str,
               department_id: str, group_context: str,
               model_name: str) -> HitlSession:
        session = HitlSession(
            session_id=session_id,
            thread_id=thread_id,
            department_id=department_id,
            group_context=group_context,
            model_name=model_name,
        )
        self._sessions[session_id] = session
        return session

    def get(self, session_id: str) -> Optional[HitlSession]:
        return self._sessions.get(session_id)

    def resume(self, session_id: str, approved: bool) -> bool:
        session = self._sessions.get(session_id)
        if not session or not session.is_active:
            return False
        session.approved = approved
        session.resume_event.set()
        return True

    def close(self, session_id: str):
        if session_id in self._sessions:
            self._sessions[session_id].is_active = False

    def active_count(self) -> int:
        return sum(1 for s in self._sessions.values() if s.is_active)

# Singleton global
session_store = SessionStore()
