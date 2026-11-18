# Diseño de la API — notas Node.js / TypeScript

## Contrato y especificación

- **Code-first con schemas:** Fastify + `@fastify/swagger` genera OpenAPI desde los JSON Schema/TypeBox de las rutas; con Zod, `zod-openapi` / `@asteasolutions/zod-to-openapi` o `fastify-type-provider-zod`.
- **NestJS:** `@nestjs/swagger` con decoradores en DTOs (`@ApiProperty`) o el plugin CLI que los infiere; revisa la especificación generada (los tipos de unión y genéricos suelen requerir anotaciones).
- **Contratos compartidos en TypeScript:** `ts-rest` u `oRPC` definen el contrato una vez y lo usan servidor y cliente con tipos (y pueden emitir OpenAPI); tRPC si solo hay clientes TypeScript propios.
- **Contract-first:** OpenAPI escrita a mano + `openapi-typescript` para tipos, validación de peticiones con `express-openapi-validator` o equivalentes.
- Lint con Spectral (`.spectral.yaml`); diff con `oasdiff` en CI.

## Detalles

- Problem Details: `application/problem+json` desde el error handler (→ `http-layer`).
- IDs: con `bigint` en la base de datos, serializa como string (`JSON.stringify` no admite `BigInt`).
- Idempotencia: tabla `idempotency_keys(key, tenant_id, request_hash, status, response_code, response_body, created_at)` con `UNIQUE (tenant_id, key)`; un middleware que reserva la clave (insert) y guarda la respuesta al terminar.
- ETag: `fastify.setHeader('ETag', …)`/`res.set('ETag', …)` con la versión del recurso, y comparación con `If-Match` en el caso de uso.
