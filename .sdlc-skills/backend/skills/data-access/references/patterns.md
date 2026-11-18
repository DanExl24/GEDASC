# Patrones de acceso a datos

SQL de ejemplo en PostgreSQL; las diferencias con MySQL se indican donde importan. Los equivalentes por ORM están en las referencias de stack.

## N+1

```ts
// ❌ 1 consulta para los pedidos + 1 por cada pedido → 101 consultas para 100 pedidos
const orders = await db.order.findMany({ take: 100 })
for (const o of orders) o.customer = await db.customer.findUnique({ where: { id: o.customerId } })

// ✅ carga de la relación en la misma operación (JOIN o una segunda consulta con IN)
const orders = await db.order.findMany({ take: 100, include: { customer: { select: { id: true, name: true } } } })
```

Soluciones, de más a menos habitual:
1. **Eager loading** del ORM (`include`, `select_related`/`prefetch_related`, `joinedload`/`selectinload`, `JOIN FETCH`/`@EntityGraph`).
2. **Una consulta con `IN`** y agrupación en memoria (`WHERE customer_id = ANY($1)`).
3. **DataLoader** (o equivalente) en GraphQL o resolvers que se ejecutan por elemento.
4. **Agregados en SQL** (`COUNT`, `SUM` con `GROUP BY`) en lugar de cargar filas para contarlas en código.

Señales: lazy loading de relaciones dentro de bucles, serializadores que acceden a relaciones, `await` dentro de `for`/`map` con consultas.

## Traer solo lo necesario

- Columnas explícitas (`select`), sobre todo con columnas grandes (JSON, texto, binarios).
- `LIMIT` siempre en listados; topes también en exportaciones (se hacen en lotes o en background).
- `EXISTS` en lugar de `COUNT(*) > 0`; `COUNT` exactos en tablas enormes son caros (valorar estimaciones o no mostrar el total).

## Paginación

```sql
-- ❌ OFFSET profundo: la base de datos lee y descarta 100.000 filas
SELECT * FROM orders ORDER BY created_at DESC LIMIT 20 OFFSET 100000;

-- ✅ keyset / cursor: usa el índice y su coste no crece con la página
SELECT id, created_at, total FROM orders
WHERE (created_at, id) < ($1, $2)          -- valores de la última fila de la página anterior
ORDER BY created_at DESC, id DESC
LIMIT 20;
```

- Orden **determinista** (desempate por `id`).
- El cursor es opaco para el cliente (base64 de los valores), y se valida al recibirlo.
- Requiere índice compuesto acorde (`(created_at DESC, id DESC)`) (→ `schema-and-migrations`).
- OFFSET está bien para tablas pequeñas o paneles internos con pocas páginas.

## Transacciones

```ts
await db.$transaction(async (tx) => {
  const order = await tx.order.create({ data })
  await tx.inventory.updateMany({ where: { productId, available: { gte: qty } }, data: { available: { decrement: qty } } })
  await tx.ledger.create({ data: { orderId: order.id, amount } })
})   // todo o nada
// ✅ después del commit: email, evento, llamada externa
```

- **Límite = caso de uso**: se abre al empezar la operación de negocio y se cierra al terminarla (→ `domain-logic`).
- **Nada lento dentro:** ninguna llamada HTTP, publicación en colas, subida de archivos ni espera. Retienen la conexión y bloqueos; con unas pocas peticiones lentas el pool se agota y todo el servicio se detiene.
- **Rollback ante cualquier error** (los helpers de transacción del ORM lo hacen; con SQL manual, `try/finally`).
- Las transacciones de solo lectura que necesitan una vista consistente (informes) pueden usar `REPEATABLE READ`/`READ ONLY`.

### Niveles de aislamiento (resumen PostgreSQL)

| Nivel | Evita | No evita | Uso |
| :--- | :--- | :--- | :--- |
| `READ COMMITTED` (defecto en PG; en MySQL InnoDB el defecto es `REPEATABLE READ`) | Lecturas sucias | Lost updates, lecturas no repetibles | La mayoría de operaciones, con actualizaciones atómicas o bloqueos explícitos |
| `REPEATABLE READ` | Lecturas no repetibles; en PG detecta lost updates (error de serialización) | Write skew | Informes consistentes; operaciones con reintento |
| `SERIALIZABLE` | Todas las anomalías | — (a cambio de errores de serialización) | Reglas que dependen de varias filas (write skew), con **reintento automático** |

Con `REPEATABLE READ`/`SERIALIZABLE`, el código debe **reintentar** la transacción ante errores de serialización (`40001`).

## Concurrencia

Escenario típico de **lost update**:

```text
A: lee stock = 1          B: lee stock = 1
A: stock 1 ≥ 1 → vende    B: stock 1 ≥ 1 → vende
A: escribe stock = 0      B: escribe stock = 0      → se vendieron 2 unidades con 1 en stock
```

### 1. Actualización atómica condicional (preferida cuando cabe en una sentencia)

```sql
UPDATE products SET stock = stock - $2
WHERE id = $1 AND stock >= $2
RETURNING stock;            -- 0 filas afectadas = sin stock suficiente → error de negocio
```

```sql
UPDATE orders SET status = 'paid', paid_at = now()
WHERE id = $1 AND status = 'pending';    -- transición atómica: solo una petición la consigue
```

### 2. Bloqueo optimista (versión)

```sql
UPDATE accounts SET balance = $2, version = version + 1
WHERE id = $1 AND version = $3;          -- 0 filas → otro proceso la modificó → 409 o reintento
```

Para ediciones de usuario ("alguien modificó este registro mientras lo editabas") y cuando la lógica no cabe en una sentencia. El cliente puede enviar la versión (o un `ETag`/`If-Match`).

### 3. Bloqueo pesimista

```sql
BEGIN;
SELECT * FROM accounts WHERE id = $1 FOR UPDATE;          -- otras transacciones esperan
-- … lógica …
UPDATE accounts SET balance = … WHERE id = $1;
COMMIT;
```

- Para secciones cortas con alta contención donde reintentar es caro.
- Bloquea filas en un **orden consistente** (por id) para evitar deadlocks.
- `FOR UPDATE SKIP LOCKED` para colas de trabajo en tabla (cada worker toma filas distintas).
- `NOWAIT` o `lock_timeout` para no esperar indefinidamente.

### 4. Constraints como última defensa

- `UNIQUE (user_id, event_id)` impide la doble inscripción aunque dos peticiones pasen la comprobación a la vez; captura la violación y tradúcela a 409.
- `CHECK (stock >= 0)`, `CHECK (balance >= 0)`.
- **Upsert** (`INSERT … ON CONFLICT DO UPDATE/NOTHING`) en lugar de "buscar y si no existe, insertar".

### 5. Locks distribuidos y advisory locks

Para operaciones que no se protegen con filas (un job que no debe ejecutarse dos veces): `pg_advisory_xact_lock(key)` o un lock en Redis con expiración. Úsalos con moderación y con timeout.

## Pool de conexiones

- **Tamaño:** pequeño y explícito. Conexiones totales = instancias × workers × tamaño del pool; debe quedar por debajo del `max_connections` de la base de datos con margen. Muchas instancias o serverless → pooler externo (PgBouncer, RDS Proxy) en modo transacción.
- **Timeout de adquisición** (cuánto espera una petición por una conexión) para fallar rápido en lugar de encolar indefinidamente.
- **Liberar siempre** la conexión (los ORMs lo hacen; con clientes manuales, `finally { client.release() }`).
- **Statement timeout** por defecto razonable (p. ej. 5–10 s en APIs) y más alto solo en procesos que lo necesiten.
- Detectar fugas: conexiones "idle in transaction" en `pg_stat_activity`.

## Operaciones masivas

- Inserciones en lote (`createMany`, `bulk_create`, `saveAll` con batch size, `COPY`) en lugar de una por fila.
- Actualizaciones y borrados masivos con una sentencia o por lotes de N filas (para no bloquear la tabla ni generar una transacción enorme).
- Procesos sobre millones de filas: en background (→ `async-messaging`), con cursor del servidor o paginación por clave.

## Réplicas de lectura

Las réplicas tienen retraso: tras escribir, leer de la primaria lo que el usuario acaba de modificar (read-your-writes). Enruta a réplica solo lecturas que toleran datos ligeramente desfasados.

## SQL directo

- Siempre parametrizado (`$1`, `?`, `:name`); nunca interpolación de strings con valores.
- Identificadores dinámicos (nombre de columna para ordenar) solo desde una **lista blanca**.
- Encapsulado en el repositorio, con tipos para el resultado.

## Anti-patrones

| Anti-patrón | Consecuencia | Corrección |
| :--- | :--- | :--- |
| Consulta dentro de un bucle | N+1, latencia lineal con los datos | Eager loading / `IN` / agregados |
| `findMany()` sin `take`/`LIMIT` | Memoria y tiempo sin techo | Límite y paginación |
| `SELECT *` con columnas pesadas | Tráfico y memoria innecesarios | Columnas explícitas |
| Leer, comprobar en código y escribir | Lost update, sobreventa | Actualización atómica / bloqueo / constraint |
| "Buscar y si no existe, crear" | Duplicados bajo concurrencia | Upsert + unique |
| Llamada HTTP dentro de la transacción | Pool agotado, bloqueos largos | Fuera de la transacción / outbox |
| Pool enorme "por si acaso" | Agota la base de datos con varias instancias | Pool pequeño + pooler |
| Sin statement timeout | Consultas eternas bloquean recursos | Timeout por defecto |
| `OFFSET` profundo en tablas grandes | Páginas cada vez más lentas | Keyset |
| Interpolar valores en SQL | Inyección | Parámetros |
