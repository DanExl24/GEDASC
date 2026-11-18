# Patrones de contrato API ↔ cliente

## Las cinco dimensiones de desajuste

| # | Dimensión | Síntoma típico | Ejemplo |
| :-: | :--- | :--- | :--- |
| 1 | **Nombres y casing** | Campos `undefined` en pantalla | El backend serializa `created_at` (Python/ORM) y el cliente lee `createdAt`. |
| 2 | **Envelope** | Listas vacías, `data.data`, paginación que no avanza | Un endpoint devuelve `{ items, nextCursor }`, otro `{ data: [...] }`, otro el array a secas. |
| 3 | **Tipos y coerción** | Importes con decimales extraños, IDs que no encuentran el registro, fechas desplazadas | ID `bigint` serializado como número (pierde precisión por encima de 2⁵³−1); dinero como `float`; fecha sin zona interpretada como local; `"true"` en query string tratado como booleano. |
| 4 | **Errores y códigos de estado** | "Ha ocurrido un error" ante cualquier fallo; formularios que no marcan el campo | El backend responde `422` con errores por campo y el cliente solo comprueba `!res.ok`; `200` con `{ error }` dentro; `500` para un caso de validación. |
| 5 | **Sesión, cabeceras y CORS** | Login que "no persiste", 401 en bucle, peticiones bloqueadas | Cookie sin `credentials: 'include'` en el cliente; `SameSite=None` sin `Secure`; `Access-Control-Allow-Origin: *` con credenciales; el cliente no reintenta tras refrescar el token o lo refresca en paralelo N veces. |

## Tabla de cruce

Una fila por endpoint consumido. Rellénala desde el código de las dos capas.

| Endpoint | Método | Request (servidor) | Request (cliente) | ¿Coincide? | Response (servidor) | Response (cliente lee) | ¿Coincide? | Errores (servidor → cliente) |
| :--- | :-: | :--- | :--- | :-: | :--- | :--- | :-: | :--- |
| `/api/orders` | POST | `{ items[{product_id, qty}], coupon? }` | `{ items[{productId, quantity}] }` | ❌ 1 | `201 { id: string, total_cents }` | `res.data.total` | ❌ 1·2·3 | `422 errors[]` → solo `toast("Error")` ❌ 4 |
| `/api/orders/:id` | GET | — | — | ✅ | `{ id, status, items }` | `order.status` | ✅ | `404` → redirige a lista ✅ |

Marca en la columna el número de dimensión que falla. Lo que el cliente **no** lee también importa: campos sensibles que el servidor envía sin necesidad (`password_hash`, notas internas) son un hallazgo de exposición (→ `backend:http-layer`).

### Veredicto por desajuste

| Situación | Corrige | Motivo |
| :--- | :--- | :--- |
| El servidor rompe sus propias convenciones en un endpoint | Servidor | La API debe ser consistente para todos los clientes. |
| El cliente asume algo que la API nunca prometió | Cliente | El contrato manda. |
| Ambos tienen tipos escritos a mano que divergen | Extraer contrato compartido | El desajuste volverá a ocurrir mientras haya dos fuentes. |
| Hay clientes en circulación que dependen del formato actual | Servidor de forma compatible (ampliar), luego cliente, luego retirar | No romper a nadie. |

## Fuente única de verdad

| Opción | Cuándo | Cómo |
| :--- | :--- | :--- |
| **OpenAPI generado desde el código** | Backend con tipos fuertes (NestJS, FastAPI, Spring) | El framework publica la especificación; el cliente genera tipos o cliente (`openapi-typescript`, `orval`, `openapi-generator`). |
| **OpenAPI escrito primero (contract-first)** | API pública o equipos separados | La especificación se revisa en PR con un linter (Spectral, Redocly) y se generan stubs en ambos lados. |
| **Esquemas compartidos (Zod, Valibot, TypeBox) en `shared/`** | Monorepo TypeScript en ambas capas | Un paquete `contracts` con los esquemas; el servidor valida con ellos y el cliente infiere los tipos (`z.infer`). |
| **tRPC / RPC tipado** | Monorepo TypeScript, un solo cliente propio | Tipos de extremo a extremo sin especificación; no sirve para clientes de terceros ni otros lenguajes. |

Reglas comunes:

- Los tipos generados **se regeneran en CI** y el build falla si están desactualizados (comprobación de diff).
- El paquete compartido contiene **contratos, no lógica:** esquemas, tipos y constantes del cable. Nada de acceso a datos ni reglas de negocio.
- Si el cliente recibe datos de fuera de su control (terceros, almacenamiento local, mensajes), los **parsea** en la frontera aunque haya tipos generados.

## Convenciones del cable

- **Casing:** uno solo en el cable (habitualmente `camelCase` para clientes JS). Si el backend es Python/Java con `snake_case` interno, la conversión vive en la capa de serialización del servidor (alias de Pydantic, `@JsonNaming` en Jackson), no repartida por el cliente.
- **Envelope:** o ninguno (recurso directo, colecciones con `{ items, nextCursor }`) o uno único para toda la API. Nunca mezclas.
- **Errores:** Problem Details (RFC 9457) con `type`, `title`, `status`, un `code` estable y `errors[]` por campo (`{ field, code, message }`). El cliente mapea `code`, no `message`.
- **IDs:** string (UUID, ULID o bigint serializado como string).
- **Dinero:** entero en unidades mínimas (`amountCents`) o string decimal, más `currency` ISO 4217. Nunca `float`.
- **Fechas:** ISO 8601 con zona (`2026-11-18T10:00:00Z`) para instantes; `YYYY-MM-DD` para fechas de calendario sin hora (cumpleaños, fecha de factura), que el cliente **no** convierte con `new Date()` (lo interpreta en UTC y desplaza el día).
- **Nulos y ausencias:** decide si un campo opcional se omite o se envía `null`, y documéntalo.
- **Enums:** strings estables; el cliente tolera valores desconocidos (un estado nuevo no debe romper la pantalla).

## Sesión y cabeceras

| Estrategia | Servidor | Cliente |
| :--- | :--- | :--- |
| Cookie de sesión `HttpOnly` (recomendada para SPA del mismo sitio) | `Secure`, `SameSite=Lax` o `Strict`, protección CSRF (token o cabecera personalizada + comprobación de `Origin`) | `credentials: 'include'` (o `withCredentials`), envía el token CSRF |
| Cookie entre sitios distintos | `SameSite=None; Secure`, CORS con origen explícito y `Allow-Credentials: true` | Igual que arriba; evita depender de cookies de terceros si se puede servir bajo el mismo sitio |
| Bearer token en memoria + refresh en cookie `HttpOnly` | Refresh rotativo (`backend:authentication`) | Un único refresh en vuelo compartido por las peticiones que reciben 401; reintenta la original una vez |

Anti-patrones: token de acceso en `localStorage` (expuesto a XSS) combinado con una API sin defensas adicionales; CORS `*` con credenciales (el navegador lo rechaza y se "arregla" reflejando cualquier `Origin`); refresh disparado por cada petición en paralelo.

## Verificación del contrato

- **Servidor:** test que valida las respuestas reales contra la especificación (Schemathesis, Dredd, `jest-openapi`, tests de Spring con `springdoc`) o contra los esquemas compartidos.
- **Cliente:** tests con mocks generados desde la especificación (MSW con handlers derivados del contrato), no escritos a mano.
- **Consumer-driven** (Pact) cuando hay varios consumidores con necesidades distintas o equipos separados.
- **CI:** la especificación se publica como artefacto; un cambio incompatible (oasdiff, `openapi-diff`) bloquea el PR o exige versión nueva.

## Evolución y orden de despliegue

Compatibles (se despliegan sin coordinación): añadir un endpoint, añadir un campo opcional en la respuesta, añadir un campo opcional en la petición, añadir un valor de enum **si el cliente tolera desconocidos**.

Incompatibles: renombrar o quitar campos, cambiar tipos o formatos, convertir un campo en obligatorio, cambiar códigos de estado, cambiar el formato de error.

Orden para un cambio incompatible (expand/contract entre capas):

1. **Servidor amplía:** acepta y devuelve el formato nuevo **y** el antiguo (o versión nueva del endpoint).
2. **Cliente migra** al formato nuevo y se despliega; con apps móviles, se espera a que la versión antigua caiga por debajo del umbral acordado.
3. **Servidor retira** el formato antiguo, con aviso de deprecación (`Deprecation`, `Sunset`) y métricas de uso del formato viejo a cero.

Si frontend y backend se despliegan juntos (mismo artefacto), el paso 2 puede ir en el mismo despliegue, pero las pestañas abiertas con el bundle anterior siguen llamando al formato viejo: mantén la compatibilidad al menos un ciclo de despliegue.
