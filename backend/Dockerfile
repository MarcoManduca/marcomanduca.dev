# Base image pinned to a patch release and its multi-arch index digest, so
# rebuilds are reproducible. Bump both together (docker buildx imagetools
# inspect python:<tag>).

# --- Build stage: install locked dependencies into an isolated prefix --------
FROM python:3.12.16-slim@sha256:5e2bdb1b0d542d5039cffb8181c65930093949194a65c365dfb1b0fe13a4fa5b AS builder

WORKDIR /build

# requirements.lock pins every runtime dependency (transitive included) with
# hashes; --require-hashes refuses anything not in the lock.
COPY requirements.lock ./

RUN pip install --no-cache-dir --require-hashes --prefix=/install -r requirements.lock

# --- Runtime stage: slim image, non-root user, no build tooling --------------
FROM python:3.12.16-slim@sha256:5e2bdb1b0d542d5039cffb8181c65930093949194a65c365dfb1b0fe13a4fa5b AS runtime

# AWS Lambda Web Adapter: lets the unmodified Uvicorn server run on Lambda
# behind API Gateway (HTTP API) and CloudFront: it translates the Lambda event
# into a local HTTP request.
# It is a Lambda extension and is inert outside Lambda, so the exact same
# image still runs locally and in docker-compose. AWS_LWA_PORT must match the
# port Uvicorn binds; the readiness path gates cold-start traffic on /health.
COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.8.4@sha256:e2653f741cd15851ba4f13f3cc47d29f2d14377c7d11737bfa272baa1b569007 /lambda-adapter /opt/extensions/lambda-adapter
ENV AWS_LWA_PORT=8000
ENV AWS_LWA_READINESS_CHECK_PATH=/api/v1/health

# zlib CVE-2026-85091 (gz_vacate heap overflow): Debian fixed it in
# trixie-security (+deb13u1), but the official python image still ships +b1.
# Upgrade only that package, pinned for reproducible builds. Drop this layer
# once the base image includes the fix (dpkg-query -W zlib1g in the image).
RUN apt-get update \
    && apt-get install -y --no-install-recommends --only-upgrade \
        zlib1g=1:1.3.dfsg+really1.3.1-1+deb13u1 \
    && rm -rf /var/lib/apt/lists/*

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
