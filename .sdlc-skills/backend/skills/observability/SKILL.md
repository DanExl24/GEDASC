---
name: observability
description: "Implementa y audita la observabilidad de un backend: logs estructurados con contexto y sin datos sensibles, correlación de peticiones y propagación de trazas (W3C traceparent, OpenTelemetry) por HTTP y mensajes, métricas RED/USE y de negocio con cardinalidad controlada, health checks (liveness, readiness, startup), tracking de errores con releases, SLOs con alertas por síntomas y runbooks. Úsala al preparar un servicio para producción o cuando un incidente es difícil de diagnosticar, las alertas son ruido o los logs no sirven. No para optimizar rendimiento (performance) ni para logs de auditoría legal (data-privacy)."
---

# Observabilidad del backend

Observar un servicio es poder responder, durante un incidente y sin desplegar código nuevo, **qué falla, a quién, desde cuándo y por qué**. Se consigue con tres señales conectadas entre sí (logs, métricas y trazas que comparten un identificador), health checks que el orquestador entiende y alertas sobre lo que sufre el usuario.

## Cuándo usarla

- Preparar un servicio para producción.
- Incidentes que tardan horas en diagnosticarse; logs sin contexto o imposibles de buscar.
- Alertas que nadie atiende por exceso de ruido, o caídas que nadie detecta.
- Varios servicios o workers en los que no se puede seguir una petición de principio a fin.
- Health checks que reinician pods sanos o mandan tráfico a instancias que no pueden atenderlo.

**No es para:** encontrar y arreglar cuellos de botella → `performance` (usa estas señales) · registro de auditoría de accesos a datos personales → `data-privacy` · observabilidad del navegador → `frontend:observability`.

## Paso 0: contexto (ambos modos)

1. Detecta logger, librería de métricas, trazas (OpenTelemetry, APM de proveedor), tracking de errores y plataforma (Kubernetes, ECS, serverless). Carga [node.md](references/node.md), [python.md](references/python.md) o [java.md](references/java.md).
2. Averigua a dónde van las señales (Grafana/Loki/Tempo/Prometheus, Datadog, New Relic, Elastic, CloudWatch) y qué alertas existen.
3. Identifica los recorridos críticos de usuario (login, checkout, pagos) para definir SLOs.

## Modo Construir

1. **Logs estructurados** (JSON) con campos estándar y contexto de petición; redacción de datos sensibles en el logger. Ver [patterns.md § Logs](references/patterns.md#logs-estructurados).
2. **Correlación:** request id y contexto de traza en todos los logs; propagación de `traceparent` a llamadas HTTP salientes y a mensajes.
3. **Trazas** con OpenTelemetry (instrumentación automática de HTTP, base de datos, caché y colas) y muestreo consciente.
4. **Métricas** RED por endpoint, USE de recursos (pool, colas, memoria, event loop/GC) y de negocio, con etiquetas de baja cardinalidad.
5. **Health checks** separados: liveness sin dependencias, readiness con las dependencias propias imprescindibles, startup para arranques lentos.
6. **Errores** a una herramienta de tracking con release y entorno.
7. **SLOs y alertas** por síntomas (tasa de error y latencia de los recorridos críticos, burn rate), con runbook por alerta.
8. Entrega según [output-formats.md § Construir](../../standards/output-formats.md#modo-construir).

## Modo Auditar

1. Simula una investigación: elige una petición fallida y comprueba si se puede seguir desde el log de acceso hasta la consulta lenta o la llamada externa que falló.
2. Revisa campos de logs, datos sensibles, cardinalidad de métricas, configuración de health checks y alertas.
3. Recorre [checklist.md](references/checklist.md).
4. Clasifica con [severity.md](../../standards/severity.md) y entrega según [output-formats.md § Auditar](../../standards/output-formats.md#modo-auditar) con código `BE-OBS`.

## Principios

1. **Todo se correlaciona:** un id de traza une logs, trazas y errores de una misma petición, entre servicios y a través de colas.
2. **Logs estructurados, con contexto y sin secretos ni datos personales innecesarios.**
3. **Métricas con cardinalidad controlada:** rutas como plantilla, nunca IDs de usuario como etiqueta.
4. **Liveness no depende de nada externo;** readiness solo de lo propio e imprescindible.
5. **Se alerta por síntomas que sufre el usuario,** no por cada causa posible; cada alerta tiene un runbook y alguien que la atiende.
6. **La versión desplegada está en cada señal** para correlacionar incidentes con despliegues.
7. **Observabilidad desde el primer despliegue,** no después del primer incidente.

## Referencias

| Archivo | Cuándo cargarlo |
| :--- | :--- |
| [patterns.md](references/patterns.md) | Siempre en modo Construir; en Auditar para las correcciones. |
| [checklist.md](references/checklist.md) | Modo Auditar. |
| [node.md](references/node.md) · [python.md](references/python.md) · [java.md](references/java.md) | Según el stack. |

## Skills relacionadas

- `http-layer`: request id, logging de peticiones, error handler y graceful shutdown.
- `async-messaging`: trazas a través de mensajes, métricas de colas y DLQ.
- `integrations`: métricas y trazas de dependencias externas; readiness sin terceros.
- `performance`: usa trazas y métricas para encontrar cuellos de botella.
- `data-privacy`: qué datos no pueden ir a logs y trazas; logs de auditoría.
- `frontend:observability`: correlación con los errores del navegador.
