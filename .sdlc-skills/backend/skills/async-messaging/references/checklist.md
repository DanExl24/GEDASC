# Checklist de auditoría — mensajería y trabajo asíncrono

Severidad orientativa entre corchetes ([severity.md](../../../standards/severity.md)). La severidad depende del efecto del mensaje: duplicar un cobro o perder una confirmación de pedido es mucho peor que duplicar una métrica.

## 1. Producción

- [ ] Los mensajes se encolan tras el commit (o con outbox), nunca dentro de una transacción que puede fallar. **[HIGH]**
- [ ] Los mensajes que no pueden perderse usan outbox (o un mecanismo transaccional equivalente). **[HIGH]** en pagos, pedidos y notificaciones legales.
- [ ] Los mensajes tienen id único, tipo, versión, fecha y contexto (correlación, tenant). **[MEDIUM]**
- [ ] Sin secretos ni datos personales innecesarios en los payloads. **[MEDIUM]**

## 2. Consumo

- [ ] Todos los consumidores son idempotentes (inbox, efectos condicionales, claves de idempotencia hacia terceros). **[CRITICAL]** si un duplicado mueve dinero o stock; **[HIGH]** si duplica comunicaciones a clientes.
- [ ] Ack/confirmación tras procesar (no antes) cuando el mensaje no puede perderse. **[HIGH]**
- [ ] Visibilidad/timeout del job mayor que el procesamiento máximo, con heartbeat en jobs largos. **[MEDIUM]**
- [ ] El orden se garantiza por clave donde hace falta, o el consumidor tolera desorden (versiones). **[MEDIUM–HIGH]**
- [ ] El contexto de tenant/actor se restablece y se respeta la autorización. **[HIGH]** en sistemas multi-tenant.

## 3. Fallos

- [ ] Reintentos con backoff exponencial, jitter y límite de intentos. **[MEDIUM]**
- [ ] Errores permanentes no se reintentan. **[LOW–MEDIUM]**
- [ ] DLQ configurada, con alertas y procedimiento de reproceso. **[HIGH]** si los fallos definitivos se pierden en silencio.
- [ ] Un mensaje que siempre falla no bloquea la cola. **[HIGH]**

## 4. Jobs y programación

- [ ] Jobs largos divididos en lotes o reanudables. **[MEDIUM]**
- [ ] Concurrencia limitada por tipo de job y por proveedor externo. **[MEDIUM]**
- [ ] Las tareas programadas se ejecutan una vez por disparo aunque haya varias instancias. **[HIGH]** si duplican efectos.
- [ ] Zona horaria explícita y política ante solapamiento y ejecuciones perdidas. **[LOW–MEDIUM]**
- [ ] Los workers se apagan limpiamente (terminan o devuelven el trabajo en curso). **[MEDIUM]**

## 5. Procesos distribuidos

- [ ] Los procesos de varios pasos sin transacción común tienen compensaciones (saga) y estado persistido. **[HIGH]** si un fallo intermedio deja datos inconsistentes sin resolución.
- [ ] Los mensajes evolucionan de forma compatible (o con versión y transición). **[MEDIUM]**

## 6. Observabilidad

- [ ] Métricas de profundidad, antigüedad del mensaje más viejo, fallos y DLQ. **[MEDIUM]**
- [ ] Alertas sobre DLQ y atascos. **[MEDIUM]**
- [ ] Contexto de traza propagado en los mensajes. **[LOW]**

## Cómo inspeccionar rápido

- Encolado en transacción: llamadas a `queue.add`, `.delay(`, `apply_async`, `send(`, `publish(`, `kafkaTemplate.send` dentro de bloques `transaction`/`atomic`/`@Transactional`.
- Idempotencia: handlers que hacen `create`/`increment`/envíos sin comprobar si el mensaje ya se procesó.
- Reintentos: opciones `attempts`/`backoff`, `autoretry_for`/`retry_backoff`, `DefaultErrorHandler`/`RetryTopic`; ausencia de DLQ (`deadLetter`, `dead_letter_queue`, `DLT`).
- Cron: `node-cron`, `setInterval`, `@Scheduled`, `celery beat` o `APScheduler` dentro del proceso de la API con varias réplicas.
- Visibilidad: `VisibilityTimeout` de SQS, `visibility_timeout` de Celery con Redis, `lockDuration` de BullMQ frente a la duración real de los jobs.
