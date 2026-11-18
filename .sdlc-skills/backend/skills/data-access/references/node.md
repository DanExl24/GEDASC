# Acceso a datos — notas Node.js / TypeScript

## Prisma

- N+1: `include`/`select` anidados; Prisma resuelve relaciones con consultas adicionales en lote o con JOIN (`relationLoadStrategy: 'join'` en versiones recientes). Activa `log: ['query']` en desarrollo para contar consultas.
- Transacciones: `prisma.$transaction(async (tx) => { … }, { timeout, isolationLevel })` (interactiva) o array de operaciones (secuencial). Usa siempre `tx`, no `prisma`, dentro.
- **Actualización atómica condicional:** `updateMany({ where: { id, stock: { gte: qty } }, data: { stock: { decrement: qty } } })` y comprobar `count === 1` (`update` no admite condiciones sobre campos no únicos en todas las versiones).
- **Bloqueo optimista:** campo `version` + `updateMany({ where: { id, version }, data: { …, version: { increment: 1 } } })`.
- `SELECT … FOR UPDATE` no tiene API propia: `tx.$queryRaw` (parametrizado con plantillas etiquetadas). **Nunca** `$queryRawUnsafe`/`$executeRawUnsafe` con valores interpolados.
- Upsert: `upsert` con un campo único; violaciones de unicidad → error `P2002` (mapéalo a 409).
- Pool: `connection_limit` y `pool_timeout` en la URL; en serverless, Prisma Accelerate o PgBouncer (`pgbouncer=true`).

## TypeORM

- `relations`/`leftJoinAndSelect`; cuidado con `eager: true` global en entidades (carga siempre, también donde no hace falta).
- `@VersionColumn` para bloqueo optimista (comprueba la versión en `save` con `lock: { mode: 'optimistic', version }` al leer).
- `queryRunner`/`dataSource.transaction(async (manager) => …)`; `setLock('pessimistic_write')` en query builder.

## Drizzle / Knex / node-postgres

- Drizzle: consultas tipadas cercanas a SQL; `db.transaction(async (tx) => …)`, `.for('update')`.
- `pg` (node-postgres): `pool.query(text, values)` siempre con parámetros; con transacciones manuales, `const client = await pool.connect()` + `try { BEGIN … COMMIT } catch { ROLLBACK } finally { client.release() }`.
- `statement_timeout` en la configuración de conexión (`options: '-c statement_timeout=5000'`) y `connectionTimeoutMillis` en el pool.

## GraphQL

`dataloader` por petición para agrupar las cargas de relaciones en resolvers.
