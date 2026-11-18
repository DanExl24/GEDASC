# Esquema y migraciones — notas Python

## Django

- `makemigrations` + revisión + `migrate` en el despliegue; `sqlmigrate app 0042` para ver el SQL.
- Tipos: `DecimalField(max_digits=19, decimal_places=4)` para dinero; `DateTimeField` con `USE_TZ = True` (guarda en UTC con `timestamptz` en PostgreSQL).
- Constraints en `Meta`: `UniqueConstraint(fields=[...], condition=Q(deleted_at__isnull=True), name=...)`, `CheckConstraint(...)`.
- Índices: `Meta.indexes = [models.Index(fields=["tenant", "status", "-created_at"])]`, `GinIndex` y `OpClass` (trigram) en `django.contrib.postgres`.
- **Operaciones seguras:**
  - `AddIndexConcurrently` / `RemoveIndexConcurrently` (`django.contrib.postgres.operations`) en una migración con `atomic = False`.
  - `AddConstraintNotValid` + `ValidateConstraint` (Django 4.1+) para constraints en tablas grandes.
  - Backfills con `RunPython` por lotes y `atomic = False` (o en un comando de gestión separado para tablas grandes).
  - `SeparateDatabaseAndState` para expand/contract (cambiar el estado del modelo sin tocar la base de datos o viceversa).
- Herramientas: `django-pg-zero-downtime-migrations` (aplica `lock_timeout` y patrones seguros automáticamente), `django-migration-linter`.

## Alembic (SQLAlchemy)

- `alembic revision --autogenerate` detecta cambios pero **no** renombrados (los genera como drop + add) ni todo tipo de constraints: revisa siempre.
- `op.create_index(..., postgresql_concurrently=True)` dentro de `with op.get_context().autocommit_block():`.
- `op.execute("SET lock_timeout = '5s'")` al inicio de migraciones sobre tablas calientes.
- `Numeric(19, 4)` para dinero; `DateTime(timezone=True)` para `timestamptz`.
- Backfills por lotes con `op.execute` o un script separado.

## General

`alembic upgrade head` / `manage.py migrate` en un paso del pipeline o job de inicialización, no en el arranque de cada worker.
