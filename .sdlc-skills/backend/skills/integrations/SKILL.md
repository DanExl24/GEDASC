---
name: integrations
description: "Construye y audita integraciones del backend con servicios externos: clientes HTTP de proveedores detrás de adaptadores, timeouts, reintentos con backoff solo en operaciones seguras, claves de idempotencia hacia el proveedor, circuit breaker, bulkhead, rate limiting del lado cliente, degradación y fallbacks, validación de respuestas, webhooks entrantes (firma sobre el cuerpo crudo, replay, deduplicación, procesamiento asíncrono) y salientes (firma, reintentos, registro de entregas, SSRF), y sincronizaciones por polling. Úsala al integrar pagos, email, CRMs u otras APIs, o ante caídas en cascada, cobros duplicados o webhooks perdidos. No para colas internas (async-messaging)."
---

# Integraciones con servicios externos

Cada servicio externo es una dependencia que **va a fallar**: lento, caído, con límites de peticiones, respuestas inesperadas o eventos repetidos. Una integración bien hecha aísla al sistema de esos fallos, no duplica operaciones al reintentar y nunca deja que una dependencia caída tumbe el servicio entero.

## Cuándo usarla

- Integrar pasarelas de pago, email/SMS, CRMs, ERPs, proveedores de identidad, mapas, IA o cualquier API externa.
- Recibir webhooks (Stripe, GitHub, proveedores de pago) o enviarlos a clientes.
- Sincronizar datos periódicamente con un sistema externo.
- Síntomas: la API se queda colgada cuando un proveedor va lento, cobros o envíos duplicados tras reintentos, webhooks perdidos o procesados dos veces, errores 429 del proveedor.

**No es para:** colas y eventos internos → `async-messaging` (aquí se usan para procesar webhooks y reintentos en background) · URLs arbitrarias dadas por usuarios → `api-security` (SSRF), que esta skill aplica a los webhooks salientes · autenticación con proveedores de identidad → `authentication`.

## Paso 0: contexto (ambos modos)

1. Detecta el cliente HTTP y las librerías de resiliencia del proyecto, y los SDKs de proveedores en uso. Carga [node.md](references/node.md), [python.md](references/python.md) o [java.md](references/java.md).
2. Inventaria las integraciones: proveedor, operaciones, si son idempotentes, límites documentados del proveedor, si hay webhooks y en qué dirección.
3. Lee la documentación del proveedor sobre idempotencia, rate limits, reintentos y firma de webhooks: cada uno tiene sus reglas.

## Modo Construir

1. **Adaptador por proveedor** detrás de un puerto (→ `architecture`): el dominio no ve el SDK ni los formatos del proveedor.
2. **Timeouts** de conexión y de respuesta en todas las llamadas, coherentes con el presupuesto de la petición.
3. **Reintentos** solo en errores transitorios y operaciones idempotentes (o con clave de idempotencia), con backoff exponencial, jitter, límite y respeto a `Retry-After`. Ver [patterns.md § Reintentos](references/patterns.md#reintentos).
4. **Circuit breaker y bulkhead** para dependencias críticas; **degradación** definida cuando la dependencia no está disponible.
5. **Rate limiting del lado cliente** para respetar los límites del proveedor.
6. **Valida las respuestas** y traduce los errores del proveedor a errores del dominio.
7. **Webhooks entrantes:** firma sobre el cuerpo crudo, ventana temporal, deduplicación, respuesta rápida y procesamiento en background. **Salientes:** firma, reintentos, registro de entregas y protección SSRF. Ver [patterns.md § Webhooks](references/patterns.md#webhooks-entrantes).
8. **Tests** con dobles del proveedor (servidor simulado), incluidos timeouts y errores. Entrega según [output-formats.md § Construir](../../standards/output-formats.md#modo-construir).

## Modo Auditar

1. Para cada integración: timeouts, reintentos, idempotencia, manejo de errores, qué pasa si el proveedor tarda 30 s o devuelve 500 durante una hora.
2. Para cada webhook: verificación de firma, replay, duplicados, desorden y tiempo de respuesta.
3. Recorre [checklist.md](references/checklist.md).
4. Clasifica con [severity.md](../../standards/severity.md) y entrega según [output-formats.md § Auditar](../../standards/output-formats.md#modo-auditar) con código `BE-INT`.

## Principios

1. **Toda llamada externa tiene timeout.** Sin excepciones.
2. **Solo se reintenta lo que es seguro reintentar,** con backoff y límite; las escrituras, con clave de idempotencia.
3. **Una dependencia caída no tumba el servicio:** circuit breaker, bulkhead y degradación.
4. **Las respuestas de terceros son entrada no confiable:** se validan.
5. **El dominio no conoce al proveedor:** adaptador y errores propios.
6. **Un webhook sin firma verificada no existe.** Y se procesa una sola vez aunque llegue varias.
7. **Se respetan los límites del proveedor** antes de que el proveedor los imponga.

## Referencias

| Archivo | Cuándo cargarlo |
| :--- | :--- |
| [patterns.md](references/patterns.md) | Siempre en modo Construir; en Auditar para las correcciones. |
| [checklist.md](references/checklist.md) | Modo Auditar. |
| [node.md](references/node.md) · [python.md](references/python.md) · [java.md](references/java.md) | Según el stack. |

## Skills relacionadas

- `async-messaging`: procesamiento en background de webhooks, reintentos diferidos, outbox para notificar a terceros.
- `architecture`: puertos y adaptadores.
- `api-security`: SSRF en webhooks salientes, secretos de los proveedores, consumo inseguro de APIs.
- `data-access`: no llamar a terceros dentro de transacciones.
- `caching`: servir datos cacheados cuando el proveedor no está disponible.
