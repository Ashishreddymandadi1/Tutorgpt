from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    groq_api_key: str = ""
    ai_service_url: str = "http://localhost:8000"
    upload_dir: str = "./uploads"
    chroma_data_dir: str = "./chroma_data"

    model_config = SettingsConfigDict(env_file="../.env", extra="ignore")


settings = Settings()
