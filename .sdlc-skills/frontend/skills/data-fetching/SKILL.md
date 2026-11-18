---
name: data-fetching
description: Diseña, implementa y audita la capa de datos del frontend (Vue, React, Angular). Cubre cliente HTTP centralizado, interceptores, refresh token con cola, normalización de errores, timeouts, cancelación con AbortController, reintentos, server state con TanStack Query/SWR/RTK Query (caché, invalidación, optimistic updates, paginación), condiciones de carrera y tiempo real (WebSocket/SSE). Úsala al montar o revisar cómo la app consume APIs, o ante datos obsoletos, peticiones duplicadas, logouts inesperados o respuestas fuera de orden. No la uses para estado puramente de cliente (state-management) ni para validar formularios (forms).
---

# Data fetching y server state

Todo lo que pasa entre "el componente necesita datos" y "el backend responde": cómo se piden, se cachean, se invalidan, se cancelan y cómo fallan.

## Cuándo usarla

- Montar el cliente HTTP de un proyecto o la capa `api/` de una feature.
- Introducir o revisar TanStack Query, SWR, RTK Query, `useFetch` de Nuxt o `httpResource` de Angular.
- Síntomas: datos obsoletos tras guardar, peticiones duplicadas, logout inesperado al caducar el token, spinners infinitos, resultados de una búsqueda anterior que pisan a la actual, peticiones que siguen vivas al cambiar de página.
- Integrar WebSockets o Server-Sent Events.

**No es para:** estado de UI o de cliente → `state-management` · schemas y envío de formularios → `forms` (esta skill cubre la mutación HTTP que el formulario dispara) · tipos de los contratos → `typescript` · dónde almacenar tokens de forma segura, CSRF y logout completo → `security`.

## Paso 0: contexto (ambos modos)

1. Detecta en `package.json`: cliente (axios, ky, ofetch, fetch nativo, HttpClient), librería de server state (TanStack Query, SWR, RTK Query, Apollo, urql) y meta-framework (Next, Nuxt, Remix).
2. Carga [vue.md](references/vue.md), [react.md](references/react.md) o [angular.md](references/angular.md).
3. Localiza dónde se crea el cliente, los interceptores y dónde se hacen las llamadas (¿en componentes, en servicios, en stores?).
4. Averigua cómo autentica el backend (cookie httpOnly, Bearer + refresh token) y el formato de sus errores.

## Modo Construir

1. **Un único cliente HTTP** en `shared/api/` con base URL desde configuración, timeout, cabeceras comunes e interceptores. Ver [patterns.md § Cliente HTTP](references/patterns.md#cliente-http-base).
2. **Normaliza los errores** a un único tipo (`AppError`) en el interceptor de respuesta; la UI no debe conocer la forma de los errores de axios ni del backend.
3. **Autenticación:** si hay refresh token, implementa la **cola single-flight** (un solo refresh simultáneo, reintento de las peticiones en espera). Ver [patterns.md § Refresh token](references/patterns.md#refresh-token-single-flight).
4. **Funciones de API por feature** (`features/orders/api/`): tipadas, sin lógica de UI, aceptan `signal` para cancelación.
5. **Server state con una librería** (TanStack Query recomendado si no hay otra ya instalada): query keys organizadas, `staleTime` explícito, invalidación tras mutaciones. No reinventes la caché con stores + `useEffect`/`onMounted`.
6. **Estados de UI completos** para cada consulta: carga, vacío, error con reintento y éxito.
7. Tiempo real, paginación u optimistic updates según [patterns.md](references/patterns.md).
8. Entrega según [output-formats.md § Construir](../../standards/output-formats.md#modo-construir).

## Modo Auditar

1. Mapea el flujo: cliente → interceptores → funciones API → consumo (componentes, stores, queries).
2. Busca llamadas directas (`axios.`, `fetch(`, `this.http.`) en componentes y vistas.
3. Revisa el ciclo de vida de las peticiones: cancelación al desmontar, condiciones de carrera, dedupe.
4. Revisa la autenticación: refresh, manejo de 401/403, qué pasa con N peticiones concurrentes cuando caduca el token.
5. Recorre [checklist.md](references/checklist.md).
6. Clasifica con [severity.md](../../standards/severity.md) y entrega según [output-formats.md § Auditar](../../standards/output-formats.md#modo-auditar) con código `FE-DATA`.

## Principios

1. **El server state no es client state.** Los datos del backend son una caché de algo que vive en otro sitio: tienen frescura, se invalidan y se re-sincronizan. Trátalos con una herramienta de server state, no con un store global.
2. **Un cliente, una forma de error.** Toda petición pasa por el mismo cliente; todo error sale como `AppError`.
3. **Los componentes no hacen HTTP.** Llaman a funciones de API o a hooks/composables/servicios de query.
4. **Toda petición se puede cancelar** y ninguna respuesta obsoleta puede pisar a una más reciente.
5. **Solo se reintenta lo que es seguro reintentar:** errores de red y 5xx en operaciones idempotentes. Nunca un 4xx, nunca un POST no idempotente sin clave de idempotencia.
6. **Después de una mutación, la caché se invalida o se actualiza.** El usuario nunca debe ver datos viejos justo después de guardar.
7. **Los datos externos se validan en la frontera** (ver skill `typescript`).

## Referencias

| Archivo | Cuándo cargarlo |
| :--- | :--- |
| [patterns.md](references/patterns.md) | Modo Construir; en Auditar para escribir las correcciones. |
| [checklist.md](references/checklist.md) | Modo Auditar. |
| [vue.md](references/vue.md) · [react.md](references/react.md) · [angular.md](references/angular.md) | Según el stack. |

## Skills relacionadas

- `state-management`: qué estado queda en stores una vez que el server state sale de ellos.
- `forms`: envío, doble submit y mapeo de errores 422 a campos.
- `typescript`: tipos generados desde OpenAPI y validación de respuestas.
- `architecture`: ubicación de `shared/api` y `features/*/api`.
- `security`: almacenamiento de tokens, CSRF, logout y datos sensibles en peticiones.
- `routing`: carga de datos por ruta (loaders, resolvers, prefetch al navegar).
- `testing`: simular la red con MSW para probar interceptores, errores y estados.
- `observability`: qué errores de red reportar como incidentes y correlación con trazas del backend.
