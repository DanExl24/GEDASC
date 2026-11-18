# Caché — notas Python

## Django

- Framework de caché (`django.core.cache`) con backend Redis (`django.core.cache.backends.redis.RedisCache` o `django-redis`); `cache.get_or_set(key, fn, timeout)` para cache-aside.
- `TIMEOUT` por defecto en la configuración (no `None`, que significa "para siempre").
- **`cache_page`** cachea la respuesta entera por URL: **no lo uses en vistas autenticadas o personalizadas** salvo con `vary_on_cookie` (y aun así, con cuidado); prefiere cachear datos en el servicio.
- Invalidación tras el commit: `transaction.on_commit(lambda: cache.delete(key))`.
- `cache.add(lock_key, 1, timeout)` como lock sencillo contra stampede (atómico en Redis).
- `@cache_control(private=True, no_store=True)` / `@never_cache` en vistas con datos de usuario.

## FastAPI / general

- `redis.asyncio` (redis-py) con `socket_timeout` corto; `fastapi-cache2` o `aiocache` como capas de conveniencia (revisa cómo construyen la clave: ¿incluye el usuario?).
- **`functools.lru_cache`/`cache`** solo para funciones puras en memoria del proceso (sin TTL ni invalidación, compartido por todas las peticiones del proceso: nunca para datos de usuario).
- `cachetools.TTLCache` (con lock en código multihilo) para caché en memoria con TTL.
- Single-flight en asyncio: diccionario de `asyncio.Future`/`Task` en curso por clave.
- Serialización: modelos Pydantic (`model_dump_json`/`model_validate_json`) con versión en la clave.
