import os
from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    FALKORDB_HOST: str = Field(default="127.0.0.1", env="FALKORDB_HOST")
    FALKORDB_PORT: int = Field(default=6379, env="FALKORDB_PORT")
    FALKORDB_GRAPH: str = Field(default="sentinel", env="FALKORDB_GRAPH")
    
    BACKEND_HOST: str = Field(default="0.0.0.0", env="BACKEND_HOST")
    BACKEND_PORT: int = Field(default=8000, env="BACKEND_PORT")
    ENVIRONMENT: str = Field(default="development", env="ENVIRONMENT")
    
    FRONTEND_PORT: int = Field(default=3001, env="FRONTEND_PORT")
    
    LLM_API_KEY: str = Field(default="", env="LLM_API_KEY")
    LLM_BASE_URL: str = Field(default="https://api.openai.com/v1", env="LLM_BASE_URL")
    LLM_MODEL: str = Field(default="gpt-4o-mini", env="LLM_MODEL")

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
