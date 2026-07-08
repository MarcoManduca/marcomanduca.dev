# --- Build stage: install dependencies into an isolated prefix ---------------
FROM python:3.12-slim AS builder

WORKDIR /build

COPY pyproject.toml README.md ./
COPY src ./src

RUN pip install --no-cache-dir --prefix=/install .

# --- Runtime stage: slim image, non-root user, no build tooling --------------
FROM python:3.12-slim AS runtime

# AWS Lambda Web Adapter: lets the unmodified Uvicorn server run on Lambda
# behind a Function URL (translates the Lambda event to a local HTTP request).
# It is a Lambda extension and is inert outside Lambda, so the exact same
# image still runs locally and in docker-compose. AWS_LWA_PORT must match the
# port Uvicorn binds; the readiness path gates cold-start traffic on /health.
COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.8.4 /lambda-adapter /opt/extensions/lambda-adapter
ENV AWS_LWA_PORT=8000
ENV AWS_LWA_READINESS_CHECK_PATH=/api/v1/health

RUN addgroup --system app && adduser --system --ingroup app app

WORKDIR /app

COPY --from=builder /install /usr/local
COPY src ./src

USER app

EXPOSE 8000

CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
