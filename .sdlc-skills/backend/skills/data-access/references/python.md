# Acceso a datos — notas Python

## Django ORM

- N+1: `select_related` (FK/one-to-one, JOIN) y `prefetch_related` (many/reverse, segunda consulta con IN); `Prefetch(…, queryset=…)` para filtrar. En DRF, aplica las cargas en `get_queryset()`, porque los serializers anidados disparan consultas por fila.
- Detectar: `django-debug-toolbar`, `nplusone`, o `assertNumQueries` en tests.
- `only()`/`defer()` para columnas pesadas; `values()`/`values_list()` para proyecciones.
- Transacciones: `with transaction.atomic():`; efectos tras el commit con `transaction.on_commit(lambda: send_email(...))`.
- **Actualizaciones atómicas:** `Product.objects.filter(id=pid, stock__gte=qty).update(stock=F("stock") - qty)` y comprobar el número de filas actualizadas.
- Bloqueo pesimista: `select_for_update()` (dentro de `atomic`), con `skip_locked=True`/`nowait=True` según el caso.
- Upsert: `update_or_create`/`get_or_create` **no son atómicos sin un constraint único**; con él, captura `IntegrityError`. `bulk_create(..., update_conflicts=True, unique_fields=[...])` para upserts masivos.
- Bloqueo optimista: campo `version` + `filter(id=…, version=v).update(..., version=F("version") + 1)`.
- Paginación por cursor: `CursorPagination` en DRF.
- Conexiones: `CONN_MAX_AGE`, `CONN_HEALTH_CHECKS`; pool nativo de psycopg en Django 5.1+ (`OPTIONS: {"pool": True}`); `statement_timeout` en `OPTIONS`.

## SQLAlchemy 2.x

- N+1: `selectinload()` (colecciones), `joinedload()` (muchos-a-uno); `lazy="raise"` en relaciones para que el acceso perezoso falle en lugar de disparar consultas ocultas.
- Sesión por petición (o por unidad de trabajo); `with Session.begin():` / `async with session.begin():`.
- Bloqueo optimista: `__mapper_args__ = {"version_id_col": version}` (lanza `StaleDataError`).
- Pesimista: `select(...).with_for_update(skip_locked=True)`.
- Atómico: `update(Product).where(Product.id == pid, Product.stock >= qty).values(stock=Product.stock - qty)` y comprobar `rowcount`.
- Upsert en PostgreSQL: `sqlalchemy.dialects.postgresql.insert(...).on_conflict_do_update(...)`.
- Pool: `pool_size`, `max_overflow`, `pool_timeout`, `pool_pre_ping=True`; con asyncio, driver asíncrono (`asyncpg`, `psycopg` async) y nunca llamadas síncronas en el event loop.

## SQL directo

`cursor.execute("SELECT … WHERE id = %s", (id,))` o `text("… :id")` con parámetros; nunca f-strings con valores.
