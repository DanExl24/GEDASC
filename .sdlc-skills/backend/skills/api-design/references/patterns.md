# Patrones de diseño de APIs

## Recursos y métodos

```text
GET    /orders                    lista (paginada, filtrable)
POST   /orders                    crear                         → 201 + Location: /orders/{id}
GET    /orders/{id}               detalle
PATCH  /orders/{id}               modificación parcial
PUT    /orders/{id}               reemplazo completo (solo si el cliente gestiona el recurso entero)
DELETE /orders/{id}               borrar                        → 204
GET    /orders/{id}/items         subcolección (un nivel de anidamiento basta)
POST   /orders/{id}/cancel        acción que no es CRUD         → 200 con el recurso actualizado (o 202 si es asíncrona)
```

- **Sustantivos en plural** para colecciones; las acciones de negocio que no encajan en CRUD como subrecurso con verbo (`/cancel`, `/refunds`) son pragmáticas y claras.
- **Un nivel de anidamiento**: `/orders/{id}/items` sí; `/customers/{c}/orders/{o}/items/{i}/notes` no (usa `/items/{i}/notes`).
- `PATCH` con JSON Merge Patch (RFC 7396, objeto parcial) para la mayoría; JSON Patch (RFC 6902) solo si hacen falta operaciones sobre arrays.

| Método | Seguro | Idempotente | Uso |
| :--- | :---: | :---: | :--- |
| GET, HEAD | ✅ | ✅ | Leer. Nunca cambia estado |
| PUT | ❌ | ✅ | Reemplazar |
| DELETE | ❌ | ✅ | Borrar (repetirlo no es un error: 204 o 404 según la convención elegida) |
| PATCH | ❌ | ❌ (puede serlo) | Modificar parcialmente |
| POST | ❌ | ❌ | Crear, acciones. Hacerlo idempotente con `Idempotency-Key` |

## Códigos de estado

| Código | Cuándo |
| :--- | :--- |
| 200 | Éxito con cuerpo |
| 201 | Recurso creado (con `Location`) |
| 202 | Aceptado para procesarse de forma asíncrona (con `Location` del recurso de estado) |
| 204 | Éxito sin cuerpo |
| 304 | No modificado (`If-None-Match`) |
| 400 | Petición mal formada (JSON inválido, tipos incorrectos) |
| 401 | Sin autenticar o credenciales inválidas |
| 403 | Autenticado pero sin permiso |
| 404 | No existe (o no es visible para este actor) |
| 409 | Conflicto con el estado actual (duplicado, transición inválida, `Idempotency-Key` reutilizada con otro cuerpo) |
| 412 | Precondición fallida (`If-Match` con versión antigua) |
| 415 | `Content-Type` no soportado |
| 422 | Bien formada pero inválida (validación de campos, regla de negocio) |
| 429 | Límite de peticiones superado (con `Retry-After`) |
| 500 | Error inesperado del servidor |
| 502/503/504 | Dependencia caída, servicio no disponible (con `Retry-After` si se sabe), timeout |

Elige y documenta la frontera entre 400 y 422 (p. ej. 400 para errores de sintaxis/tipos y 422 para validación semántica, o 422 para ambos) y aplícala igual en todos los endpoints.

## Convenciones

Decide una vez y aplícalo en toda la API:

| Aspecto | Recomendación |
| :--- | :--- |
| Nombres de campos | `camelCase` (habitual con clientes JS) o `snake_case`; **uno solo** en toda la API |
| Fechas | ISO 8601 en UTC con zona: `2026-01-15T10:30:00Z`; fechas sin hora: `2026-01-15` |
| Dinero | `{ "amount": "19.99", "currency": "EUR" }` (string decimal) o entero en unidad mínima (`1999`); nunca float |
| IDs | Strings (aunque internamente sean números: evita problemas de precisión en JS con enteros grandes) |
| Enumeraciones | Strings estables (`"paid"`), nunca números mágicos; documentar que pueden añadirse valores |
| Booleanos | Nombres afirmativos (`isActive`), sin `null` como tercer estado salvo que signifique "desconocido" |
| Campos vacíos | Omitir o `null`, pero de forma consistente |
| Colecciones | `{ "data": [...], "nextCursor": "…" }`; recursos individuales sin envoltorio |

## Errores (RFC 9457)

```http
HTTP/1.1 422 Unprocessable Content
Content-Type: application/problem+json

{
  "type": "https://api.miapp.com/errors/validation",
  "title": "Datos inválidos",
  "status": 422,
  "detail": "Hay 2 campos con errores",
  "code": "VALIDATION_FAILED",
  "errors": [
    { "field": "email", "code": "INVALID_FORMAT", "message": "Introduce un email válido" },
    { "field": "items[0].quantity", "code": "OUT_OF_RANGE", "message": "Debe estar entre 1 y 1000" }
  ],
  "requestId": "01J…"
}
```

- `type` (URI) y `code` **estables**: los clientes programan contra ellos, no contra `title`/`message`.
- **Catálogo de errores** documentado (códigos, cuándo ocurren, si son reintentables).
- `errors` por campo con la ruta del campo, para que el frontend los muestre junto a cada input.
- Reglas de negocio con códigos específicos (`INSUFFICIENT_STOCK`, `ORDER_ALREADY_SHIPPED`).
- `requestId` para soporte.

## Paginación, filtros y orden

```http
GET /orders?status=paid&createdFrom=2026-01-01&sort=-createdAt&limit=20&cursor=eyJjIjoi…

{
  "data": [ … ],
  "nextCursor": "eyJjIjoi…",      // null si no hay más
  "hasMore": true
}
```

- **Cursor** opaco (→ `data-access`); `limit` con valor por defecto y máximo documentados.
- El total exacto es caro en tablas grandes: inclúyelo solo si hace falta (o como estimación, o en un endpoint aparte).
- **Filtros** con nombres explícitos y operadores limitados (`createdFrom`/`createdTo`) en lugar de un lenguaje de consulta genérico; lista blanca de campos filtrables y ordenables.
- **Orden**: `sort=campo` ascendente, `-campo` descendente; lista blanca.
- **Proyección** opcional (`fields=id,status,total`) solo si hay recursos grandes y clientes que lo necesitan.

## Idempotencia

```http
POST /payments
Idempotency-Key: 6f1c9a2e-…            ← generada por el cliente, una por operación lógica
```

Servidor:
1. Busca la clave (por cliente/tenant). Si no existe, la **reserva** (inserción con unicidad) junto al hash del cuerpo y estado "en curso".
2. Ejecuta la operación y guarda el código y el cuerpo de la respuesta con la clave.
3. Si la clave ya existe con respuesta guardada y **mismo** hash de cuerpo → devuelve la respuesta guardada (mismo código).
4. Mismo clave con **distinto** cuerpo → 409 (o 422).
5. Clave "en curso" (petición concurrente) → 409 con `Retry-After`.
6. Las claves caducan (p. ej. 24 h).

Imprescindible en pagos, pedidos, transferencias y cualquier creación que un cliente pueda reintentar tras un timeout.

## Concurrencia optimista (ETag / If-Match)

```http
GET /documents/42            → 200, ETag: "v7"
PATCH /documents/42          If-Match: "v7"   → 200, ETag: "v8"
PATCH /documents/42          If-Match: "v7"   → 412 Precondition Failed (otro cliente ya lo modificó)
```

El `ETag` puede ser la columna de versión (→ `data-access`). Útil en edición colaborativa y en cualquier recurso que varios actores modifican.

## Operaciones largas y masivas

- **Largas:** `202 Accepted` + `Location: /exports/123`; el recurso de estado indica `pending | running | succeeded | failed`, progreso y, al terminar, el enlace al resultado. Opcionalmente un webhook al terminar (→ `async-messaging`, `integrations`).
- **Masivas:** `POST /orders/batch` con límite de elementos y resultado por elemento (`{ index, status, id | error }`); documenta si es atómica (todo o nada) o parcial.

## Versionado y evolución

### Cambios compatibles e incompatibles

| Compatibles (sin versión nueva) | Incompatibles (requieren versión o negociación) |
| :--- | :--- |
| Añadir endpoints | Eliminar o renombrar endpoints o campos |
| Añadir campos opcionales en la respuesta | Cambiar el tipo o el formato de un campo |
| Añadir parámetros opcionales | Hacer obligatorio un parámetro o campo de entrada |
| Añadir valores a un enum (si el cliente está avisado de que puede pasar) | Cambiar el significado de un campo o de un código de error |
| Relajar una validación | Endurecer una validación existente |
| | Cambiar códigos de estado o la forma de los errores |
| | Cambiar paginación o el orden por defecto |

### Estrategia

- **Evita romper:** la mayoría de las evoluciones caben en cambios compatibles (campo nuevo junto al antiguo durante una transición).
- Versión en la URL (`/v1/...`) para APIs públicas por su simplicidad; por cabecera o media type si el equipo lo prefiere. Una versión mayor por cambio incompatible, no por cada release.
- **Deprecación:** cabeceras `Deprecation` (RFC 9745) y `Sunset` (RFC 8594) en los endpoints que se retiran, aviso en la documentación y el changelog, métricas de uso para saber quién sigue usándolos, y fecha de retirada.
- Clientes móviles: asume que versiones antiguas de la app seguirán en circulación meses.

## Contract-first con OpenAPI

- Especificación **OpenAPI 3.1** en el repositorio: escrita primero (contract-first) o generada desde el código (code-first), pero **revisada** como un artefacto más.
- **Linter** (Spectral, Redocly) con reglas de la casa: nombres, paginación obligatoria en listas, Problem Details en errores, ejemplos.
- **Generación:** tipos y clientes para el frontend y los consumidores (→ `frontend:typescript`), stubs o interfaces del servidor.
- **Verificación:** tests de contrato que comprueban que la implementación cumple la especificación (→ `testing`); diff de especificaciones en CI para detectar cambios incompatibles (`oasdiff`, `openapi-diff`).
- Documentación navegable generada a partir de la especificación (pública solo si la API lo es → `api-security`).

## GraphQL (notas)

- Úsalo cuando hay muchos clientes con necesidades de datos muy distintas sobre un grafo rico; para APIs públicas simples o integraciones, REST suele ser más fácil de cachear y operar.
- Esquema con nulabilidad deliberada, mutaciones con input types y payloads con errores de dominio tipados.
- Paginación con *connections* (cursor).
- Obligatorio: DataLoader contra N+1 (→ `data-access`), límites de profundidad y coste, timeouts, autorización por campo/objeto en los resolvers, y queries persistidas en clientes propios.
- Evolución: deprecar campos con `@deprecated`, nunca cambiar tipos en sitio.

## gRPC (notas)

- Para comunicación interna entre servicios con contratos estrictos y alto rendimiento.
- Compatibilidad en Protobuf: no reutilizar números de campo, no cambiar tipos, campos nuevos opcionales, `reserved` para los eliminados; linter y detección de cambios incompatibles (`buf lint`, `buf breaking`).
- Deadlines en todas las llamadas y propagados; códigos de estado de gRPC usados con su significado (`NOT_FOUND`, `FAILED_PRECONDITION`, `UNAVAILABLE`).

## Anti-patrones

| Anti-patrón | Consecuencia | Corrección |
| :--- | :--- | :--- |
| `200 OK` con `{ "success": false }` | Clientes, proxies y monitorización ven éxito | Código de estado real + Problem Details |
| Errores con formatos distintos por endpoint | Cada cliente necesita casos especiales | Formato único |
| Mensajes de error como contrato | Cambiar un texto rompe clientes | Códigos estables |
| `GET` que modifica datos | Cachés, prefetch y crawlers cambian estado | `POST`/`PATCH` |
| Listas sin paginar | Respuestas gigantes, timeouts | Cursor + límite |
| Dinero en float o IDs numéricos grandes en JSON | Pérdida de precisión en clientes | Strings |
| POST de pago sin idempotencia | Cobros duplicados al reintentar | `Idempotency-Key` |
| Renombrar un campo "porque queda mejor" | Clientes rotos | Campo nuevo + deprecación |
| Mezcla de `camelCase` y `snake_case` | Errores silenciosos en clientes | Una convención |
| Especificación OpenAPI desactualizada | Documentación que miente | Generada/verificada en CI |
