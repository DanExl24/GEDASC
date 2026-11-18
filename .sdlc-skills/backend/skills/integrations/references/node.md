# Integraciones — notas Node.js / TypeScript

- **Timeouts:** `fetch(url, { signal: AbortSignal.timeout(5_000) })`; con `undici`, `connectTimeout`/`headersTimeout`/`bodyTimeout` en el `Agent` (los valores por defecto son de minutos); en axios, `timeout` y `signal`.
- **Reintentos:** `p-retry` (con `shouldRetry` para clasificar errores), `got` (`retry` configurable por método; por defecto no reintenta POST), `axios-retry` (con `retryCondition` que excluya métodos no idempotentes).
- **Circuit breaker:** `opossum` (con `timeout`, `errorThresholdPercentage`, `resetTimeout` y `fallback`); `cockatiel` combina retry, circuit breaker, bulkhead y timeout con políticas componibles.
- **Concurrencia y rate limit:** `p-limit` o `bottleneck` (con Redis para varias instancias).
- **Pooling:** `undici.Agent`/`http.Agent` con `keepAlive` reutilizado (un cliente por proveedor, no uno por petición).
- **Webhooks:** `express.raw({ type: 'application/json' })` solo en la ruta del webhook (antes del `express.json()` global, o con exclusión); en Fastify, `addContentTypeParser` con `parseAs: 'buffer'` en un plugin encapsulado o `fastify-raw-body`; usa la verificación del SDK cuando exista (`stripe.webhooks.constructEvent(rawBody, sig, secret)`).
- **Comparación:** `crypto.timingSafeEqual` con buffers de igual longitud (compara primero la longitud).
- **Tests:** `nock` o MSW (`msw/node`) para simular proveedores; `undici` `MockAgent` para `fetch`.
