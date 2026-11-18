# Diseño de la API — notas Python

## FastAPI

- Genera OpenAPI desde los modelos Pydantic y los tipos de los endpoints: **revísala** (`/openapi.json`) como parte del contrato; declara `responses={404: {"model": Problem}, 422: …}` para documentar errores.
- `response_model` y `status_code` explícitos en cada ruta; `alias_generator=to_camel` en `ConfigDict` (con `populate_by_name=True`) si la API usa `camelCase` y el código `snake_case`.
- Sustituye el formato de error por defecto de validación (`{"detail": [...]}`) por Problem Details con un handler de `RequestValidationError`, si la API ya usa otro formato.
- `Decimal` se serializa como string con la configuración adecuada (`json_encoders` / `PlainSerializer`) para no perder precisión.
- Paginación por cursor: helper propio o `fastapi-pagination` (con su modo cursor).

## Django REST Framework

- **drf-spectacular** genera OpenAPI 3; `@extend_schema` para documentar respuestas de error, ejemplos y parámetros.
- `CursorPagination` para colecciones grandes (orden determinista con campo único).
- `EXCEPTION_HANDLER` personalizado para Problem Details y códigos estables.
- Versionado con `URLPathVersioning` o `NamespaceVersioning`.
- `djangorestframework-camel-case` si la API usa `camelCase`.
- **Django Ninja** como alternativa con Pydantic y OpenAPI al estilo FastAPI.

## Detalles

- Idempotencia: modelo `IdempotencyKey` con `UniqueConstraint(fields=["tenant", "key"])`, reservado con `create()` dentro de una transacción y capturando `IntegrityError` para el caso concurrente.
- Lint y diff de la especificación en CI (Spectral, `oasdiff`).
