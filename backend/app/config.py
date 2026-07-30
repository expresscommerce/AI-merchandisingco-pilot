"""
Application configuration via pydantic-settings.

Values are read from environment variables / .env file.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Global application settings."""

    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # ── App ──────────────────────────────────────────────────────────────
    APP_NAME: str = "Merchandising Co-Pilot"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = False

    # ── Database ─────────────────────────────────────────────────────────
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@db:5432/merchandising"

    # ── CORS ─────────────────────────────────────────────────────────────
    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://localhost:3000"]

    # ── Secrets / API keys ───────────────────────────────────────────────
    SECRET_KEY: str = "change-me-in-production"
    DEEPINFRA_API_KEY: str = ""

    # ── Shopify App Credentials ──────────────────────────────────────────
    SHOPIFY_API_KEY: str = ""
    SHOPIFY_API_SECRET: str = ""
    SHOPIFY_REDIRECT_URI: str = "http://localhost:8000/auth/shopify/callback"
    SHOPIFY_SCOPES: str = "read_products,write_products,read_orders,read_product_listings"
    FRONTEND_URL: str = "http://localhost:5173"


settings = Settings()
