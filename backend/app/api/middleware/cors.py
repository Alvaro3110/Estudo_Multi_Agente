from fastapi.middleware.cors import CORSMiddleware

def add_cors(app):
    """
    CORS liberado para o Angular em desenvolvimento.
    Em produção: restringir origins para o domínio real.
    """
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:4200",   # Angular dev
            "http://localhost:3000",   # Next.js (se usar)
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["X-Session-Id"],  # expõe session_id ao Angular
    )
