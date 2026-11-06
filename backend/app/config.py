from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    app_name: str = "AGRODEMANDA API"
    database_url: str = "postgresql+psycopg://postgres:postgres@localhost:5432/agrodemanda"
    secret_key: str = "change-this-secret-key-before-production"
    access_token_expire_minutes: int = 720
    cors_origins: str = "http://localhost:5173"
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def origins(self):
        return [x.strip() for x in self.cors_origins.split(",") if x.strip()]

settings = Settings()
