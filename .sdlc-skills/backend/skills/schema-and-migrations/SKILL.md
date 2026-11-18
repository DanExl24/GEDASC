---
name: schema-and-migrations
description: "Diseña y audita el esquema de base de datos relacional y sus migraciones (PostgreSQL, MySQL; Prisma Migrate, TypeORM, Alembic, Django, Flyway, Liquibase): modelado, tipos, claves, constraints como invariantes, índices (FK, compuestos, parciales, de expresión, trigram) y lectura de EXPLAIN, y migraciones seguras sin downtime (expand/contract, backfills por lotes, índices concurrentes, lock_timeout). Úsala al crear tablas, añadir índices, cambiar columnas en producción o ante consultas lentas y migraciones que bloquean. No para el código de consultas y transacciones (data-access)."
---

# Esquema y migraciones

El esquema es el contrato más duradero de un backend: el código cambia cada semana, los datos se quedan años. Esta skill cubre **cómo modelar para que la base de datos proteja la integridad, cómo indexar para las consultas reales y cómo cambiar el esquema en producción sin bloquear ni perder datos**.

## Cuándo usarla

- Crear tablas o modelos nuevos; revisar un modelo de datos.
- Consultas lentas: decidir índices a partir de `EXPLAIN`.
- Cambiar el esquema de tablas grandes en producción (añadir columnas obligatorias, renombrar, cambiar tipos, crear índices).
- Revisar migraciones antes de desplegarlas.

**No es para:** el código que consulta (N+1, transacciones, concurrencia) → `data-access` · reglas de negocio → `domain-logic` · bases de datos NoSQL (fuera del alcance por ahora; los principios de migración segura aplican igual).

## Paso 0: contexto (ambos modos)

1. Detecta motor y versión (PostgreSQL, MySQL/MariaDB, SQL Server, SQLite), herramienta de migraciones y dónde viven las migraciones. Carga [node.md](references/node.md), [python.md](references/python.md) o [java.md](references/java.md).
2. Averigua el tamaño de las tablas afectadas y el tráfico (una migración inocua en 1.000 filas puede bloquear minutos en 50 millones).
3. Pregunta cómo se ejecutan las migraciones en el despliegue (paso del pipeline, al arrancar la app, manual) y si hay varias versiones del código conviviendo durante el despliegue.

## Modo Construir

1. **Modelado:** tipos correctos, `NOT NULL` por defecto, claves primarias y foráneas, constraints que expresan las invariantes (`UNIQUE`, `CHECK`). Ver [patterns.md § Modelado](references/patterns.md#modelado).
2. **Índices desde las consultas:** para cada consulta importante, el índice que la sirve; FK indexadas; sin redundantes. Ver [patterns.md § Índices](references/patterns.md#índices).
3. **Migraciones versionadas** en el repositorio, generadas y **revisadas** (las autogeneradas pueden borrar y recrear columnas).
4. **Compatibilidad hacia atrás:** cada migración funciona con la versión actual y la nueva del código (expand/contract). Ver [patterns.md § Migraciones sin downtime](references/patterns.md#migraciones-sin-downtime).
5. **Operaciones peligrosas** con su versión segura: índices concurrentes, constraints `NOT VALID` + `VALIDATE`, backfills por lotes, `lock_timeout`.
6. Verifica la migración sobre una copia con datos realistas cuando la tabla sea grande. Entrega según [output-formats.md § Construir](../../standards/output-formats.md#modo-construir).

## Modo Auditar

1. Revisa el esquema actual (modelos del ORM, migraciones, o `\d` / `information_schema`) y las migraciones pendientes.
2. Para consultas lentas: `EXPLAIN (ANALYZE, BUFFERS)` y estadísticas (`pg_stat_statements`, índices sin uso en `pg_stat_user_indexes`).
3. Recorre [checklist.md](references/checklist.md).
4. Clasifica con [severity.md](../../standards/severity.md) y entrega según [output-formats.md § Auditar](../../standards/output-formats.md#modo-auditar) con código `BE-SCHEMA`, incluyendo el DDL de corrección.

## Principios

1. **La base de datos protege la integridad:** lo que nunca debe pasar se expresa como constraint, no solo como validación en el código.
2. **Tipos exactos:** dinero en `numeric`, instantes en `timestamptz`, nada de strings para todo.
3. **Los índices se diseñan desde las consultas reales,** no por intuición; los que no se usan, se eliminan.
4. **Todo cambio de esquema es una migración versionada y revisada.** Nunca cambios manuales en producción.
5. **Expand, migrate, contract:** el esquema siempre es compatible con la versión del código que está corriendo.
6. **Ninguna migración bloquea una tabla grande** más que unos instantes.
7. **Los backfills son por lotes y reanudables.**

## Referencias

| Archivo | Cuándo cargarlo |
| :--- | :--- |
| [patterns.md](references/patterns.md) | Siempre en modo Construir; en Auditar para las correcciones. |
| [checklist.md](references/checklist.md) | Modo Auditar. |
| [node.md](references/node.md) · [python.md](references/python.md) · [java.md](references/java.md) | Según la herramienta de migraciones. |

## Skills relacionadas

- `data-access`: consultas que necesitan los índices, paginación por cursor, concurrencia apoyada en constraints.
- `domain-logic`: invariantes que los constraints respaldan.
- `data-privacy`: columnas cifradas, retención y borrado.
- `performance`: consultas lentas en endpoints de alto impacto.
- `testing`: migraciones aplicadas en CI sobre base vacía y copias representativas.
