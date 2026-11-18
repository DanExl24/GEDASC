# Mensajería — notas Node.js / TypeScript

## BullMQ (Redis)

```ts
await queue.add('send-confirmation', { orderId }, {
  jobId: `confirm:${orderId}`,                         // deduplica: el mismo jobId no se encola dos veces mientras exista
  attempts: 8,
  backoff: { type: 'exponential', delay: 1_000 },
  removeOnComplete: { age: 86_400, count: 10_000 },
  removeOnFail: { age: 7 * 86_400 },
})

const worker = new Worker('emails', processor, { connection, concurrency: 10, limiter: { max: 50, duration: 1_000 } })
process.on('SIGTERM', async () => { await worker.close() })   // espera a que terminen los jobs en curso
```

- Errores permanentes: `throw new UnrecoverableError(...)` para no reintentar.
- Jobs fallidos tras los intentos quedan en el estado `failed`: trátalo como DLQ (alertas + reproceso) o muévelos a una cola de fallidos.
- Programados: `upsertJobScheduler` (o jobs repetibles en versiones anteriores) deduplicados por el broker, no `node-cron` en cada réplica.
- Flujos padre-hijo (`FlowProducer`) para dividir trabajo en lotes.
- Redis con `maxmemory-policy noeviction` para las colas (una política de expulsión puede borrar jobs).
- NestJS: `@nestjs/bullmq` con `@Processor` y `WorkerHost`.

## Cola sobre PostgreSQL

**pg-boss**: jobs en la propia base de datos (`SKIP LOCKED`), reintentos, programación y singleton keys; permite encolar en la misma transacción que los datos (outbox implícito) si se usa la misma conexión.

## Brokers

- RabbitMQ: `amqplib`; ack manual tras procesar, `prefetch` limitado, dead-letter exchange.
- SQS: `@aws-sdk/client-sqs` (o `sqs-consumer`); `VisibilityTimeout`, redrive policy a DLQ, FIFO con `MessageGroupId` para orden por clave y `MessageDeduplicationId`.
- Kafka: cliente mantenido (`@confluentinc/kafka-javascript`, o KafkaJS revisando su estado de mantenimiento); commit de offsets tras procesar, clave de mensaje para el orden.

## Contexto

Propaga `correlationId`, `tenantId` y el contexto de traza en los datos o cabeceras del job, y restablécelos con `AsyncLocalStorage` al procesarlo para que logs y consultas tengan el contexto correcto.
