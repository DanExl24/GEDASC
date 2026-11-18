# Observabilidad — notas Python

- **Logs:** `structlog` (procesadores para JSON, contexto y redacción) o `logging` estándar con `python-json-logger`; configura también los loggers de Uvicorn/Gunicorn/Django para que salgan en JSON.
- **Contexto:** `contextvars` (structlog `bind_contextvars`) con request id, tenant y usuario en un middleware; `asgi-correlation-id` para request id en ASGI.
- **Redacción:** procesador de structlog o `logging.Filter` que enmascare claves sensibles; nunca registres `request.body`/`request.data` completos.
- **Trazas:** `opentelemetry-distro` + `opentelemetry-instrument` (o instrumentaciones explícitas: FastAPI/Starlette, Django, requests/httpx, psycopg, SQLAlchemy, redis, Celery); con Gunicorn, inicializa el SDK en `post_fork` de cada worker.
- **Métricas:** `prometheus-client` (en multiproceso con Gunicorn, `PROMETHEUS_MULTIPROC_DIR`), `django-prometheus`, `prometheus-fastapi-instrumentator`, o métricas de OpenTelemetry.
- **Health:** endpoints propios `/livez` y `/readyz`; en Django, `django-health-check` (configura qué comprobaciones van a readiness y cuáles no).
- **Errores:** `sentry-sdk` con las integraciones de Django/FastAPI/Celery, `release`, `environment` y `send_default_pii=False`.
