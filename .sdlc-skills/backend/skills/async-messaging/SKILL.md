---
name: async-messaging
description: "Diseña y audita el trabajo asíncrono del backend: jobs y workers (BullMQ, Celery, Sidekiq-like, pg-boss), colas y pub/sub (RabbitMQ, SQS/SNS, Kafka), tareas programadas sin ejecuciones duplicadas, entrega at-least-once con consumidores idempotentes, reintentos con backoff y DLQ, patrón outbox (e inbox), orden por clave, diseño y evolución de mensajes, sagas con compensación, encolar tras el commit, apagado limpio de workers y métricas de colas. Úsala al sacar trabajo de la petición, comunicar módulos o servicios por eventos, o ante jobs duplicados, perdidos o atascados. No para llamadas síncronas a terceros (integrations)."
---

# Mensajería y trabajo asíncrono

Sacar trabajo de la petición (emails, PDFs, importaciones, sincronizaciones) y comunicar partes del sistema con eventos hace al backend más rápido y resistente, pero cambia las garantías: **los mensajes se entregan al menos una vez, pueden llegar desordenados, y el productor y el consumidor fallan por separado**. Esta skill diseña para esa realidad.

## Cuándo usarla

- Trabajo lento, poco fiable o que no necesita respuesta inmediata: emails, notificaciones, generación de documentos, importaciones, llamadas a APIs lentas.
- Tareas programadas (cron) en un servicio con varias instancias.
- Comunicar módulos o servicios mediante eventos de dominio.
- Síntomas: jobs que se ejecutan dos veces, eventos que se pierden si el servicio cae, colas que crecen sin parar, jobs que fallan con "registro no encontrado", envíos duplicados a clientes.

**No es para:** llamadas síncronas a APIs de terceros y webhooks → `integrations` (que delega aquí el procesamiento asíncrono) · reglas de negocio del consumer → `domain-logic` · decisión de partir en servicios → `architecture`.

## Paso 0: contexto (ambos modos)

1. Detecta la infraestructura de mensajería (Redis, RabbitMQ, SQS/SNS, Kafka, Pub/Sub, tabla en la base de datos) y la librería (BullMQ, pg-boss, Celery, Dramatiq, RQ, arq, Spring Kafka/AMQP, Spring Modulith). Carga [node.md](references/node.md), [python.md](references/python.md) o [java.md](references/java.md).
2. Inventaria productores, colas/tópicos y consumidores; para cada mensaje: qué lo provoca, quién lo procesa y qué pasa si se procesa dos veces o nunca.
3. Si no hay infraestructura y el volumen es moderado, considera una cola sobre la base de datos existente antes que añadir un broker.

## Modo Construir

1. **Elige la herramienta** con [patterns.md § Elegir](references/patterns.md#elegir-mecanismo): cola de trabajo, pub/sub o stream.
2. **Publica tras el commit** o con **outbox** cuando el mensaje no puede perderse. Ver [patterns.md § Outbox](references/patterns.md#publicar-de-forma-fiable-outbox).
3. **Consumidores idempotentes** siempre (deduplicación por id de mensaje o efectos naturalmente idempotentes).
4. **Reintentos** con backoff exponencial y jitter, límite de intentos, errores permanentes sin reintento, y **DLQ** con alertas y forma de reprocesar.
5. **Mensajes bien diseñados:** sobre con id, tipo, versión, fecha, correlación y tenant; evolución compatible.
6. **Orden** solo donde hace falta, por clave (partición/grupo).
7. **Jobs** pequeños, con timeout, límite de concurrencia y, si son largos, progreso y reanudación.
8. **Programados** con una sola ejecución por disparo aunque haya varias instancias.
9. **Apagado limpio** de workers y **métricas** de colas. Entrega según [output-formats.md § Construir](../../standards/output-formats.md#modo-construir).

## Modo Auditar

1. Para cada productor: ¿qué pasa si la transacción falla después de encolar, o si el proceso cae entre el commit y el encolado?
2. Para cada consumidor: ¿qué pasa si el mensaje llega dos veces, desordenado, o falla siempre?
3. Revisa configuración de reintentos, visibilidad/ack, DLQ, cron con varias instancias y apagado.
4. Recorre [checklist.md](references/checklist.md).
5. Clasifica con [severity.md](../../standards/severity.md) y entrega según [output-formats.md § Auditar](../../standards/output-formats.md#modo-auditar) con código `BE-MSG`, describiendo la secuencia de fallo de cada hallazgo.

## Principios

1. **At-least-once es la realidad:** todo consumidor es idempotente.
2. **Nada se encola antes de que los datos estén confirmados;** si el mensaje no puede perderse, outbox.
3. **Todo reintento tiene límite y backoff;** todo fallo definitivo acaba en una DLQ visible.
4. **El orden global no existe;** el orden por clave se diseña explícitamente.
5. **Los mensajes son contratos:** versionados, evolucionan de forma compatible.
6. **Un job programado se ejecuta una vez por disparo,** no una vez por instancia.
7. **Las colas se observan:** profundidad, antigüedad del mensaje más viejo, tasa de fallos y DLQ.

## Referencias

| Archivo | Cuándo cargarlo |
| :--- | :--- |
| [patterns.md](references/patterns.md) | Siempre en modo Construir; en Auditar para las correcciones. |
| [checklist.md](references/checklist.md) | Modo Auditar. |
| [node.md](references/node.md) · [python.md](references/python.md) · [java.md](references/java.md) | Según el stack. |

## Skills relacionadas

- `domain-logic`: eventos de dominio y efectos tras el commit.
- `data-access`: transacción del outbox, `SKIP LOCKED`, upserts para idempotencia.
- `integrations`: webhooks entrantes y salientes procesados en background.
- `architecture`: eventos entre módulos y servicios.
- `authorization`: contexto de tenant y actor en los jobs.
- `observability`: trazas a través de mensajes, métricas y alertas de colas.
