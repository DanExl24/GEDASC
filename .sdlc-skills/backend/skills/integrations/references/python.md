# Integraciones — notas Python

- **Timeouts:** `requests` **no tiene timeout por defecto** (espera indefinidamente): pasa siempre `timeout=(connect, read)`; `httpx` tiene 5 s por defecto, ajústalo con `httpx.Timeout(connect=2, read=10, write=10, pool=2)`.
- **Clientes reutilizados:** una `requests.Session` o `httpx.Client`/`AsyncClient` por proveedor, creada al arrancar (pool de conexiones), no uno por llamada.
- **Reintentos:** `tenacity` (`retry_if_exception_type`, `wait_exponential_jitter`, `stop_after_attempt`), o `urllib3.Retry` con `allowed_methods` limitado a métodos idempotentes y `respect_retry_after_header=True`.
- **Circuit breaker:** `pybreaker`, `purgatory` (asyncio).
- **Asyncio:** nunca clientes síncronos dentro de endpoints `async def`; `httpx.AsyncClient` con límites (`httpx.Limits(max_connections=…)`) como bulkhead; `asyncio.Semaphore` para limitar concurrencia por proveedor.
- **Webhooks:** el cuerpo crudo es `await request.body()` en FastAPI/Starlette y `request.body` en Django (antes de acceder a `request.data`/`POST`); verificación del SDK cuando exista; `hmac.compare_digest` para comparar.
- **Tests:** `respx` (httpx), `responses` o `requests-mock` (requests), `pytest-httpserver`.
