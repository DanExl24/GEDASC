# Patrones de caché

## Cuándo cachear y cuándo no

| Cachear | No cachear (o con mucho cuidado) |
| :--- | :--- |
| Se lee mucho más de lo que se escribe | Cambia en casi cada lectura |
| Tolera segundos o minutos de desfase | Exige consistencia estricta (saldos, stock al vender, estados de pago) |
| Es caro de calcular u obtener (agregaciones, APIs externas) | Ya es barato (lectura por clave primaria con índice) |
| Es igual para muchos usuarios, o la clave por usuario se reutiliza | Es único por petición |
| | Decisiones de seguridad (permisos, revocaciones) con TTL largo |

Antes de cachear: índice, consulta, N+1 y paginación (→ `data-access`).

## Niveles

| Nivel | Para | Cuidado con |
| :--- | :--- | :--- |
| **HTTP / CDN** (`Cache-Control`, `ETag`) | Respuestas públicas iguales para todos; estáticos | Nunca respuestas personalizadas con `public` |
| **Caché distribuida** (Redis, Memcached) | Datos compartidos entre instancias | Red, serialización, memoria, disponibilidad |
| **Memoria del proceso** (LRU con TTL) | Datos pequeños, casi inmutables, muy leídos (configuración, catálogos pequeños) | Cada instancia tiene su copia: invalidar en todas es difícil |
| **Base de datos** (vistas materializadas, tablas de resumen) | Agregaciones pesadas | Refresco y su coste |

## Cache-aside

```ts
async function getProduct(tenantId: string, id: string): Promise<Product> {
  const key = `catalog:v2:${tenantId}:product:${id}`
  const cached = await cache.get(key)
  if (cached) return ProductSchema.parse(JSON.parse(cached))

  const product = await products.findById(tenantId, id)
  if (!product) throw new NotFoundError()
  await cache.set(key, JSON.stringify(product), { ttlSeconds: withJitter(600) })
  return product
}

async function updateProduct(tenantId: string, id: string, input: UpdateProductInput) {
  const product = await db.transaction((tx) => products.update(tx, tenantId, id, input))
  await cache.del(`catalog:v2:${tenantId}:product:${id}`)       // después del commit
  return product
}
```

- **TTL siempre**, con jitter (±10–20%) para que no expiren muchas claves a la vez.
- **Invalidar tras el commit**: si se borra antes y otra petición lee entre el borrado y el commit, vuelve a cachear el valor viejo.
- **Borrar en lugar de escribir el valor nuevo** en la invalidación: evita carreras entre escrituras concurrentes que dejan en caché la versión más antigua.
- Valida (o versiona) lo que lees de la caché: tras un despliegue que cambia la forma del objeto, los valores antiguos siguen ahí (de ahí el `v2` en la clave).

Otros patrones:
- **Read-through:** la librería de caché carga desde la fuente (mismo efecto, menos código).
- **Write-through:** se escribe en caché y en la fuente a la vez; útil cuando se lee inmediatamente lo escrito.
- **Write-behind:** se escribe en caché y la fuente se actualiza después. Riesgo de pérdida: evítalo salvo casos muy concretos (contadores aproximados).

## Diseño de claves

```text
<namespace>:<versión>:<tenant>:<entidad>:<id>[:<variante>]

catalog:v2:t42:product:981
catalog:v2:t42:product-list:status=active:sort=-price:page=c_eyJ…:lang=es
user:v1:t42:u7:dashboard-summary
```

- **Todo lo que cambia el valor va en la clave:** tenant, usuario (si el valor es personal), rol o permisos (si el contenido varía con ellos), idioma, moneda, parámetros de la consulta normalizados.
- **Fuga de datos entre usuarios** si falta el usuario o el tenant en la clave de un valor personalizado: es el error más grave de la caché (**CRITICAL**).
- Normaliza parámetros (orden de claves, valores por defecto) para no tener mil variantes del mismo valor.
- Claves de longitud acotada (hash de los parámetros si son largos).
- **Versión** del formato en la clave para invalidar todo al cambiar la estructura.

## Invalidación

| Estrategia | Uso |
| :--- | :--- |
| Solo TTL | Datos que toleran el desfase del TTL; la más simple |
| Borrado explícito tras el commit | Entidades individuales que se editan |
| **Claves versionadas** (`catalog:v{N}:…`, con N guardado en otra clave e incrementado al cambiar) | Invalidar de golpe muchas claves relacionadas (listas, búsquedas) sin buscar claves |
| Eventos (→ `async-messaging`) | Varios servicios o instancias con cachés propias |
| Tags (si la librería lo soporta) | Invalidar todas las claves de una entidad |

- Las **listas** son difíciles de invalidar con precisión: TTL corto o versionado por colección.
- Evita `KEYS pattern` en Redis en producción (bloquea); si necesitas barrer, `SCAN` o mejor versionado.

## Stampede (dogpile)

Una clave muy usada expira y cientos de peticiones calculan el valor a la vez contra la base de datos.

- **Single-flight / coalescencia:** dentro de cada instancia, una sola petición calcula el valor y las demás esperan su resultado.
  ```ts
  const inflight = new Map<string, Promise<unknown>>()
  function singleFlight<T>(key: string, fn: () => Promise<T>): Promise<T> {
    const existing = inflight.get(key) as Promise<T> | undefined
    if (existing) return existing
    const p = fn().finally(() => inflight.delete(key))
    inflight.set(key, p)
    return p
  }
  ```
- **Lock distribuido** corto (`SET key:lock 1 NX PX 5000`) para que una sola instancia recalcule.
- **Stale-while-revalidate:** guarda el valor con su fecha; si está "caducado pero usable", devuélvelo y recalcula en background.
- **Expiración probabilística anticipada:** recalcular antes de que expire con probabilidad creciente.
- **Jitter** en los TTL.

## Caché negativa

Cachear "no existe" (con TTL corto) protege contra consultas repetidas a IDs inexistentes, pero hay que invalidarla al crear el recurso.

## Consistencia

- **Read-your-writes:** tras actualizar, el mismo usuario debe ver su cambio: invalida antes de responder (tras el commit) o lee de la fuente en esa respuesta.
- **Varias instancias con caché en memoria:** cada una tiene su copia; usa TTL cortos o invalidación por pub/sub, o mueve esos datos a Redis.
- Caché sobre réplicas de lectura: el retraso de la réplica se suma al de la caché.

## Cuando la caché falla

- Timeouts cortos en el cliente de caché (decenas de milisegundos); si falla, ir a la fuente.
- Protege la fuente: con la caché caída, la base de datos recibe todo el tráfico. Circuit breaker hacia la caché, límites de concurrencia y, si hace falta, degradar funcionalidades no esenciales.
- La caché no es la fuente de verdad: si perder su contenido rompe algo, no es una caché.

## Redis: configuración

- `maxmemory` y `maxmemory-policy` acordes al uso: `allkeys-lru`/`allkeys-lfu` para caché pura.
- **Separa usos** con políticas incompatibles: caché (puede expulsar) vs colas, sesiones o rate limiting (no deben expulsarse: `noeviction`). Instancias o bases distintas.
- Valores pequeños (decenas de KB como mucho); nada de listas de miles de elementos en una clave.
- Serialización estable (JSON con schema, MessagePack) y versionada.

## HTTP caching

```http
# Respuesta pública e igual para todos (catálogo público)
Cache-Control: public, max-age=60, stale-while-revalidate=300
ETag: "p981-v14"

# Respuesta con datos del usuario
Cache-Control: private, no-store

# Validación condicional
GET /products/981   If-None-Match: "p981-v14"   → 304 Not Modified
```

- `private`/`no-store` en todo lo autenticado o personalizado; nunca `public` con datos de usuario (la CDN la serviría a otros).
- `Vary` en las cabeceras que cambian la respuesta (`Accept-Language`, `Accept-Encoding`); `Vary: Authorization` o `Cookie` hace la caché compartida casi inútil: mejor `private`.
- `ETag` basado en la versión del recurso (barato) en lugar de en un hash del cuerpo calculado en cada petición.
- CDN: claves de caché explícitas (qué query params cuentan), purga por URL o tag al publicar cambios.

## Métricas

Ratio de aciertos por namespace, latencia de la caché, tamaño y memoria, expulsiones, errores/timeouts. Un ratio de aciertos bajo indica claves demasiado específicas o TTL demasiado cortos: la caché solo añade latencia.

## Anti-patrones

| Anti-patrón | Consecuencia | Corrección |
| :--- | :--- | :--- |
| Clave sin tenant/usuario para datos personalizados | **Datos de un usuario servidos a otro** | Tenant y usuario en la clave |
| `Cache-Control: public` en respuestas autenticadas | Fuga en la CDN o proxies | `private, no-store` |
| Sin TTL | Datos obsoletos para siempre, memoria llena | TTL siempre |
| Invalidar antes del commit | Se vuelve a cachear el valor viejo | Después del commit |
| Cachear para tapar una consulta sin índice | Picos al expirar, problema oculto | Arreglar la consulta |
| Claves calientes sin protección | Stampede contra la base de datos | Single-flight, SWR, jitter |
| Error de caché = error de la petición | La caída de Redis tumba el servicio | Fallback a la fuente con protección |
| Caché y colas en el mismo Redis con expulsión | Jobs o sesiones expulsados | Instancias/políticas separadas |
| Cachear permisos con TTL largo | Accesos revocados que siguen activos | TTL corto o invalidación al cambiar permisos |
| `KEYS *` para invalidar | Redis bloqueado | Versionado de claves / `SCAN` |
