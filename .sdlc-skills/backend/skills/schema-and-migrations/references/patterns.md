# Patrones de esquema y migraciones

Ejemplos en PostgreSQL; las diferencias con MySQL se indican donde importan.

## Modelado

### Tipos

| Dato | Tipo recomendado | Evitar |
| :--- | :--- | :--- |
| Dinero | `numeric(19,4)` (o entero en unidad mínima) + columna de moneda | `float`, `real`, `double`, `money` |
| Instante (cuándo ocurrió algo) | `timestamptz` (guardado en UTC) | `timestamp` sin zona, strings |
| Fecha de calendario (cumpleaños, vencimiento) | `date` | `timestamp` a medianoche |
| Identificador | `bigint` identity, o `uuid` (preferible UUIDv7, ordenado en el tiempo) | `serial` en tablas nuevas (usa identity), UUIDv4 como PK en tablas enormes con mucha inserción (fragmenta el índice) |
| Estados / enumeraciones | `text` + `CHECK (status IN (...))`, o tabla de referencia | Enums nativos si cambian a menudo (cambiarlos es más rígido) |
| Booleanos | `boolean NOT NULL DEFAULT false` | `smallint`, `'Y'/'N'` |
| Datos semiestructurados | `jsonb` (con validación en la app) | Columnas JSON para datos que se filtran o relacionan a menudo |
| Texto | `text` (+ `CHECK (char_length(x) <= n)` si hay límite de negocio) | `varchar(255)` por costumbre |

### Constraints

```sql
CREATE TABLE orders (
  id           bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  tenant_id    bigint NOT NULL REFERENCES tenants(id),
  customer_id  bigint NOT NULL REFERENCES customers(id),
  status       text   NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending','paid','shipped','delivered','cancelled','refunded','returned')),
  total        numeric(19,4) NOT NULL CHECK (total >= 0),
  currency     char(3) NOT NULL,
  external_ref text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, external_ref)                 -- idempotencia de importaciones / integraciones
);
CREATE INDEX orders_customer_id_idx ON orders (customer_id);   -- FK indexada
```

- **`NOT NULL` por defecto**; `NULL` solo cuando "desconocido" es un estado real.
- **FK** con la acción adecuada (`ON DELETE RESTRICT` por defecto; `CASCADE` solo en dependencias puras como líneas de pedido).
- **`UNIQUE`** para cada unicidad de negocio (email por tenant, inscripción por usuario y evento): es lo que impide duplicados bajo concurrencia (→ `data-access`).
- **`CHECK`** para rangos y estados válidos.
- Unicidad con borrado lógico: índice único parcial (`UNIQUE … WHERE deleted_at IS NULL`).
- Columnas de auditoría `created_at`/`updated_at` en tablas de negocio.

### Multi-tenant

- `tenant_id` en todas las tablas de datos del tenant, en los índices (como primera columna) y en las unicidades.
- Row-Level Security de PostgreSQL como defensa adicional (→ `authorization`).

## Índices

### Desde las consultas

```sql
-- Consulta: pedidos de un tenant por estado, los más recientes primero
SELECT id, total, created_at FROM orders
WHERE tenant_id = $1 AND status = $2
ORDER BY created_at DESC LIMIT 20;

-- Índice: igualdades primero, luego el orden/rango
CREATE INDEX CONCURRENTLY orders_tenant_status_created_idx
  ON orders (tenant_id, status, created_at DESC);
```

Reglas para índices compuestos:
1. **Columnas de igualdad primero**, luego la de rango u orden.
2. El índice sirve a consultas que usan un **prefijo** de sus columnas (`(a, b, c)` sirve a `a` y a `a, b`, no a `b` sola).
3. Un índice que cubre `WHERE` + `ORDER BY` evita ordenar en memoria.

### Tipos útiles

| Necesidad | Índice |
| :--- | :--- |
| FK (joins, borrados en cascada, comprobaciones) | B-tree sobre la columna FK |
| Subconjunto muy consultado (`WHERE status = 'pending'`) | Parcial: `… WHERE status = 'pending'` |
| Búsqueda insensible a mayúsculas | De expresión: `ON users (lower(email))` y consultar con `lower(email) = lower($1)` |
| `LIKE '%texto%'` / búsqueda difusa | `GIN (col gin_trgm_ops)` con la extensión `pg_trgm` |
| Búsqueda de texto completo | `GIN (to_tsvector(...))` o motor externo |
| `jsonb` con consultas por clave | `GIN (col jsonb_path_ops)` o índice de expresión sobre la clave |
| Evitar leer la tabla en consultas frecuentes | Covering: `… INCLUDE (total)` |

### Consultas no SARGables

```sql
WHERE date(created_at) = '2026-01-15'          -- ❌ función sobre la columna anula el índice
WHERE created_at >= '2026-01-15' AND created_at < '2026-01-16'   -- ✅ rango
```

### Leer EXPLAIN

```sql
EXPLAIN (ANALYZE, BUFFERS) SELECT …;
```

- `Seq Scan` en una tabla grande con un filtro selectivo → falta índice (o no es usable).
- `rows=` estimadas muy distintas de las reales → estadísticas desactualizadas (`ANALYZE`).
- `Sort` con `external merge` → el orden no viene de un índice y no cabe en `work_mem`.
- `Nested Loop` con millones de iteraciones → join mal planificado o índice ausente en el lado interno.
- Ejecútalo con datos de volumen realista; en una tabla de 100 filas siempre gana el seq scan.

### Mantenimiento

- Índices sin uso (`pg_stat_user_indexes.idx_scan = 0` tras un tiempo representativo) → candidatos a eliminar: cada índice encarece las escrituras.
- Índices redundantes: `(a)` es redundante si existe `(a, b)`.
- `pg_stat_statements` para encontrar las consultas que más tiempo total consumen.

## Migraciones sin downtime

Durante un despliegue conviven la versión vieja y la nueva del código. Cada migración debe ser **compatible con ambas**.

### Expand / migrate / contract (ejemplo: renombrar `name` → `full_name`)

```text
1. Expand    : añadir full_name (nullable). Desplegar código que escribe en ambas columnas.
2. Migrate   : backfill por lotes: full_name = name donde sea null.
3. Switch    : desplegar código que lee de full_name (y sigue escribiendo en ambas).
4. Contract  : desplegar código que ya no usa name. Después, migración que elimina name.
```

Nunca renombrar o borrar una columna que el código en ejecución todavía usa.

### Operaciones peligrosas y su versión segura (PostgreSQL)

| Operación | Riesgo | Versión segura |
| :--- | :--- | :--- |
| `CREATE INDEX` | Bloquea escrituras durante toda la creación | `CREATE INDEX CONCURRENTLY` (fuera de transacción); si falla, queda inválido: eliminarlo y repetir |
| Añadir columna `NOT NULL` sin default | Falla con filas existentes | Añadir nullable → backfill → `NOT NULL` |
| `SET NOT NULL` en tabla grande | Escaneo completo con bloqueo | `ADD CONSTRAINT … CHECK (col IS NOT NULL) NOT VALID` → `VALIDATE CONSTRAINT` → `SET NOT NULL` (PG12+ usa el check validado) → eliminar el check |
| Añadir FK | Valida todas las filas con bloqueo | `ADD CONSTRAINT … FOREIGN KEY … NOT VALID` → `VALIDATE CONSTRAINT` |
| Añadir `CHECK` | Igual | `NOT VALID` + `VALIDATE` |
| Cambiar el tipo de una columna | Reescribe la tabla con bloqueo exclusivo | Columna nueva + backfill + cambio de lectura (expand/contract) |
| Añadir columna con default **volátil** (`now()`, `gen_random_uuid()`) | Reescribe la tabla | Añadir sin default, backfill, luego default (los defaults constantes son instantáneos desde PG11) |
| Renombrar tabla/columna | Rompe el código en ejecución | Expand/contract |
| `ALTER` que espera un bloqueo | Encola todas las consultas detrás | `SET lock_timeout = '5s'` y reintentar |
| `UPDATE` de millones de filas | Bloqueos largos, WAL enorme, réplicas retrasadas | Backfill por lotes |

En MySQL, muchas operaciones son "online" con `ALGORITHM=INPLACE/INSTANT` según la versión; para tablas grandes se usan herramientas como `gh-ost` o `pt-online-schema-change`.

### Backfill por lotes

```sql
-- repetir hasta que no actualice filas; reanudable porque filtra lo pendiente
UPDATE users SET full_name = name
WHERE id IN (
  SELECT id FROM users WHERE full_name IS NULL ORDER BY id LIMIT 5000
);
```

- Lotes pequeños (miles), con pausa entre lotes si la base de datos está cargada.
- Fuera de la migración de esquema (script o job separado) cuando la tabla es grande, para no mantener una transacción enorme.
- Idempotente y reanudable.

### Ejecución

- Migraciones en un **paso separado del despliegue** (antes de arrancar la nueva versión), con un solo ejecutor a la vez (las herramientas usan un lock); evita que cada instancia las ejecute al arrancar.
- `lock_timeout` y `statement_timeout` en la sesión de migración.
- Migraciones **hacia delante**: el rollback de un despliegue es otro despliegue; los "down" se mantienen para desarrollo, pero en producción no se confía en revertir pérdidas de datos.
- Nunca editar una migración ya aplicada en algún entorno; se crea otra.
- Seeds de datos de referencia separados de los datos de prueba (fixtures solo en desarrollo/tests).

## Anti-patrones

| Anti-patrón | Consecuencia | Corrección |
| :--- | :--- | :--- |
| Dinero en `float` | Errores de redondeo en importes | `numeric` |
| `timestamp` sin zona | Horas ambiguas, errores en cambios de horario | `timestamptz` |
| Unicidad solo validada en código | Duplicados bajo concurrencia | `UNIQUE` |
| FK sin índice | Joins y borrados lentos | Índice en la FK |
| Índice por cada columna "por si acaso" | Escrituras lentas, índices sin uso | Índices desde las consultas |
| `CREATE INDEX` sin `CONCURRENTLY` en producción | Escrituras bloqueadas | Concurrente |
| Renombrar columna en un paso | Errores durante el despliegue | Expand/contract |
| `UPDATE` masivo en la migración | Bloqueos y migración eterna | Backfill por lotes |
| `synchronize`/`ddl-auto=update`/`db push` en producción | Cambios no revisados, pérdida de datos | Migraciones versionadas |
| Editar migraciones aplicadas | Entornos divergentes | Nueva migración |
