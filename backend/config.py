from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    GEMINI_API_KEY: str
    GITHUB_TOKEN: str | None = None  # optional GitHub token for metadata

    class Config:
        env_file = ".env"  # Load ENV from .env automatically


settings = Settings()


def get_settings():
    return settings
