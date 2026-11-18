# Integraciones — notas Java / Spring

- **Clientes:** `RestClient` (síncrono) o `WebClient` (reactivo) creados como beans por proveedor con su URL base y timeouts; `RestTemplate` está en modo mantenimiento.
- **Timeouts:** configúralos en la fábrica de peticiones (`ClientHttpRequestFactorySettings`/`JdkClientHttpRequestFactory` con `connectTimeout` y `readTimeout`, o `HttpClient` de Reactor Netty con `responseTimeout` y `CONNECT_TIMEOUT_MILLIS`). Los valores por defecto pueden ser infinitos según la implementación.
- **Resilience4j** (con `resilience4j-spring-boot3`): `@Retry` (con `retryExceptions`/`ignoreExceptions`), `@CircuitBreaker` (con `fallbackMethod`), `@Bulkhead`, `@RateLimiter`, `@TimeLimiter`; el orden de los aspectos importa (configura `*-aspect-order`).
- **Spring Retry:** `@Retryable` + `@Recover` como alternativa más simple; no la combines con los reintentos de Resilience4j.
- **Interfaces HTTP declarativas:** `@HttpExchange` (Spring 6) para clientes tipados por proveedor, dentro del adaptador.
- **Webhooks:** recibe el cuerpo como `@RequestBody String raw` (o `byte[]`) para verificar la firma antes de deserializar; `MessageDigest.isEqual` para comparar; usa el SDK del proveedor si ofrece verificación.
- **Tests:** WireMock (`wiremock-spring-boot` o `@EnableWireMock`), `MockRestServiceServer` para `RestClient`/`RestTemplate`.
- **Observabilidad:** los clientes construidos con el `RestClient.Builder`/`WebClient.Builder` de Spring Boot propagan trazas y registran métricas con Micrometer automáticamente.
