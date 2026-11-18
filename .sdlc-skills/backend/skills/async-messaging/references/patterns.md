# Patrones de mensajería y trabajo asíncrono

## Elegir mecanismo

| Necesidad | Mecanismo | Ejemplos |
| :--- | :--- | :--- |
| Trabajo en background de un solo servicio, volumen moderado | **Cola sobre la base de datos** (sin infraestructura nueva, transaccional con los datos) | pg-boss, Procrastinate, Solid Queue, `SKIP LOCKED` propio |
| Jobs con reintentos, prioridades, programación y mucho volumen | **Cola de trabajo** sobre Redis o broker | BullMQ, Celery, Dramatiq, RQ, Sidekiq |
| Un evento, varios consumidores independientes | **Pub/sub** | SNS → SQS, RabbitMQ (exchanges), Google Pub/Sub, Redis Streams |
| Historial reproducible, alto volumen, orden por clave, varios lectores a su ritmo | **Stream / log** | Kafka, Redpanda, Kinesis |
| Comunicación entre módulos de un monolito | Eventos en proceso + registro persistente | Spring Modulith, outbox propio |

No añadas Kafka para enviar emails.

## Semántica de entrega

- **At-most-once:** se puede perder (ack antes de procesar). Solo para datos desechables (métricas).
- **At-least-once:** se puede duplicar (ack después de procesar). **Lo habitual.**
- **Exactly-once:** en la práctica = at-least-once + consumidor idempotente (las garantías "exactly-once" de algunos brokers solo cubren su propio ámbito).

## Encolar tras el commit

```ts
// ❌ el job puede ejecutarse antes del commit (no encuentra el pedido) o encolarse aunque la transacción falle
await db.$transaction(async (tx) => {
  const order = await tx.order.create({ data })
  await queue.add('send-confirmation', { orderId: order.id })
})

// ✅ simple: tras el commit (si el proceso cae justo entre ambos, el mensaje se pierde)
const order = await db.$transaction(async (tx) => tx.order.create({ data }))
await queue.add('send-confirmation', { orderId: order.id }, { jobId: `confirm:${order.id}` })   // jobId deduplica
```

Si perder ese mensaje no es aceptable → outbox.

## Publicar de forma fiable (outbox)

```sql
CREATE TABLE outbox (
  id            uuid PRIMARY KEY,
  aggregate     text NOT NULL,
  type          text NOT NULL,
  payload       jsonb NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  published_at  timestamptz
);
CREATE INDEX outbox_pending_idx ON outbox (created_at) WHERE published_at IS NULL;
```

1. En **la misma transacción** que el cambio de negocio, se inserta el evento en `outbox`.
2. Un **relay** lee los pendientes (`SELECT … WHERE published_at IS NULL ORDER BY created_at LIMIT 100 FOR UPDATE SKIP LOCKED`), los publica y marca `published_at`. Alternativa: CDC (Debezium) sobre la tabla.
3. Si el relay cae tras publicar y antes de marcar, el evento se publica dos veces → los consumidores son idempotentes.
4. Limpieza periódica de filas publicadas antiguas.

**Inbox** (en el consumidor): tabla `processed_messages(message_id PRIMARY KEY, processed_at)` insertada en la misma transacción que el efecto; si la inserción viola la clave, el mensaje ya se procesó.

## Consumidores idempotentes

Técnicas, de preferible a menos:
1. **Efecto naturalmente idempotente:** upsert, `UPDATE … SET status='sent' WHERE id=$1 AND status='pending'`, "establecer valor" en lugar de "incrementar".
2. **Deduplicación por id de mensaje** (inbox) en la misma transacción que el efecto.
3. **Claves de idempotencia hacia terceros** (la mayoría de pasarelas de pago y proveedores de email las aceptan).

```ts
async function handlePaymentCaptured(msg: Message<PaymentCaptured>) {
  await db.$transaction(async (tx) => {
    const inserted = await tx.$executeRaw`INSERT INTO processed_messages (message_id) VALUES (${msg.id}) ON CONFLICT DO NOTHING`
    if (inserted === 0) return                       // ya procesado
    await tx.order.updateMany({ where: { id: msg.payload.orderId, status: 'pending' }, data: { status: 'paid' } })
  })
}
```

## Reintentos y DLQ

```text
intento 1 → falla (timeout del proveedor)       → reintento en ~1 s
intento 2 → falla                                → ~4 s
intento 3 → falla                                → ~16 s   (exponencial con jitter)
…
intento N → falla                                → DLQ + alerta
```

- **Clasifica errores:** transitorios (red, 5xx, 429, timeouts, bloqueos) → reintentar; permanentes (validación, recurso inexistente, 4xx de negocio) → DLQ directa o descartar con registro.
- Respeta `Retry-After` de los proveedores.
- **DLQ** con: alerta cuando recibe mensajes, información del error, y una herramienta para reprocesar tras corregir.
- **Poison messages:** un mensaje que siempre rompe el consumidor no debe bloquear la cola (límite de intentos).
- Visibilidad/ack: el tiempo de visibilidad (SQS) o el timeout del job debe ser mayor que el procesamiento máximo esperado; si no, otro worker lo toma mientras el primero sigue.

## Diseño de mensajes

```json
{
  "id": "01JD6Y…",                 // único: base de la deduplicación
  "type": "orders.order_placed",
  "version": 2,
  "occurredAt": "2026-01-15T10:30:00Z",
  "correlationId": "req-01JD6X…",  // traza desde la petición original
  "tenantId": "42",
  "payload": { "orderId": "…", "total": { "amount": "120.50", "currency": "EUR" } }
}
```

- **Evento** (algo que pasó, en pasado: `order_placed`) vs **comando** (algo que hacer: `send_invoice`). Los eventos no esperan respuesta.
- **Payload:** datos suficientes para que la mayoría de consumidores no tengan que consultar (event-carried state) o solo IDs (notificación) si los datos son grandes o sensibles; elige por caso. Sin secretos y con los mínimos datos personales.
- **Evolución compatible:** añadir campos opcionales; para cambios incompatibles, nueva `version` y periodo en el que se publican ambas. Registro de schemas (Avro/Protobuf/JSON Schema) en sistemas con muchos equipos.
- **Tamaño** pequeño (los brokers tienen límites; SQS 256 KB); para datos grandes, guardar en almacenamiento y enviar la referencia.

## Orden

- No asumas orden global.
- Orden **por clave** cuando importa (todos los eventos de un pedido en orden): partición por `orderId` en Kafka, `MessageGroupId` en SQS FIFO, una cola por clave en otros sistemas.
- Si llegan desordenados igualmente: versión o `occurredAt` en el mensaje y descartar los más antiguos que el estado actual.

## Jobs

- **Pequeños y reanudables:** procesar 1 millón de filas como un job que encola sub-jobs por lotes, o con un cursor persistido, no como una tarea de 3 horas que vuelve a empezar al fallar.
- **Timeout** por job; **heartbeat**/extensión de visibilidad para los largos.
- **Concurrencia** limitada por tipo de job (y por proveedor externo: rate limit).
- **Prioridades** (colas separadas para lo interactivo y lo masivo).
- **Contexto:** el job lleva el tenant y el actor (o un actor de sistema) y los restablece; vuelve a comprobar permisos si el job actúa en nombre de un usuario (→ `authorization`).
- **Estado visible** para jobs que el usuario espera (exportaciones): recurso de estado consultable (→ `api-design`).

## Tareas programadas

- Varias instancias del servicio no deben ejecutar el mismo cron a la vez: scheduler único (contenedor dedicado, CronJob de Kubernetes, EventBridge), jobs repetibles del sistema de colas (deduplicados por el broker), o lock distribuido (ShedLock, advisory lock).
- Zona horaria explícita; cuidado con los cambios de horario (un job a las 02:30 puede no existir o repetirse).
- Política ante ejecuciones perdidas (servicio caído) y ante solapamiento (una ejecución que aún no terminó).
- La tarea programada encola el trabajo; no hace el trabajo pesado dentro del scheduler.

## Sagas

Para procesos de negocio que abarcan varios servicios o pasos sin transacción común (reservar stock → cobrar → confirmar envío):

- **Orquestación:** un coordinador con estado persistido envía comandos y reacciona a resultados. Más fácil de seguir y depurar.
- **Coreografía:** cada servicio reacciona a eventos de los demás. Menos acoplamiento, más difícil de ver el flujo completo.
- Cada paso tiene una **acción de compensación** (liberar stock, reembolsar); la compensación también es idempotente.
- Estado de la saga persistido y observable; timeouts para pasos que no responden.
- Motores de workflows duraderos (Temporal, AWS Step Functions) cuando hay muchas sagas complejas.

## Apagado limpio de workers

- Al recibir `SIGTERM`: dejar de tomar mensajes, terminar (o devolver a la cola) los que están en curso dentro del plazo, cerrar conexiones.
- Con ack tardío (ack al terminar), un worker que muere a mitad deja el mensaje para otro: por eso la idempotencia.

## Observabilidad

- **Métricas:** profundidad de la cola, antigüedad del mensaje más viejo (la mejor señal de atasco), tasa de procesamiento, duración, tasa de fallos y reintentos, tamaño de la DLQ, lag del consumidor (Kafka).
- **Trazas:** propaga el contexto de traza (`traceparent`) en las cabeceras del mensaje.
- **Alertas:** DLQ no vacía, antigüedad por encima del SLO, workers caídos.

## Anti-patrones

| Anti-patrón | Consecuencia | Corrección |
| :--- | :--- | :--- |
| Encolar dentro de la transacción | Jobs con datos inexistentes, eventos de operaciones fallidas | Tras el commit / outbox |
| Consumidor no idempotente | Emails, cobros o incrementos duplicados | Inbox / efectos idempotentes |
| Reintentos infinitos o sin backoff | Tormentas de reintentos, proveedor saturado | Backoff + límite + DLQ |
| DLQ que nadie mira | Fallos silenciosos | Alertas + herramienta de reproceso |
| Reintentar errores permanentes | Ruido y coste | Clasificar errores |
| Cron en cada instancia | Ejecuciones duplicadas | Scheduler único o lock |
| Jobs gigantes no reanudables | Empiezan de cero tras cada fallo | Lotes y cursores |
| Visibilidad menor que el procesamiento | Dos workers procesan el mismo mensaje | Timeout coherente + heartbeat |
| Asumir orden global | Estados incorrectos | Orden por clave + versión |
| Payloads con secretos o datos personales innecesarios | Fugas por el broker y sus logs | Datos mínimos o referencias |
