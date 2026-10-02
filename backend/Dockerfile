# Base image pinned to a patch release and its multi-arch index digest, so
# rebuilds are reproducible. Bump both together (docker buildx imagetools
# inspect python:<tag>).

# --- Build stage: install locked dependencies into an isolated prefix --------
FROM python:3.12.15-slim@sha256:29113dcae7aad06daa8e95260fa09f27d62be33b9687ea3774f771d601a02256 AS builder

WORKDIR /build

# requirements.lock pins every runtime dependency (transitive included) with
# hashes; --require-hashes refuses anything not in the lock.
COPY requirements.lock ./

RUN pip install --no-cache-dir --require-hashes --prefix=/install -r requirements.lock

# --- Runtime stage: slim image, non-root user, no build tooling --------------
FROM python:3.12.15-slim@sha256:29113dcae7aad06daa8e95260fa09f27d62be33b9687ea3774f771d601a02256 AS runtime

# AWS Lambda Web Adapter: lets the unmodified Uvicorn server run on Lambda
# behind API Gateway (HTTP API) and CloudFront: it translates the Lambda event
# into a local HTTP request.
# It is a Lambda extension and is inert outside Lambda, so the exact same
# image still runs locally and in docker-compose. AWS_LWA_PORT must match the
# port Uvicorn binds; the readiness path gates cold-start traffic on /health.
COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.8.4@sha256:e2653f741cd15851ba4f13f3cc47d29f2d14377c7d11737bfa272baa1b569007 /lambda-adapter /opt/extensions/lambda-adapter
ENV AWS_LWA_PORT=8000
ENV AWS_LWA_READINESS_CHECK_PATH=/api/v1/health

RUN addgroup --system app && adduser --system --ingroup app app

WORKDIR /app

COPY --from=builder /install /usr/local
COPY src ./src
# Lambda's filesystem is read-only, so Python cannot cache bytecode at run
# time and would recompile src/ on every cold start. unchecked-hash: the
# image never changes, so the .pyc files are used without stat checks.
RUN python -m compileall -q --invalidation-mode unchecked-hash src

USER app

EXPOSE 8000

CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
