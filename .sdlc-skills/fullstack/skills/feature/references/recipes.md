# Recetas de funcionalidades

Cada receta es un punto de partida: se ajusta al proyecto (se quita lo que ya existe, se añade lo que exige el contexto). Los pasos marcados con ★ son imprescindibles en modo **enfocado**; en modo **mínimo**, solo contrato, backend y frontend esenciales.

## Orden por defecto

1. **Contrato:** `backend:api-design` → `fullstack:contracts` (tipos o esquemas compartidos).
2. **Datos:** `backend:schema-and-migrations` → `backend:data-access`.
3. **Dominio:** `backend:domain-logic`.
4. **Frontera y seguridad:** `backend:http-layer` → `backend:authorization` (y `authentication` si cambia la identidad) → `backend:api-security` si hay entradas de riesgo.
5. **Efectos y terceros:** `backend:async-messaging`, `backend:integrations`, `backend:caching` si aplica.
6. **Cliente:** `frontend:routing` → `frontend:data-fetching` → `frontend:state-management` (solo si hay estado global) → `frontend:forms` → componentes con `frontend:design-system` y `frontend:accessibility`.
7. **Calidad:** `backend:testing` y `frontend:testing`; `backend:observability` y `frontend:observability` para los caminos críticos.
8. **Verificación cruzada:** checklists rápidos y `fullstack:contracts` sobre lo nuevo.

## CRUD de un recurso con permisos

| # | Skill | Entregable |
| :-: | :--- | :--- |
| 1 ★ | `backend:api-design` | Endpoints, paginación por cursor, errores RFC 9457 |
| 2 ★ | `fullstack:contracts` | Esquemas o tipos compartidos del recurso |
| 3 ★ | `backend:schema-and-migrations` | Tabla, constraints e índices desde las consultas previstas |
| 4 ★ | `backend:data-access` | Repositorio con límites y filtros de lista blanca |
| 5 ★ | `backend:authorization` | Autorización por objeto (y tenant si aplica), filtrada en las consultas |
| 6 ★ | `backend:http-layer` | Validación, DTO de salida sin campos internos |
| 7 ★ | `frontend:data-fetching` | Queries y mutaciones con invalidación |
| 8 ★ | `frontend:forms` | Alta y edición con errores del servidor por campo |
| 9 | `frontend:ux-review` | Estados vacío, carga y error; confirmación de borrado |
| 10 ★ | `backend:testing` · `frontend:testing` | Matriz de permisos; formulario y listado |

## Autenticación (login, registro, recuperación)

1 ★ `backend:authentication` (estrategia de sesión, hashing, login sin enumeración, reset) → 2 ★ `fullstack:contracts` (sesión, cookies, CORS, refresh) → 3 ★ `backend:api-security` (rate limit de login y reset) → 4 ★ `frontend:routing` (guards y redirecciones seguras) → 5 ★ `frontend:forms` → 6 ★ `frontend:security` (almacenamiento del token o cookie) → 7 `backend:observability` (eventos de seguridad sin datos sensibles) → 8 ★ tests de ambos lados (incluido el flujo de refresh).

## Pagos con un proveedor (Stripe, Adyen, MercadoPago…)

1 ★ `backend:api-design` (creación idempotente con `Idempotency-Key`) → 2 ★ `backend:domain-logic` (máquina de estados del pedido y del pago, importes como value object) → 3 ★ `backend:schema-and-migrations` (pagos, constraint único por referencia del proveedor) → 4 ★ `backend:integrations` (adaptador, timeouts, idempotencia hacia el proveedor, webhook entrante con firma verificada) → 5 ★ `backend:async-messaging` (procesar el webhook con inbox/consumidor idempotente) → 6 ★ `backend:authorization` → 7 ★ `fullstack:contracts` (importes en unidades mínimas, estados) → 8 ★ `frontend:forms` (envío único, componente del proveedor para los datos de tarjeta) → 9 ★ `frontend:data-fetching` (estado del pago tras la redirección o el webhook) → 10 `backend:observability` (métricas y alertas de pagos fallidos) → 11 ★ tests (webhook duplicado, fuera de orden, firma inválida, doble envío).

Los datos de tarjeta **nunca** pasan por el backend propio: los captura el componente del proveedor.

## Subida de archivos

1 ★ `backend:api-design` (subida directa con URL firmada o multipart con límites) → 2 ★ `backend:api-security` (tipo real, tamaño, nombre, escaneo, almacenamiento fuera del webroot) → 3 ★ `backend:authorization` (quién descarga qué; URLs firmadas con caducidad) → 4 `backend:async-messaging` (procesado posterior: miniaturas, escaneo) → 5 ★ `frontend:forms` (progreso, cancelación, errores de validación) → 6 `frontend:accessibility` (input accesible, arrastrar y soltar con alternativa) → 7 ★ tests.

## Notificaciones y emails

1 ★ `backend:domain-logic` (qué evento dispara qué notificación) → 2 ★ `backend:async-messaging` (encolar tras el commit, reintentos, DLQ, deduplicación) → 3 ★ `backend:integrations` (proveedor de email o push con timeouts) → 4 `backend:data-privacy` (preferencias y bajas, sin datos sensibles en el contenido) → 5 `frontend:data-fetching` y `frontend:ux-review` (centro de notificaciones, preferencias) → 6 `frontend:i18n` (plantillas por idioma) → 7 ★ tests (evento duplicado no envía dos veces).

## Listado con búsqueda, filtros y exportación

1 ★ `backend:api-design` (cursor, filtros y orden de lista blanca) → 2 ★ `backend:schema-and-migrations` (índices para los filtros reales) → 3 ★ `backend:data-access` (límites, sin N+1) → 4 ★ `backend:authorization` (el listado y la exportación filtran por permisos) → 5 `backend:async-messaging` (exportaciones grandes como trabajo asíncrono) → 6 ★ `frontend:routing` (filtros en la URL) → 7 ★ `frontend:data-fetching` (debounce, cancelación, caché por filtros) → 8 `frontend:performance` (virtualización si hay muchas filas) → 9 `frontend:responsive-layout` (tabla en móvil) → 10 ★ tests.

## Multi-tenant (convertir o añadir un módulo multi-tenant)

1 ★ `backend:architecture` (modelo de tenancy) → 2 ★ `backend:schema-and-migrations` (`tenant_id`, índices compuestos, migración sin downtime) → 3 ★ `backend:authorization` (resolución del tenant, RLS o filtro obligatorio) → 4 ★ `backend:caching` (tenant en las claves) → 5 ★ `backend:async-messaging` (tenant en los mensajes) → 6 `frontend:routing` y `frontend:data-fetching` (cambio de tenant limpia la caché) → 7 ★ tests de aislamiento entre tenants.

## Tiempo real (actualizaciones en vivo)

1 ★ `backend:api-design` (SSE o WebSocket, formato de eventos) → 2 ★ `backend:authentication` y `backend:authorization` (autorizar la conexión y cada canal) → 3 ★ `backend:async-messaging` (pub/sub entre instancias) → 4 ★ `frontend:data-fetching` (reconexión, reconciliación con la caché) → 5 `frontend:performance` (no re-renderizar todo por evento) → 6 ★ tests.

## Nuevo idioma o país

1 ★ `frontend:i18n` → 2 `frontend:rendering-and-seo` (URLs por idioma, hreflang) → 3 `frontend:responsive-layout` (expansión de texto, RTL) → 4 ★ `fullstack:contracts` (fechas, monedas y formatos en el cable) → 5 `backend:data-privacy` (requisitos legales del país).
