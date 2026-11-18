# Patrones de diagnóstico de flujos

## Mapa del flujo

Rellena una fila por etapa con el valor **esperado** y el **real** del dato que falla. La primera fila donde difieren es la culpable.

| # | Etapa | Dónde mirar | Esperado | Real |
| :-: | :--- | :--- | :--- | :--- |
| 1 | Entrada en la UI | Componente, `v-model`/estado controlado, máscara del input | | |
| 2 | Estado del cliente | Store, caché de queries, estado del formulario | | |
| 3 | Construcción de la petición | Servicio o cliente HTTP, serialización, cabeceras | | |
| 4 | **Cable: petición** | Network/HAR: método, URL, body, cookies, cabeceras | | |
| 5 | Entrada al servidor | Proxy, CORS, middlewares (auth, parseo del body) | | |
| 6 | Validación y DTO | Esquema, coerción de tipos, campos descartados | | |
| 7 | Dominio | Caso de uso, reglas, cálculos, permisos | | |
| 8 | Persistencia | Consulta o ORM real (log de SQL), transacción, triggers, constraints | | |
| 9 | Construcción de la respuesta | DTO de salida, serialización (casing, fechas, decimales) | | |
| 10 | **Cable: respuesta** | Network: status, body, cabeceras de caché | | |
| 11 | Procesado en el cliente | Mapeo, actualización o invalidación de la caché, manejo de errores | | |
| 12 | Render | Formateo (fechas, moneda, i18n), condicionales de la plantilla | | |

Efectos asíncronos (colas, webhooks, jobs) se añaden como etapas propias tras la 8.

## Método de bisección

1. **Mira el cable primero** (etapas 4 y 10). Si la petición ya va mal, el problema está en 1–3; si la petición va bien y la respuesta mal, en 5–9; si ambas van bien, en 11–12.
2. Dentro de la mitad sospechosa, vuelve a dividir: por ejemplo, consulta la base de datos directamente para separar 5–8 de 9.
3. **Una hipótesis cada vez,** con una observación que la confirme o la descarte (un log temporal, un breakpoint, una consulta, un test). Retira los logs temporales al terminar.
4. Si el fallo es intermitente, busca la variable: datos concretos, usuario o rol, concurrencia, caché, zona horaria, entorno.
5. Si solo falla en producción, compara en orden: variables de entorno, dominio y cookies (`SameSite`, `Secure`, dominio), CORS y proxy (cabeceras eliminadas, tamaño de body), zona horaria del servidor y de la base de datos, versión del bundle (caché del CDN o service worker), datos reales que no existen en local.

## Fallos frecuentes por etapa

| Síntoma | Causas habituales (etapa) |
| :--- | :--- |
| Un campo se guarda vacío | Nombre distinto entre capas (3/6); el DTO o el esquema descarta campos no declarados (6); mass assignment protegido sin incluir el campo (6) |
| Fecha un día antes o después | `new Date('2026-11-18')` interpreta UTC y se muestra en local (1/12); columna `timestamp` sin zona (8); servidor y base de datos en zonas distintas (8) |
| Importe con decimales raros | `float` en el cliente o en la columna (1/8); redondeo en el cliente antes de enviar (3) |
| Registro duplicado | Doble clic sin deshabilitar (1); reintento automático sin idempotencia (3/7); falta constraint único (8) |
| "Guardado" pero no se ve el cambio | La caché del cliente no se invalida o actualiza (11); la respuesta devuelve el estado previo (9); lectura de una réplica con retraso (8) |
| Error sin mensaje útil | El cliente no lee el formato de error (11); el servidor responde `500` genérico o `200` con error (9); `catch` vacío en alguna capa |
| La petición se queda colgada | Rama del controlador que no responde (`catch` sin `res.status().json()`) (9); transacción sin timeout o bloqueada (8) |
| Datos de otro usuario o pestaña | Carrera entre peticiones: una respuesta lenta pisa a otra más nueva (11); caché del servidor sin el usuario en la clave (7/8) |
| 401/403 inesperados | Cookie no enviada (`credentials`, `SameSite`) (3/4); token caducado sin refresh (3); middleware de autorización con el recurso equivocado (5/7) |
| Funciona en Postman, falla en el navegador | CORS o preflight (5); cookies; cabeceras que añade el cliente HTTP |
| Cambio invisible para algunos usuarios | Bundle antiguo en caché (12); versión antigua de la app móvil con el contrato viejo (→ `contracts`) |

## Flujos robustos

Para que el próximo fallo se diagnostique en minutos:

- **ID de correlación** generado en el cliente o en el borde, enviado en una cabecera (`traceparent` o `X-Request-Id`), propagado a logs, trazas y colas, y mostrado en el mensaje de error al usuario ("código de referencia").
- **Validación en ambas capas** con el mismo esquema o contrato; el servidor siempre manda y devuelve errores por campo que el cliente pinta.
- **Envío único:** botón deshabilitado durante el envío **y** idempotencia en el servidor (`Idempotency-Key` o constraint único) para los reintentos.
- **Errores tipados de punta a punta:** el dominio lanza errores con código, el error handler los traduce a Problem Details, el cliente los mapea por `code`.
- **Estado consistente tras escribir:** el servidor devuelve el recurso actualizado y el cliente actualiza o invalida su caché; peticiones obsoletas canceladas (`AbortController`) o ignoradas.
- **Fechas y dinero** con las convenciones de `contracts`.

## Escalado a skills de capa

| Etapa culpable | Skill para corregir |
| :--- | :--- |
| 1, 12 (entrada, formateo, render) | `frontend:forms`, `frontend:i18n`, `frontend:ux-review` |
| 2, 11 (estado y caché del cliente) | `frontend:state-management`, `frontend:data-fetching` |
| 3, 4, 10 (cliente HTTP y cable) | `frontend:data-fetching`, `contracts` |
| 5, 6, 9 (middlewares, validación, serialización) | `backend:http-layer`, `backend:api-security`, `backend:authentication` |
| 7 (dominio, permisos) | `backend:domain-logic`, `backend:authorization` |
| 8 (persistencia) | `backend:data-access`, `backend:schema-and-migrations` |
| Asíncrono tras la 8 | `backend:async-messaging`, `backend:integrations` |
| Sin evidencia suficiente para diagnosticar | `backend:observability`, `frontend:observability` |
