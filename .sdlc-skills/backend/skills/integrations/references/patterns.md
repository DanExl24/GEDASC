# Patrones de integración

## Adaptador por proveedor

```ts
// modules/billing/infrastructure/stripe-payment-gateway.ts
export class StripePaymentGateway implements PaymentGateway {
  constructor(private readonly http: ResilientHttpClient, private readonly config: StripeConfig) {}

  async charge({ customerRef, amount, idempotencyKey }: ChargeInput): Promise<ChargeResult> {
    try {
      const res = await this.http.post('/v1/payment_intents', toStripeBody(customerRef, amount), {
        headers: { 'Idempotency-Key': idempotencyKey },   // el proveedor deduplica los reintentos
        timeoutMs: 10_000,
        retry: { attempts: 3, on: ['network', '5xx', '429'] },
      })
      return fromStripeResponse(PaymentIntentSchema.parse(res.body))      // respuesta validada
    } catch (e) {
      throw mapStripeError(e)                                             // → CardDeclined, ProviderUnavailable…
    }
  }
}
```

- El dominio recibe `ChargeResult` y errores propios (`PaymentDeclinedError`, `PaymentProviderUnavailableError`), nunca objetos del SDK.
- Configuración (URL base, credenciales, modo sandbox/producción) desde el módulo de configuración, con credenciales del gestor de secretos.

## Timeouts

| Tipo | Valor orientativo |
| :--- | :--- |
| Conexión | 1–3 s |
| Respuesta (lectura) | Según el proveedor y la operación: 2–10 s en peticiones de usuario; más en procesos background |
| Total por operación (incluidos reintentos) | Menor que el timeout de la petición entrante que la provoca |

Sin timeout, un proveedor que no responde retiene conexiones, hilos y peticiones hasta agotar el servicio.

## Reintentos

```text
¿Error transitorio? (red, timeout, 5xx, 429)   ── no ──▶ no reintentar (4xx de negocio, validación, auth)
        │ sí
¿Operación idempotente o con clave de idempotencia? ── no ──▶ no reintentar automáticamente (o reconciliar después)
        │ sí
Reintentar con backoff exponencial + jitter, máximo N intentos, respetando Retry-After
```

- **Timeouts en escrituras son ambiguos:** la operación puede haberse hecho. Sin clave de idempotencia, reintentar puede duplicar el cobro; consulta el estado al proveedor o reconcilia.
- Reintentos en **una sola capa** (si el SDK reintenta, no envuelvas con otro reintento: los intentos se multiplican).
- Reintentos largos (minutos/horas) en background (→ `async-messaging`), no dentro de la petición del usuario.

## Circuit breaker, bulkhead y degradación

- **Circuit breaker:** tras un umbral de fallos, deja de llamar durante un tiempo y falla inmediatamente; luego prueba con pocas llamadas (half-open). Evita esperar timeouts en cada petición cuando el proveedor está caído y le da margen para recuperarse.
- **Bulkhead:** límite de llamadas concurrentes a cada proveedor, para que uno lento no consuma todas las conexiones o hilos del servicio.
- **Degradación / fallback** decidida con negocio: mostrar datos cacheados (→ `caching`), encolar para más tarde ("tu factura llegará por email en unos minutos"), ocultar la funcionalidad no esencial, o fallar con un error claro (`503` + mensaje). Nunca inventar datos.
- **Readiness:** no marques el servicio como no listo porque un tercero esté caído (todas las instancias saldrían del balanceador a la vez); refleja la dependencia en métricas y degrada.

## Rate limiting del lado cliente

- Respeta los límites documentados del proveedor con un limitador compartido entre instancias (Redis) o colas con concurrencia limitada.
- Usa las cabeceras del proveedor (`X-RateLimit-Remaining`, `Retry-After`) para ajustar.
- Agrupa operaciones (batch endpoints del proveedor) cuando existan.

## Validar respuestas

- Schema de las respuestas que se usan (campos necesarios y tipos); un cambio del proveedor debe fallar en el adaptador con un error claro, no propagar `undefined` por el dominio.
- TLS verificado; sin seguir redirecciones a dominios no esperados.
- Límite de tamaño de respuesta.

## Webhooks entrantes

```ts
// la firma se calcula sobre el cuerpo CRUDO: no parsees el JSON antes de verificar
app.post('/webhooks/provider', express.raw({ type: 'application/json', limit: '1mb' }), async (req, res) => {
  const signature = req.header('X-Signature') ?? ''
  const timestamp = Number(req.header('X-Timestamp'))
  if (!Number.isFinite(timestamp) || Math.abs(Date.now() / 1000 - timestamp) > 300) return res.sendStatus(400)   // replay

  const expected = createHmac('sha256', secret).update(`${timestamp}.${req.body}`).digest('hex')
  if (!safeEqual(signature, expected)) return res.sendStatus(401)

  const event = WebhookEventSchema.parse(JSON.parse(req.body.toString('utf8')))
  const isNew = await webhookEvents.insertIfAbsent(event.id)          // deduplicación (unique en event.id)
  if (isNew) await queue.add('process-provider-event', { eventId: event.id })   // procesamiento en background
  return res.sendStatus(200)                                          // responder rápido (< pocos segundos)
})
```

1. **Verificar la firma** con el esquema del proveedor (normalmente HMAC del cuerpo crudo + marca de tiempo), con **comparación en tiempo constante**. Usa la función de verificación del SDK del proveedor si existe.
2. **Ventana temporal** (p. ej. 5 min) contra replay.
3. **Deduplicar** por id del evento: los proveedores reenvían.
4. **Responder 2xx rápido** y procesar en background; si el procesamiento tarda, el proveedor reintenta y llegan duplicados.
5. **Desorden:** los eventos pueden llegar en cualquier orden; usa marcas de tiempo/versiones o consulta el estado actual al proveedor antes de actuar ("el webhook es una notificación; la API es la verdad").
6. **Secretos** por endpoint, rotables (aceptar dos secretos durante la rotación).
7. Lista blanca de IPs del proveedor como defensa adicional, nunca como única defensa.

## Webhooks salientes (tu servicio notifica a clientes)

- **Firma** cada envío con un secreto por suscriptor: `HMAC-SHA256(secret, timestamp + "." + body)` en una cabecera, más la marca de tiempo y un id de evento único.
- **Reintentos** con backoff durante horas o días y, tras el límite, marca la entrega como fallida; **desactiva** suscripciones que fallan de forma continuada y avisa al cliente.
- **Registro de entregas** (petición, respuesta, código, duración) visible para el cliente, y reenvío manual.
- **SSRF:** valida las URLs de los suscriptores (esquema, IP resuelta no privada, sin redirecciones) (→ `api-security`).
- **Timeouts** cortos; el envío ocurre en background (→ `async-messaging`), nunca en la petición que genera el evento.
- **Tipos de evento versionados** y documentados como parte del contrato (→ `api-design`).

## Sincronizaciones por polling

- Incremental: por cursor o `updated_since` con solapamiento pequeño para no perder cambios, y upsert idempotente.
- Respetando rate limits; reanudable desde el último cursor guardado.
- Detección de borrados (el proveedor suele no notificarlos): reconciliación completa periódica si hace falta.

## Tests

- Servidor simulado del proveedor (WireMock, nock, MSW para Node, respx, `responses`) con escenarios: éxito, 4xx, 5xx, 429 con `Retry-After`, timeout, respuesta mal formada.
- Tests de contrato del adaptador contra el sandbox del proveedor en un pipeline aparte (no en cada commit).
- Webhooks: firma válida, inválida, caducada y duplicada.

## Anti-patrones

| Anti-patrón | Consecuencia | Corrección |
| :--- | :--- | :--- |
| Llamada sin timeout | Servicio colgado cuando el proveedor va lento | Timeouts de conexión y respuesta |
| Reintentar POST sin clave de idempotencia | Cobros, emails o pedidos duplicados | `Idempotency-Key` o no reintentar |
| Reintentos en varias capas | Intentos multiplicados, tormenta sobre el proveedor | Una sola capa |
| SDK del proveedor usado en todo el código | Cambio de proveedor = reescritura | Adaptador |
| Webhook sin verificar firma | Cualquiera falsifica eventos (p. ej. "pago completado") | Firma + ventana temporal |
| Verificar la firma sobre el JSON re-serializado | Firmas que no coinciden o se saltan | Cuerpo crudo |
| Procesar el webhook en la petición | Timeouts del proveedor y duplicados | Encolar y responder 2xx |
| Confiar en el orden de los webhooks | Estados incorrectos | Versión o consultar estado |
| Llamar al proveedor dentro de una transacción de BD | Pool agotado (→ `data-access`) | Fuera de la transacción |
| Readiness ligado a terceros | Todas las instancias fuera a la vez | Degradación + métricas |
