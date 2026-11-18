# Privacidad — notas Python

- **Logs:** procesador de structlog o `logging.Filter` que redacte claves personales y credenciales; `sentry-sdk` con `send_default_pii=False` y `before_send` para limpiar.
- **Cifrado por campo:** `cryptography` (`AESGCM`) o Google Tink con claves de datos del KMS (`boto3` KMS `generate_data_key`, Google Cloud KMS); en Django, un campo personalizado (`from_db_value`/`get_prep_value`) que cifra y descifra; revisa el mantenimiento de las librerías de campos cifrados de terceros antes de adoptarlas.
- **Índice ciego:** `hmac.new(key, normalized.encode(), "sha256").hexdigest()` en una columna indexada.
- **Auditoría:** `django-auditlog` o `django-simple-history` para cambios de modelos (configura qué campos no se copian al historial); logs de acceso a datos sensibles con un registro propio append-only.
- **Retención:** tareas de Celery Beat (o `django-q`, Procrastinate) que purgan o anonimizan por lotes con `iterator()` y actualizaciones masivas.
- **Anonimización para entornos de prueba:** scripts con `Faker` que reemplazan todos los campos personales (incluidos textos libres) en una copia aislada, nunca sobre la base de producción.
