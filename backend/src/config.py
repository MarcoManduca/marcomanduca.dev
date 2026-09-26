"""Environment-based application settings."""

from enum import StrEnum
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class AppEnv(StrEnum):
    """Deployment environment the application runs in.

    ``PROD`` is the fail-secure default: API docs are disabled and the
    CloudFront origin secret is mandatory. ``LOCAL`` relaxes both for
    development (docker-compose, tests).
    """

    LOCAL = "local"
    PROD = "prod"


class Settings(BaseSettings):
    """Application configuration loaded from environment variables.

    Every attribute maps to an upper-case environment variable of the
    same name (for example ``aws_region`` maps to ``AWS_REGION``).
    Values may also be provided through a local ``.env`` file.
    """

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    app_env: AppEnv = AppEnv.PROD

    aws_region: str = "eu-west-1"
    dynamodb_endpoint_url: str | None = None

    projects_table_name: str = "portfolio-projects"
    learning_table_name: str = "portfolio-learning"
    technologies_table_name: str = "portfolio-technologies"
    ratelimit_table_name: str = "portfolio-ratelimit"

    media_bucket_name: str = "marcomanduca-dev-media"
    presign_expiration_seconds: int = 900

    cognito_user_pool_id: str = ""
    cognito_client_id: str = ""

    ses_sender_email: str = "noreply@marcomanduca.dev"
    ses_recipient_email: str = "owner@marcomanduca.dev"

    cors_origins: str = "http://localhost:5173"

    # Shared secret CloudFront injects in the X-Origin-Verify header so the
    # API Gateway HTTP API (publicly reachable) only serves requests that came
    # through the CDN. Mandatory in prod; empty disables the check locally.
    origin_verify_secret: str = ""

    contact_rate_limit_max_requests: int = 5
    contact_rate_limit_window_seconds: int = 900
    # Site-wide cap on contact submissions per UTC day, across all IPs.
    contact_rate_limit_daily_max: int = 50

    @property
    def is_prod(self) -> bool:
        """Report whether the app runs in the production environment.

        Returns
        -------
        bool
            ``True`` when ``app_env`` is :attr:`AppEnv.PROD`.
        """
        return self.app_env is AppEnv.PROD

    @property
    def cors_origin_list(self) -> list[str]:
        """Return the comma-separated CORS origins as a list.

        Returns
        -------
        list[str]
            Individual origins with surrounding whitespace stripped.
        """
        return [origin.strip() for origin in self.cors_origins.split(",")]


@lru_cache
def get_settings() -> Settings:
    """Return the cached application settings.

    Returns
    -------
    Settings
        Singleton settings instance built from the environment.
    """
    return Settings()
