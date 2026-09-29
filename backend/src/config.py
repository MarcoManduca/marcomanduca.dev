"""Environment-based application settings."""

from enum import StrEnum
from functools import lru_cache

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# SigV4 presigned URLs cannot outlive 7 days: S3 rejects longer ones.
_PRESIGN_MAX_SECONDS = 604_800


class AppEnv(StrEnum):
    """Deployment environment the application runs in.

    ``PROD`` is the fail-secure default: API docs are disabled and the
    settings in :data:`REQUIRED_IN_PROD` are mandatory. ``LOCAL`` relaxes
    both for development (docker-compose, tests).
    """

    LOCAL = "local"
    PROD = "prod"


class LogLevel(StrEnum):
    """Level names accepted by :mod:`logging` (``LOG_LEVEL``)."""

    DEBUG = "DEBUG"
    INFO = "INFO"
    WARNING = "WARNING"
    ERROR = "ERROR"
    CRITICAL = "CRITICAL"


class Settings(BaseSettings):
    """Application configuration loaded from environment variables.

    Every attribute maps to an upper-case environment variable of the
    same name (for example ``aws_region`` maps to ``AWS_REGION``).
    Values may also be provided through a local ``.env`` file. Values that
    would only fail later (an unknown log level, a zero rate-limit window)
    are rejected when the settings load, i.e. at cold start.
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
    presign_expiration_seconds: int = Field(default=900, gt=0, le=_PRESIGN_MAX_SECONDS)

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

    contact_rate_limit_max_requests: int = Field(default=5, gt=0)
    contact_rate_limit_window_seconds: int = Field(default=900, gt=0)
    # Site-wide cap on contact submissions per UTC day, across all IPs.
    contact_rate_limit_daily_max: int = Field(default=50, gt=0)

    log_level: LogLevel = LogLevel.INFO

    @field_validator("log_level", mode="before")
    @classmethod
    def _upper_case_log_level(cls, value: object) -> object:
        """Accept level names in any case (``info`` -> ``INFO``)."""
        return value.upper() if isinstance(value, str) else value

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
