# Caché — notas Node.js / TypeScript

- **Clientes Redis:** `ioredis` o `redis` (node-redis) con `commandTimeout`/timeouts cortos y reconexión; `set(key, value, 'EX', ttl)` / `set(key, value, { EX: ttl })`.
- **Memoria del proceso:** `lru-cache` con `max` y `ttl` (y `fetchMethod` + `allowStale` para stale-while-revalidate y coalescencia integrada).
- **Abstracciones:** `cache-manager` (con stores de Redis) o `keyv`; NestJS `CacheModule` (`@nestjs/cache-manager`) con `CacheInterceptor` solo para GET públicos: el interceptor por defecto usa la URL como clave y **no incluye el usuario** (personaliza `trackBy` para respuestas autenticadas o no lo uses en ellas).
- **Single-flight:** `Map` de promesas en curso por clave (ver patterns) o el `fetchMethod` de `lru-cache`; para varias instancias, lock con `SET NX PX`.
- **HTTP:** `@fastify/caching` / `@fastify/etag`; en Express, `etag` está activado por defecto para respuestas (débil, basado en el cuerpo): para concurrencia o validación barata, envía tu propio `ETag` con la versión.
- **Serialización:** JSON con schema al leer (Zod) y versión en la clave; cuidado con `Date` (vuelve como string) y `BigInt` (no serializable por defecto).
