# Diseño de la API — notas Java / Spring

## Especificación

- **Code-first:** `springdoc-openapi` genera OpenAPI 3 desde los controladores y DTOs; anota respuestas de error (`@ApiResponse`) y ejemplos.
- **Contract-first:** especificación en el repositorio + `openapi-generator` (generador `spring`, con `interfaceOnly=true`) para generar interfaces que los controladores implementan; el contrato manda y el compilador avisa de desviaciones.
- Lint (Spectral/Redocly) y diff (`openapi-diff`, `oasdiff`) en CI.

## Detalles

- **Problem Details:** `ProblemDetail` nativo (Spring 6) con `setType`, `setTitle`, `setProperty("code", …)`, `setProperty("errors", …)` (→ `http-layer`).
- **Serialización:** Jackson con `WRITE_DATES_AS_TIMESTAMPS=false` (fechas ISO 8601); `BigDecimal` como string (`@JsonFormat(shape = STRING)` o configuración global) para no perder precisión en clientes JS; `Long` grandes como string si hay riesgo de superar 2^53.
- **Nombres:** `spring.jackson.property-naming-strategy` (p. ej. `SNAKE_CASE`) para toda la API, no por DTO.
- **Paginación:** `Pageable` usa offset; para colecciones grandes, Spring Data `Window`/`ScrollPosition` (keyset) y respuesta propia con `nextCursor`; limita `max-page-size`.
- **ETag:** `ResponseEntity.ok().eTag(version).body(dto)` y `@RequestHeader("If-Match")` comparado con la versión; `ShallowEtagHeaderFilter` solo calcula un hash de la respuesta (útil para 304, no para concurrencia).
- **Idempotencia:** filtro o aspecto que gestiona `Idempotency-Key` con una tabla con unicidad, o librerías específicas; nunca solo en memoria con varias instancias.
- **Versionado:** prefijo en `@RequestMapping("/v1/...")`; Spring Framework 7 añade soporte nativo de versionado de API (compruébalo en la versión del proyecto).
