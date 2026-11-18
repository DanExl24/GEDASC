# Caché — notas Java / Spring

## Spring Cache

```java
@Cacheable(cacheNames = "products", key = "#tenantId + ':' + #id", sync = true)   // sync: una sola carga concurrente por clave (en la instancia)
public ProductDto getProduct(String tenantId, String id) { … }

@CacheEvict(cacheNames = "products", key = "#tenantId + ':' + #id")
@Transactional
public ProductDto update(String tenantId, String id, UpdateProduct input) { … }
```

Trampas:
- **Auto-invocación:** llamar a un método `@Cacheable` desde la misma clase no pasa por el proxy (no cachea).
- **Clave por defecto** = parámetros del método: si el tenant o el usuario no son parámetros (vienen del contexto de seguridad), **no están en la clave**. Defínela explícitamente.
- **TTL:** Spring Cache no lo define; configúralo en el proveedor (Caffeine `expireAfterWrite`, `RedisCacheConfiguration.entryTtl` por caché).
- **`@CacheEvict` con `@Transactional`:** por defecto la expulsión ocurre al terminar el método, que puede ser antes del commit de una transacción exterior; con Redis, `RedisCacheManager.builder(...).transactionAware()` retrasa las operaciones hasta el commit.
- `unless = "#result == null"` para no cachear nulos (o caché negativa consciente con TTL corto).

## Proveedores

- **Caffeine** (memoria): `maximumSize`, `expireAfterWrite`, `refreshAfterWrite` (refresco asíncrono tipo stale-while-revalidate); por instancia.
- **Redis** (`spring-boot-starter-data-redis`): `RedisCacheManager` con TTL por caché y serializador JSON versionado; timeouts del cliente (Lettuce) cortos.
- Combinación de dos niveles (Caffeine + Redis) solo si el ratio de aciertos lo justifica y hay invalidación entre instancias.

## HTTP

- `ResponseEntity.ok().cacheControl(CacheControl.maxAge(60, SECONDS).cachePublic()).eTag(version)` en respuestas públicas; `CacheControl.noStore()` en las autenticadas.
- Spring Security añade `Cache-Control: no-cache, no-store` por defecto a las respuestas: revísalo antes de habilitar caché pública en endpoints concretos.
