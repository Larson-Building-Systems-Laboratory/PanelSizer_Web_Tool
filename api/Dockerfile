# Build context must be the repo root (../backend is needed alongside api/):
#   docker build -f api/Dockerfile -t panelsizer-api .
FROM python:3.12-slim

WORKDIR /app

COPY api/requirements.txt api/requirements.txt
RUN pip install --no-cache-dir -r api/requirements.txt

COPY api/ api/
COPY backend/ backend/

WORKDIR /app/api

ENV PORT=8000
EXPOSE 8000

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--timeout", "120", "app:app"]
