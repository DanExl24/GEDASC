---
name: contracts
description: Reconcilia y diseña el contrato entre una API y su cliente frontend. Construye la tabla de cruce endpoint ↔ consumidor y detecta desajustes en cinco dimensiones (nombres y casing, envelope, tipos y coerción como IDs, dinero y fechas, errores y códigos de estado, sesión, cabeceras y CORS); propone una fuente única de verdad (OpenAPI o esquemas compartidos en shared/), generación de tipos y cliente, tests de contrato y el orden de despliegue de cambios de contrato. Úsala cuando la pantalla muestra datos vacíos o erróneos, al añadir endpoints consumidos por el frontend o para eliminar tipos duplicados a mano. No para diseñar la API en sí (backend:api-design) ni para la capa de datos del cliente (frontend:data-fetching).
---

# Contratos API ↔ cliente

La mayoría de los fallos "misteriosos" entre capas son desajustes de contrato: el backend devuelve `user_id` y el cliente lee `userId`; el backend responde `422` con errores por campo y el formulario solo muestra "Error"; un ID de 64 bits pierde precisión en JavaScript. **La verdad está en el cable:** lo que importa es lo que viaja por la red, no lo que cada capa cree que viaja.

## Cuándo usarla

- La UI muestra campos vacíos, `undefined`, fechas desplazadas o importes erróneos.
- Errores del servidor que el cliente no muestra o muestra mal.
- Problemas de sesión entre capas (cookies que no llegan, CORS, refresh que no se dispara).
- Añadir o cambiar endpoints consumidos por el frontend.
- Tipos duplicados a mano en ambas capas o adopción de un contrato compartido (OpenAPI, Zod, codegen).

**No es para:** convenciones y diseño de la API → `backend:api-design` · validación y DTOs en el servidor → `backend:http-layer` · caché, reintentos y estados de carga en el cliente → `frontend:data-fetching` · tipado interno del cliente → `frontend:typescript` · un flujo concreto que falla sin saber dónde → `flow-diagnosis`.

## Paso 0: contexto (ambos modos)

1. Localiza las dos capas: rutas del backend (controladores, router, especificación OpenAPI) y consumidores del frontend (cliente HTTP, servicios, hooks/composables, stores).
2. Detecta el stack de cada lado y carga la nota correspondiente de los otros plugins si los vas a tocar: `frontend:data-fetching` (`references/vue.md`, `react.md`, `angular.md`) y `backend:http-layer` (`references/node.md`, `python.md`, `java.md`). Si un plugin no está instalado, avísalo y sigue con la base de esta skill.
3. Averigua si existe una fuente de verdad: especificación OpenAPI, esquemas compartidos (`shared/`, `packages/contracts`), tipos generados o nada.
4. Identifica los consumidores que no se actualizan a la vez que el servidor (apps móviles, clientes cacheados, integraciones): condicionan el orden de despliegue.
5. Si existe `.sdlc/context.md`, léelo y respeta sus convenciones y decisiones ([context.md](../../standards/context.md)).

## Modo Construir

1. **Fuente única de verdad.** Elige una y genera el resto desde ella. Ver [patterns.md § Fuente de verdad](references/patterns.md#fuente-única-de-verdad).
2. **Convenciones del cable** decididas una vez: casing, envelope o ausencia de él, formatos de fecha, dinero e IDs, formato de error. Ver [patterns.md § Convenciones](references/patterns.md#convenciones-del-cable).
3. **Servidor:** valida la entrada y serializa la salida con el esquema del contrato (`backend:http-layer`).
4. **Cliente:** tipos y cliente generados (o esquemas compartidos), parseo en la frontera cuando los datos vienen de fuera de tu control, mapeo de errores por campo al formulario (`frontend:forms`).
5. **Tests de contrato** que fallan si la implementación diverge de la especificación. Ver [patterns.md § Verificación](references/patterns.md#verificación-del-contrato).
6. **Cambios de contrato** compatibles por defecto; los incompatibles, con el orden de despliegue de [patterns.md § Evolución](references/patterns.md#evolución-y-orden-de-despliegue).
7. Entrega según [output-formats.md § Construir](../../standards/output-formats.md#modo-construir).

## Modo Auditar

1. **Mapea las rutas del backend:** método, ruta, request (body, query, params) y response (éxito y errores), desde el código, no desde la documentación.
2. **Mapea los consumidores del frontend:** qué endpoint llama cada uno, qué envía y qué campos lee de la respuesta y de los errores.
3. **Construye la tabla de cruce** de [patterns.md § Tabla de cruce](references/patterns.md#tabla-de-cruce) y marca cada fila en las cinco dimensiones.
4. Recorre [checklist.md](references/checklist.md).
5. **Veredicto por desajuste:** corregir el servidor, corregir el cliente o extraer el contrato a una fuente compartida; indica el orden de despliegue si hay clientes en circulación.
6. Clasifica con [severity.md](../../standards/severity.md) y entrega según [output-formats.md § Auditar](../../standards/output-formats.md#modo-auditar) con código `FS-CONTRACT`, citando **servidor y cliente** en cada hallazgo.

## Principios

1. **La verdad está en el cable:** se compara lo que se envía y recibe de verdad, no lo que dicen los tipos.
2. **Una sola fuente de verdad;** todo lo demás se genera o se deriva de ella.
3. **Los errores son contrato:** formato único, códigos estables y errores por campo que el cliente sabe mostrar.
4. **El servidor no confía en el cliente:** precios, permisos y totales se calculan y validan en el backend; el cliente solo los muestra.
5. **Tipos que no mienten:** IDs grandes y dinero como string o enteros en unidades mínimas; fechas en ISO 8601 con zona.
6. **Nunca romper a los clientes en circulación:** ampliar primero, retirar después.

## Handoffs

Según [handoffs.md](../../standards/handoffs.md): profundidad máxima de 2, alcance acotado, sin reinvocar skills ya aplicadas y registro de pendientes.

| Disparador (observable) | Skill | Alcance y contexto que se pasa |
| :--- | :--- | :--- |
| La UI oculta una acción y el endpoint no autoriza por objeto, función o tenant | `backend:authorization` | Endpoint, recurso y rol o tenant implicado |
| El servidor acepta del cliente precios, totales, descuentos o estados | `backend:domain-logic` | Endpoint, campo y regla que debe calcularse en el servidor |
| La respuesta incluye campos internos o sensibles que el cliente no usa | `backend:http-layer` | Endpoint y campos (DTO de salida) |
| El servidor devuelve errores por campo que el formulario no muestra | `frontend:forms` | Formulario, endpoint y formato de error |
| Estrategia de sesión incoherente (token en `localStorage`, cookies sin `HttpOnly`/`Secure`/`SameSite`, CORS reflejado) | `backend:authentication` · `frontend:security` | Configuración de sesión de ambas capas |
| Un cambio incompatible afecta a clientes en circulación | `backend:api-design` | Endpoint, cambio y clientes afectados (versionado y deprecación) |
| Tipos del cable duplicados a mano por todo el repositorio | `topology` | Ubicaciones de las copias |

## Referencias

| Archivo | Cuándo cargarlo |
| :--- | :--- |
| [patterns.md](references/patterns.md) | Siempre: dimensiones, tabla de cruce, fuente de verdad, convenciones, verificación y evolución. |
| [checklist.md](references/checklist.md) | Modo Auditar. |

## Skills relacionadas

- `backend:api-design`: convenciones de la API, RFC 9457, paginación, versionado.
- `backend:http-layer`: validación, DTOs de salida y error handler.
- `backend:authentication`: cookies, tokens y refresh en el servidor.
- `frontend:data-fetching`: cliente HTTP, caché y manejo de errores.
- `frontend:typescript`: tipos generados y parseo en la frontera.
- `frontend:forms`: errores por campo del servidor en el formulario.
- `flow-diagnosis`: cuando el síntoma es un flujo concreto que falla.
