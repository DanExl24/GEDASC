# Checklist de auditoría — esquema y migraciones

Severidad orientativa entre corchetes ([severity.md](../../../standards/severity.md)).

## 1. Tipos y modelado

- [ ] Dinero en `numeric`/decimal (o enteros en unidad mínima), nunca en coma flotante. **[HIGH]**
- [ ] Instantes en `timestamptz` (o UTC garantizado); fechas de calendario en `date`. **[MEDIUM]**
- [ ] `NOT NULL` en columnas que siempre deben tener valor. **[MEDIUM]**
- [ ] Claves primarias en todas las tablas; tipo adecuado al volumen. **[MEDIUM]**
- [ ] Sin columnas "comodín" (strings para números o fechas, JSON para datos que se filtran a diario). **[LOW–MEDIUM]**

## 2. Integridad

- [ ] Claves foráneas declaradas para las relaciones. **[MEDIUM]**; **[HIGH]** si ya hay huérfanos que causan errores.
- [ ] Acciones `ON DELETE` deliberadas (sin `CASCADE` peligrosos sobre datos de negocio). **[HIGH]** si un borrado puede arrastrar datos importantes.
- [ ] Unicidades de negocio con `UNIQUE` (incluido tenant en multi-tenant y parciales con borrado lógico). **[HIGH]**
- [ ] `CHECK` para estados válidos y rangos (importes, cantidades, stock no negativo). **[MEDIUM]**
- [ ] `tenant_id` en todas las tablas de datos de tenant y en sus índices y unicidades. **[HIGH]** en sistemas multi-tenant.

## 3. Índices

- [ ] Todas las FK indexadas. **[MEDIUM]**; **[HIGH]** en tablas grandes con joins o borrados frecuentes.
- [ ] Las consultas principales tienen un índice que cubre sus filtros y orden (verificado con `EXPLAIN`). **[HIGH]** si hay seq scans sobre tablas grandes en endpoints principales.
- [ ] Índices compuestos con el orden correcto (igualdad → rango/orden). **[MEDIUM]**
- [ ] Búsquedas con `LIKE '%x%'` o insensibles a mayúsculas con índice adecuado (trigram, expresión) o motor de búsqueda. **[MEDIUM]**
- [ ] Sin funciones sobre columnas indexadas en filtros, salvo índice de expresión. **[MEDIUM]**
- [ ] Sin índices redundantes ni sin uso prolongado. **[LOW]**

## 4. Migraciones: proceso

- [ ] Todo cambio de esquema es una migración versionada en el repositorio. **[HIGH]** si hay cambios manuales o sincronización automática en producción.
- [ ] Las migraciones autogeneradas se revisan (sin drops/recreaciones accidentales). **[HIGH]**
- [ ] Migraciones aplicadas no se editan. **[MEDIUM]**
- [ ] Se ejecutan en un paso controlado del despliegue, con un único ejecutor. **[MEDIUM]**
- [ ] `lock_timeout`/`statement_timeout` en la sesión de migración. **[MEDIUM]**

## 5. Migraciones: seguridad en producción

- [ ] Índices en tablas grandes creados de forma concurrente. **[HIGH]**
- [ ] Columnas `NOT NULL` nuevas añadidas en pasos (nullable → backfill → constraint). **[HIGH]**
- [ ] FK y `CHECK` nuevos en tablas grandes con `NOT VALID` + `VALIDATE`. **[MEDIUM–HIGH]**
- [ ] Sin renombrados ni borrados de columnas que el código desplegado aún usa (expand/contract). **[CRITICAL]** si provoca errores en producción durante el despliegue.
- [ ] Sin cambios de tipo que reescriben tablas grandes en un paso. **[HIGH]**
- [ ] Backfills por lotes, idempotentes y fuera de la transacción de esquema. **[HIGH]** en tablas grandes.
- [ ] Ninguna migración destruye datos sin copia o confirmación explícita. **[CRITICAL]**

## Cómo inspeccionar rápido

- Tipos: buscar `Float`, `float`, `double`, `real`, `DOUBLE PRECISION` en columnas de importes; `timestamp` sin zona; `DateTime` sin tz en modelos.
- FK sin índice (PostgreSQL): consulta sobre `pg_constraint` (contype = 'f') sin índice que empiece por esas columnas.
- Índices sin uso: `SELECT relname, indexrelname, idx_scan FROM pg_stat_user_indexes ORDER BY idx_scan;`
- Consultas costosas: `pg_stat_statements` ordenado por `total_exec_time`.
- Migraciones peligrosas: `CREATE INDEX` sin `CONCURRENTLY`, `ALTER COLUMN … TYPE`, `SET NOT NULL`, `RENAME COLUMN`, `DROP COLUMN`, `UPDATE` sin `WHERE`/lotes dentro de migraciones.
- Sincronización automática: `synchronize: true`, `ddl-auto: update|create`, `prisma db push` en scripts de despliegue, `migrate --fake` habitual.
