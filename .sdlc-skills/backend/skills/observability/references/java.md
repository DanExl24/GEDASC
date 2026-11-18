# Observabilidad — notas Java / Spring Boot

- **Logs estructurados:** Spring Boot 3.4+ los soporta de serie (`logging.structured.format.console=ecs|logstash|gelf`); en versiones anteriores, `logstash-logback-encoder`. Enmascarado con convertidores/`MaskingJsonGeneratorDecorator` o evitando registrar objetos completos.
- **Contexto:** MDC (Micrometer Tracing añade `traceId` y `spanId` automáticamente); request id y tenant en un filtro que los pone en el MDC y los limpia al terminar (también en hilos y tareas asíncronas: propagación de contexto con `ContextPropagation`/`TaskDecorator`).
- **Métricas:** Micrometer + `micrometer-registry-prometheus` (o OTLP); `http.server.requests` ya etiqueta por plantilla de URI; métricas de HikariCP, JVM, GC, hilos y clientes HTTP incluidas. Evita etiquetas con IDs en métricas propias.
- **Trazas:** Micrometer Tracing con el puente de OpenTelemetry (`micrometer-tracing-bridge-otel` + exportador OTLP), o el **agente Java de OpenTelemetry** (instrumentación automática sin cambios de código).
- **Health:** Actuator con grupos `liveness` y `readiness` (`management.endpoint.health.probes.enabled=true`); quita indicadores de terceros del grupo de readiness; `show-details=never` en el endpoint público.
- **Errores:** Sentry para Spring Boot u otra herramienta con `release` y `environment`.
