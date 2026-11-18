# Patrones de observabilidad del backend

## Logs estructurados

```json
{
  "ts": "2026-01-15T10:30:00.123Z",
  "level": "error",
  "service": "orders-api",
  "env": "production",
  "version": "2026.01.15-3f9a2c1",
  "traceId": "4bf92f3577b34da6a3ce929d0e0e4736",
  "spanId": "00f067aa0ba902b7",
  "requestId": "01JD6X…",
  "tenantId": "42",
  "userId": "u_7",
  "event": "payment.capture_failed",
  "orderId": "o_981",
  "provider": "stripe",
  "durationMs": 10012,
  "err": { "type": "ProviderTimeoutError", "message": "Timeout after 10000ms", "stack": "…" }
}
```

- **JSON** a stdout (la plataforma los recoge); nada de logs en texto libre con datos interpolados.
- **Campos estándar** en todos los servicios (nombres iguales: `traceId`, no `trace_id` en uno y `traceID` en otro).
- **`event`** con nombre estable y buscable (`payment.capture_failed`), más los datos como campos, no dentro del mensaje.
- **Contexto automático** (request id, traza, tenant, usuario) desde el contexto asíncrono de la petición, no pasado a mano.
- **Niveles:** `error` = requiere atención (algo falló y no se recuperó); `warn` = anómalo pero manejado; `info` = eventos de negocio y ciclo de vida; `debug` desactivado en producción por defecto (activable dinámicamente si es posible).
- **Un error se registra una vez** (en el error handler o donde se maneja), con su stack; no en cada capa que lo propaga.
- **Redacción en el logger:** contraseñas, tokens, cabeceras `Authorization`/`Cookie`, números de tarjeta, documentos de identidad; datos personales solo si son necesarios para operar (→ `data-privacy`).
- **Logs de acceso** (método, ruta como plantilla, estado, duración, tamaño) para cada petición, sin cuerpos.
- Coste y retención: muestrea logs de alto volumen poco útiles (health checks, accesos exitosos de endpoints muy frecuentes).

## Correlación y trazas

- **Request id:** se genera al entrar (o se acepta el de un proxy de confianza), se devuelve en la respuesta (`X-Request-Id`) y en los errores (→ `http-layer`).
- **W3C Trace Context** (`traceparent`, `tracestate`): se propaga en las llamadas HTTP salientes a servicios propios y en las cabeceras/atributos de los mensajes (→ `async-messaging`), y se continúa al consumirlos.
- **OpenTelemetry** como estándar: SDK + instrumentación automática (servidor HTTP, clientes HTTP, base de datos, Redis, colas) exportando por OTLP a un collector.
- **Spans manuales** solo en operaciones de negocio relevantes (`checkout.place_order`), con atributos útiles y sin datos personales (ni SQL con valores literales).
- **Muestreo:** head sampling (porcentaje al inicio) para volumen alto; tail sampling en el collector para conservar siempre trazas con errores o lentas.
- **Logs ↔ trazas:** `traceId` en cada log permite saltar de uno a otro.

## Métricas

### RED por endpoint y consumidor

| Señal | Métrica |
| :--- | :--- |
| **R**ate | peticiones por segundo por ruta y método |
| **E**rrors | tasa de 5xx (y 4xx relevantes, por separado) |
| **D**uration | histograma de latencia (p50, p95, p99) |

### USE de recursos

Utilización, saturación y errores de: pool de conexiones (en uso, esperando, timeouts de adquisición), colas (profundidad, antigüedad del mensaje más viejo, DLQ), memoria y GC, CPU, **event loop lag** (Node) o hilos ocupados (JVM, workers de Python), conexiones a Redis.

### Negocio

Pedidos creados, pagos fallidos por motivo, registros, jobs procesados: detectan problemas que las métricas técnicas no ven (todo responde 200 pero nadie puede pagar).

### Cardinalidad

- Etiquetas con pocos valores posibles: ruta **como plantilla** (`/orders/:id`, nunca `/orders/981`), método, código de estado agrupado, nombre de dependencia.
- **Nunca** IDs de usuario, de pedido, emails o URLs completas como etiquetas: explotan el almacenamiento de métricas. Eso va en logs y trazas.

## Health checks

| Probe | Pregunta | Debe comprobar | No debe comprobar |
| :--- | :--- | :--- | :--- |
| **Liveness** | ¿El proceso está vivo y no bloqueado? | Que el proceso responde | Base de datos, terceros (si la BD cae, reiniciar todos los pods no ayuda) |
| **Readiness** | ¿Puede atender tráfico ahora? | Dependencias propias imprescindibles (BD, caché si es obligatoria), arranque completado, no en apagado | APIs de terceros (todas las instancias saldrían del balanceador a la vez) |
| **Startup** | ¿Ha terminado de arrancar? | Migraciones aplicadas/caches calientes, si el arranque es lento | — |

- Endpoints de health baratos (sin consultas pesadas), con timeout corto, y **sin detalles internos públicos** (versiones, hosts): detalles solo en un puerto o ruta interna (→ `api-security`).
- Durante el apagado, readiness pasa a "no listo" antes de cerrar (→ `http-layer`, graceful shutdown).

## Tracking de errores

- Errores inesperados (5xx, excepciones no controladas, fallos de jobs tras reintentos) a Sentry, Datadog, Rollbar u otro, con `release`, `environment`, traza y contexto sin datos personales.
- Errores esperados (validación, 404, permisos) no son excepciones a reportar.
- Agrupación y alertas de "error nuevo en este release".

## SLOs y alertas

```text
SLI:  proporción de peticiones a POST /checkout con respuesta < 1 s y sin 5xx
SLO:  99,5 % en 30 días   → error budget: 0,5 %
Alerta: burn rate del error budget (rápida: 14× en 1 h; lenta: 6× en 6 h)
```

- **SLOs por recorrido de usuario** (login, búsqueda, checkout), no por servidor.
- **Alertas por síntomas** (el usuario nota el problema): tasa de error, latencia, cola que no avanza, DLQ con mensajes. Las causas (CPU alta, disco) son paneles de diagnóstico, no alertas que despiertan a alguien, salvo que predigan una caída inminente (disco a punto de llenarse).
- **Cada alerta:** severidad, a quién llega, **runbook** (qué mirar primero, cómo mitigar) y revisión periódica (si nadie actúa ante una alerta, se elimina o se ajusta).
- Correlaciona con despliegues (marcadores de despliegue en los paneles).

## Anti-patrones

| Anti-patrón | Consecuencia | Corrección |
| :--- | :--- | :--- |
| `console.log`/`print` con texto libre | Logs imposibles de buscar y agregar | Logger estructurado |
| Logs sin request id ni traza | Imposible seguir una petición | Contexto automático |
| Tokens, contraseñas o cuerpos completos en logs | Fuga de credenciales y datos personales | Redacción en el logger |
| El mismo error registrado en cada capa | Ruido, alertas duplicadas | Registrar una vez |
| IDs de usuario o rutas con IDs como etiquetas | Explosión de cardinalidad, coste | Plantillas de ruta |
| Liveness que comprueba la base de datos | Reinicios en cascada | Liveness sin dependencias |
| Readiness ligada a terceros | Todas las instancias fuera a la vez | Solo dependencias propias |
| Alertas por cada métrica técnica | Fatiga, alertas ignoradas | Síntomas + SLO + runbook |
| Sin versión en las señales | No se sabe qué despliegue causó el problema | `version`/`release` en todo |
| Trazas que se cortan en las colas | Flujos asíncronos invisibles | Propagar `traceparent` en mensajes |
