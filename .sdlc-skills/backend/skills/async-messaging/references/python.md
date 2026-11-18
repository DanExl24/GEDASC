# Mensajería — notas Python

## Celery

```python
@shared_task(
    bind=True,
    autoretry_for=(TransientError, requests.Timeout),
    retry_backoff=True, retry_backoff_max=600, retry_jitter=True,
    max_retries=8,
    acks_late=True,                 # ack tras procesar
    reject_on_worker_lost=True,     # re-encola si el worker muere
)
def send_confirmation(self, order_id: str, message_id: str): ...
```

- **Encolar tras el commit:** `transaction.on_commit(lambda: send_confirmation.delay(order.id, msg_id))` en Django (o `delay_on_commit` en versiones recientes de Celery).
- Con `acks_late`, las tareas **deben ser idempotentes**.
- Redis como broker: `visibility_timeout` mayor que la tarea más larga (si no, se re-entregan tareas en curso).
- **Celery beat** en un único proceso (no en cada réplica de la API ni en cada worker); o `django-celery-beat` con un solo scheduler.
- Pasa IDs, no objetos del ORM (pueden estar desactualizados al ejecutarse y no siempre son serializables).
- `task_time_limit`/`soft_time_limit` por tarea; colas separadas por prioridad (`task_routes`).
- Cierre: `SIGTERM` hace un warm shutdown (termina las tareas en curso).

## Alternativas

- **Dramatiq** (reintentos con backoff por defecto, middleware simple), **RQ** (simple, Redis), **arq** (asyncio), **Procrastinate** (PostgreSQL, transaccional con los datos), **Huey**.
- FastAPI `BackgroundTasks` solo para trabajo trivial y perdible: se ejecuta en el mismo proceso, sin reintentos ni persistencia.

## Brokers

- RabbitMQ: `aio-pika`/`pika` con ack manual y dead-letter exchanges.
- SQS: `boto3` con redrive policy y FIFO para orden por clave.
- Kafka: `confluent-kafka`; commit de offsets tras procesar (`enable.auto.commit=False`).

## Outbox en Django

Modelo `OutboxEvent` escrito en el mismo `atomic()` que el cambio de negocio y un comando/tarea periódica que publica con `select_for_update(skip_locked=True)`; consumidores con modelo `ProcessedMessage` (clave primaria = id del mensaje).
