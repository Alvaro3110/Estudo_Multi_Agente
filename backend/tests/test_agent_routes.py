import pytest
from httpx import AsyncClient, ASGITransport
from main import app

@pytest.mark.asyncio
async def test_health():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        r = await client.get("/api/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"

@pytest.mark.asyncio
async def test_resume_session_nao_encontrada():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        r = await client.post("/api/agent/resume", json={
            "session_id": "inexistente-123",
            "approved": True
        })
    assert r.status_code == 404

@pytest.mark.asyncio
async def test_active_sessions():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        r = await client.get("/api/agent/sessions/active")
    assert r.status_code == 200
    assert "active_sessions" in r.json()
