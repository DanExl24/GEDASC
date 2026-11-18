# Mensajería — notas Java / Spring

## Eventos tras el commit y outbox

- `@TransactionalEventListener(phase = AFTER_COMMIT)` para efectos tras el commit dentro del proceso.
- **Spring Modulith:** `@ApplicationModuleListener` + el registro de publicación de eventos (`spring-modulith-events-jpa`/`-jdbc`): los eventos se guardan en la misma transacción y se reintentan si el listener falla, y la externalización (`@Externalized`) los publica en Kafka/AMQP/SQS. Es un outbox listo para usar en monolitos modulares.
- Outbox propio: entidad `OutboxEvent` en la misma transacción + relay con `@Scheduled` y `FOR UPDATE SKIP LOCKED`, o Debezium (CDC).

## Spring for Apache Kafka

- `@KafkaListener` con commit manual o `AckMode.RECORD` tras procesar; consumidores idempotentes (inbox).
- Reintentos: `DefaultErrorHandler` con `ExponentialBackOff` y `DeadLetterPublishingRecoverer`, o `@RetryableTopic` (reintentos no bloqueantes con tópicos de reintento y DLT).
- Excepciones no reintentables: `addNotRetryableExceptions(...)`.
- Clave de mensaje = id del agregado para el orden por partición.
- Las transacciones de Kafka (`KafkaTransactionManager`) dan exactly-once entre tópicos de Kafka, no con la base de datos: para BD + mensaje, outbox.

## Spring AMQP (RabbitMQ)

`@RabbitListener` con ack tras procesar, `RetryInterceptorBuilder` con backoff, dead-letter exchange, `prefetch` limitado.

## Tareas programadas

- `@Scheduled` se ejecuta en **cada instancia**: usa **ShedLock** (`@SchedulerLock`) o un scheduler externo (Kubernetes CronJob, Quartz en cluster).
- Spring Batch para procesos por lotes grandes y reanudables (chunks, puntos de reinicio).

## Detalles

- Apagado: `server.shutdown=graceful` y parada ordenada de los contenedores de listeners (`spring.lifecycle.timeout-per-shutdown-phase`).
- SQS: Spring Cloud AWS (`@SqsListener`) con `visibilityTimeout` y redrive a DLQ.
- Propagación de trazas en mensajes con Micrometer Tracing (observación habilitada en los templates y listeners).
