# Testing — notas Node.js / TypeScript

- **Runner:** Vitest o Jest; `node:test` para proyectos sin dependencias.
- **API en proceso:** `supertest(app)` (Express), `fastify.inject()` (sin abrir puerto), NestJS `Test.createTestingModule(...)` + `app.init()` + supertest; con `buildApp(deps)` (→ `architecture`) se inyectan fakes de los puertos.
- **Base de datos real:** `@testcontainers/postgresql` (o MySQL/Redis/Kafka) en un `globalSetup`, migraciones aplicadas (`prisma migrate deploy`, migraciones de TypeORM/Knex/Drizzle); base o esquema por worker para paralelizar (`VITEST_POOL_ID`/`JEST_WORKER_ID`).
- **Factorías:** `fishery`, `@faker-js/faker` con semilla fija.
- **HTTP externo:** `nock` (con `nock.disableNetConnect()` y `enableNetConnect('127.0.0.1')`), MSW (`msw/node`), o `undici` `MockAgent` para `fetch`.
- **Tiempo:** reloj inyectado; `vi.useFakeTimers()`/`jest.useFakeTimers()` con cuidado (afecta a librerías que usan timers internamente).
- **Contrato:** `jest-openapi`/validadores de OpenAPI sobre las respuestas de supertest; `@pact-foundation/pact`.
- **Mutación:** Stryker (`@stryker-mutator/core`) sobre los módulos de dominio.
