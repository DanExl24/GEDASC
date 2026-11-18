# Rendimiento — notas Python

- **Profiling:** `py-spy` (muestreo sin modificar el código, también en producción: `py-spy top`, `py-spy record -o flame.svg`), `scalene` (CPU + memoria), `cProfile` local; `memray` para memoria; profiling continuo con Pyroscope.
- **Async:** en FastAPI, cualquier llamada bloqueante dentro de `async def` bloquea el event loop del worker; usa drivers async (`asyncpg`, `psycopg` async, `httpx.AsyncClient`, `redis.asyncio`) o declara el endpoint con `def`. Detecta bloqueos con el modo debug de asyncio (`PYTHONASYNCIODEBUG=1`, avisa de corrutinas lentas).
- **Workers:** Gunicorn con workers Uvicorn (`-k uvicorn.workers.UvicornWorker`) o Uvicorn con `--workers`; para WSGI, `workers` ≈ 2–4 × núcleos según IO; hilos (`--threads`) para IO en WSGI.
- **CPU:** a procesos (Celery, `ProcessPoolExecutor`) por el GIL; Python 3.13 free-threaded es experimental.
- **Serialización:** `orjson` (FastAPI `ORJSONResponse`), Pydantic v2 (núcleo en Rust) es mucho más rápido que v1; evita serializar modelos del ORM con relaciones perezosas (dispara consultas).
- **Django:** `django-debug-toolbar`/`django-silk` para consultas y tiempos en desarrollo; `iterator(chunk_size=…)` para recorrer querysets grandes sin cargarlos; `StreamingHttpResponse` para exportaciones.
- **Memoria por worker** × número de workers ≤ límite del contenedor; `max_requests` de Gunicorn como mitigación (no solución) de fugas.
