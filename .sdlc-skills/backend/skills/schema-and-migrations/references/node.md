# Esquema y migraciones — notas Node.js / TypeScript

## Prisma Migrate

- Desarrollo: `prisma migrate dev` genera y aplica migraciones SQL en `prisma/migrations/`; **revisa el SQL generado** (un cambio de tipo o de nombre puede generarse como drop + add).
- Producción: `prisma migrate deploy` en un paso del pipeline. **Nunca `prisma db push`** fuera de prototipos: sincroniza sin historial.
- Para operaciones que Prisma no genera de forma segura (índices concurrentes, `NOT VALID`, backfills), crea una migración vacía con `--create-only` y escribe el SQL a mano. `CREATE INDEX CONCURRENTLY` no puede ir en una transacción: ponlo en una migración propia (Prisma no envuelve migraciones con varias sentencias de forma compatible en todos los casos; compruébalo en la versión del proyecto).
- Tipos: `Decimal` (`@db.Decimal(19, 4)`) para dinero; `DateTime` se guarda como `timestamp(3)` sin zona por defecto en PostgreSQL: usa `@db.Timestamptz(3)`.
- Índices: `@@index([tenantId, status, createdAt(sort: Desc)])`, `@@unique([tenantId, externalRef])`; índices parciales o de expresión vía SQL manual.

## TypeORM

- `synchronize: false` siempre fuera de desarrollo local; migraciones con `migration:generate` + revisión, y `migration:run` en el despliegue.
- `@Index()`, `@Unique()`, `@Check()` en entidades; `transaction: false` en la migración (o `transaction: 'each'`) para `CREATE INDEX CONCURRENTLY`.

## Knex / Drizzle Kit / node-pg-migrate

- Knex: migraciones en código con `knex.raw` para lo específico de PostgreSQL; `config.transaction = false` para operaciones concurrentes.
- Drizzle Kit: `drizzle-kit generate` produce SQL revisable; `migrate` para aplicarlo. Evita `push` en producción.
- node-pg-migrate: soporta `concurrently` en índices y `noTransaction()`.

## General

Ejecuta las migraciones en un job del pipeline o un contenedor de inicialización único, no en el `start` de cada instancia de la API.
