# Patrones de la capa HTTP

Ejemplos en TypeScript; los equivalentes por framework están en las referencias de stack.

## Validación en la frontera

```ts
const CreateOrderBody = z.object({
  customerId: z.uuid(),
  items: z.array(z.object({
    productId: z.uuid(),
    quantity: z.number().int().min(1).max(1000),
  })).min(1).max(100),                       // topes: nadie envía 1 millón de líneas
  note: z.string().trim().max(500).optional(),
}).strict()                                   // campos desconocidos → 400 (o .strip() para descartarlos)

const ListOrdersQuery = z.object({
  status: z.enum(['pending', 'paid', 'cancelled']).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),   // tope obligatorio
  cursor: z.string().max(200).optional(),
})

const OrderParams = z.object({ id: z.uuid() })
```

- **Body, params y query** se validan; un `:id` que debería ser UUID o entero se rechaza antes de llegar a la base de datos.
- **Campos desconocidos:** recházalos (`strict`) o descártalos (`strip`), pero nunca los pases al ORM. Pasar `req.body` completo a `create()`/`update()` es **mass assignment**: un cliente añade `"role": "admin"` o `"balance": 99999`.
- **Coerción explícita** para query y params (llegan como strings).
- **Topes** en paginación, longitudes y tamaños de arrays (consumo de recursos).
- La validación de forma va aquí; las **reglas de negocio** (stock disponible, transiciones permitidas) van en el dominio.

## Controlador delgado

```ts
async function createOrder(req: Request, res: Response) {
  const body = CreateOrderBody.parse(req.body)            // 1. validar (el error handler convierte ZodError en 400)
  const order = await createOrderUseCase.execute({        // 2. caso de uso
    ...body,
    actorId: req.auth.userId,                             //    identidad desde la autenticación, nunca del body
  })
  res.status(201).location(`/orders/${order.id}`).json(toOrderDto(order))   // 3. DTO de salida + código
}
```

Sin SQL, sin reglas de negocio, sin `try/catch` que fabrique respuestas de error a mano.

## DTOs de salida

```ts
function toOrderDto(order: Order): OrderDto {
  return {
    id: order.id,
    status: order.status,
    total: order.total.toString(),          // dinero como string decimal (ver domain-logic)
    createdAt: order.createdAt.toISOString(),
    items: order.items.map(toOrderItemDto),
  }
}
```

- Nunca `res.json(entity)`: las entidades del ORM arrastran campos internos (hashes, flags, claves foráneas, relaciones cargadas) y cambian el contrato sin querer al añadir una columna.
- Fechas en ISO 8601 UTC; dinero como string decimal o entero en céntimos según el contrato.

## Errores

### Errores de dominio tipados

```ts
export abstract class AppError extends Error {
  abstract readonly status: number
  abstract readonly code: string
  constructor(message: string, readonly details?: Record<string, unknown>) { super(message) }
}
export class NotFoundError extends AppError { status = 404; code = 'NOT_FOUND' }
export class ConflictError extends AppError { status = 409; code = 'CONFLICT' }
export class BusinessRuleError extends AppError { status = 422; code = 'BUSINESS_RULE' }
export class ForbiddenError extends AppError { status = 403; code = 'FORBIDDEN' }
```

(El dominio puede usar errores sin `status` y mapearlos aquí si se quiere un dominio totalmente independiente de HTTP.)

### Error handler global

```ts
function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).type('application/problem+json').json({
      type: 'https://api.miapp.com/errors/validation',
      title: 'Datos inválidos',
      status: 400,
      errors: err.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
      requestId: req.id,
    })
  }
  if (err instanceof AppError) {
    return res.status(err.status).type('application/problem+json').json({
      type: `https://api.miapp.com/errors/${err.code.toLowerCase()}`,
      title: err.message,
      status: err.status,
      ...err.details,
      requestId: req.id,
    })
  }
  logger.error({ err, requestId: req.id }, 'Unhandled error')      // detalle completo solo en logs
  return res.status(500).type('application/problem+json').json({
    type: 'about:blank', title: 'Error interno', status: 500, requestId: req.id,
  })
}
```

- Formato **Problem Details (RFC 9457)** o el envelope que ya use el proyecto, pero **uno solo** en todos los endpoints (el contrato se define en `api-design`).
- `requestId` en cada error para cruzarlo con los logs.
- En producción: sin stack traces, mensajes de base de datos, rutas de archivos ni versiones.
- Errores de librerías conocidos (violación de unicidad del ORM → 409, registro no encontrado → 404) se mapean aquí, no en cada controlador.

## Orden del pipeline

```text
1. request id / correlación         (para logs y respuestas)
2. logging de la petición
3. cabeceras de seguridad, ocultar X-Powered-By
4. CORS
5. parser del body con límite de tamaño (p. ej. 100 KB por defecto; más solo en rutas que lo necesitan)
6. rate limiting                     (→ api-security)
7. autenticación                     (→ authentication)
8. validación                        (por ruta)
9. handler
10. 404 para rutas inexistentes
11. error handler global             (último)
```

- Todo middleware termina la petición **o** llama a `next()` exactamente una vez en cada rama.
- Errores asíncronos llegan al error handler (en frameworks que no lo hacen solos, envolver los handlers).

## Timeouts

- **Servidor:** tiempo máximo de petición, de cabeceras y de keep-alive (detrás de un balanceador, el keep-alive del servidor debe ser mayor que el del balanceador para evitar 502 esporádicos).
- **Dependencias:** cada llamada a base de datos (statement timeout), caché y APIs externas tiene timeout propio (→ `data-access`, `integrations`).
- El timeout de la petición debe ser mayor que la suma razonable de los de sus dependencias, y menor que el del balanceador o cliente.

## CORS y cabeceras

- Lista blanca explícita de orígenes; nunca reflejar el `Origin` recibido ni `*` con credenciales.
- APIs JSON: `X-Content-Type-Options: nosniff`, `Strict-Transport-Security` (si sirve HTTPS directamente), `Cache-Control: no-store` en respuestas con datos personales; sin `X-Powered-By`.
- `Content-Type` correcto en respuestas (`application/json` o `application/problem+json`) y rechazo de bodies con tipo inesperado.

## Graceful shutdown

```ts
const server = app.listen(port)

async function shutdown(signal: string) {
  logger.info({ signal }, 'Apagando')
  setReadiness(false)                         // el balanceador deja de enviar tráfico
  server.close()                              // deja de aceptar conexiones, termina las activas
  await Promise.race([drainInFlight(), sleep(25_000)])
  await Promise.allSettled([db.close(), redis.quit(), queue.close()])
  process.exit(0)
}
process.on('SIGTERM', () => void shutdown('SIGTERM'))
process.on('SIGINT', () => void shutdown('SIGINT'))
```

El plazo total debe ser menor que el periodo de gracia del orquestador (Kubernetes: `terminationGracePeriodSeconds`, 30 s por defecto).

## Anti-patrones

| Anti-patrón | Consecuencia | Corrección |
| :--- | :--- | :--- |
| `Model.create(req.body)` | Mass assignment | Schema estricto + mapeo explícito |
| `res.json(entity)` | Fuga de campos internos | DTO de salida |
| `try/catch` en cada controlador con respuestas propias | Formatos de error dispares | Error handler global |
| Middleware que no llama a `next()` en una rama | Petición colgada hasta timeout | Revisar todas las ramas |
| Errores asíncronos sin propagar | Unhandled rejection, petición colgada | Framework con soporte async o wrapper |
| `limit` de paginación sin tope | Consultas enormes, DoS | Máximo forzado |
| Stack trace en la respuesta | Fuga de información | Detalle solo en logs |
| Sin límite de body | Consumo de memoria | Límite por defecto bajo |
| Identidad tomada del body (`userId` en el JSON) | Suplantación | Identidad de la sesión/token |
| `process.exit()` inmediato en SIGTERM | Peticiones cortadas en cada despliegue | Graceful shutdown |
