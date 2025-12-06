import os
from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    github_token: str | None = os.getenv("GITHUB_TOKEN")
    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")

    class Config:
        env_file = ".env"


@lru_cache
def get_settings() -> Settings:
    settings = Settings()
    if not settings.gemini_api_key:
        raise RuntimeError("GEMINI_API_KEY not set!")
    return settings
