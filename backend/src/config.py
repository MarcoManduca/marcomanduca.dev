"""Environment-based application settings."""

from enum import StrEnum
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class AppEnv(StrEnum):
    """Deployment environment the application runs in.

    ``PROD`` is the fail-secure default: API docs are disabled and the
    settings in :data:`REQUIRED_IN_PROD` are mandatory. ``LOCAL`` relaxes
    both for development (docker-compose, tests).
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
    # No placeholder default: prod refuses to start without a real inbox.
    ses_recipient_email: str = ""

    cors_origins: str = "http://localhost:5173"

    # Shared secret CloudFront injects in the X-Origin-Verify header so the
    # API Gateway HTTP API (publicly reachable) only serves requests that came
    # through the CDN. Mandatory in prod; empty disables the check locally.
    origin_verify_secret: str = ""
    # Also accepted while a rotation propagates to every CloudFront edge
    # (infra/README.md, "Rotate origin secret"); empty otherwise.
    origin_verify_secret_previous: str = ""

    contact_rate_limit_max_requests: int = 5
    contact_rate_limit_window_seconds: int = 900
    # Site-wide cap on contact submissions per UTC day, across all IPs.
    contact_rate_limit_daily_max: int = 50

    log_level: str = "INFO"

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


# Settings without a usable default: an empty value in prod means a missing
# environment variable, which would otherwise fail later and silently (403s,
# broken admin auth, contact emails to nowhere).
REQUIRED_IN_PROD = (
    "origin_verify_secret",
    "cognito_user_pool_id",
    "cognito_client_id",
    "ses_recipient_email",
)


class MissingSettingError(RuntimeError):
    """Raised at startup when prod runs without a required setting."""


def ensure_prod_settings(settings: Settings) -> None:
    """Refuse to run in prod with a required setting left empty (fail secure).

    Parameters
    ----------
    settings : Settings
        Application settings.

    Raises
    ------
    MissingSettingError
        When ``app_env`` is prod and any :data:`REQUIRED_IN_PROD` is empty.
    """
    if not settings.is_prod:
        return
    missing = [name.upper() for name in REQUIRED_IN_PROD if not getattr(settings, name)]
    if missing:
        raise MissingSettingError(
            f"{', '.join(missing)} must be set when APP_ENV=prod."
        )


@lru_cache
def get_settings() -> Settings:
    """Return the cached application settings.

    Returns
    -------
    Settings
        Singleton settings instance built from the environment.
    """
    return Settings()
