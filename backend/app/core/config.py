from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Server
    PORT: int = 4000
    NODE_ENV: str = "development"
    FRONTEND_URL: str = "http://localhost:4200"
    LOG_LEVEL: str = "info"

    # Auth
    JWT_SECRET: str = "change-this-secret"

    # Databricks
    DATABRICKS_HOST: str
    DATABRICKS_TOKEN: str
    DATABRICKS_WAREHOUSE_ID: str
    DATABRICKS_CATALOG: str = "estudo_multi_agente"
    DATABRICKS_SCHEMA: str = "bronze"

    # Anthropic
    ANTHROPIC_API_KEY: str = ""

    # LangChain
    LANGCHAIN_TRACING_V2: bool = False
    LANGCHAIN_API_KEY: str = ""
    LANGCHAIN_PROJECT: str = "chat-multiagente"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
