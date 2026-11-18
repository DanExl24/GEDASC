# Esquema y migraciones — notas Java / Spring

## Flyway / Liquibase

- **`spring.jpa.hibernate.ddl-auto=validate`** (o `none`) en todos los entornos salvo prototipos: Hibernate comprueba que las entidades coinciden con el esquema, pero no lo modifica. Nunca `update`/`create` en producción.
- Flyway: migraciones SQL versionadas (`V42__add_full_name.sql`) en `db/migration`; nunca editar una aplicada (falla el checksum). `R__` para objetos repetibles (vistas).
- Liquibase: changesets con `id` y `author`; `preConditions` para migraciones idempotentes.
- **Índices concurrentes:** Flyway ejecuta cada migración en una transacción por defecto; para `CREATE INDEX CONCURRENTLY`, usa una migración separada con la configuración de script no transaccional (`-- flyway:executeInTransaction=false` en versiones que lo soportan) o el soporte equivalente de Liquibase (`runInTransaction="false"`).
- `SET lock_timeout` al inicio de migraciones sobre tablas calientes.
- Ejecución: Spring Boot aplica Flyway/Liquibase al arrancar por defecto; con varias instancias, el lock de la herramienta evita ejecuciones simultáneas, pero las migraciones largas retrasan el arranque y los health checks. Para tablas grandes, ejecútalas en un paso separado del despliegue (`spring.flyway.enabled=false` en la app y job de migración).

## Entidades JPA

- `BigDecimal` con `@Column(precision = 19, scale = 4)` para dinero.
- `Instant`/`OffsetDateTime` para instantes (con `hibernate.jdbc.time_zone=UTC`), `LocalDate` para fechas de calendario.
- `@Table(indexes = …, uniqueConstraints = …)` documenta el esquema, pero **la migración es la fuente de verdad**: mantenlas coherentes (y valídalo con `ddl-auto=validate`).
- `@Version` requiere la columna correspondiente en la migración.
