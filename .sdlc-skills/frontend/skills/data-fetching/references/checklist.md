# Checklist de auditoría — data fetching

Severidad orientativa entre corchetes; ajústala según impacto real ([severity.md](../../../standards/severity.md)).

## 1. Cliente HTTP

- [ ] Existe un único cliente centralizado por API, sin `axios.create()`/`fetch` configurados en varios sitios. **[MEDIUM]**
- [ ] Base URL y timeouts vienen de configuración por entorno, no hardcodeados. **[LOW–MEDIUM]**
- [ ] Hay timeout configurado. **[MEDIUM]** si no: peticiones colgadas indefinidamente.
- [ ] Los errores se normalizan a un tipo único antes de llegar a la UI. **[MEDIUM]**
- [ ] El formato de error del backend (envelope, errores por campo) se interpreta en un solo sitio.

## 2. Ubicación de las llamadas

- [ ] Ningún componente o vista llama directamente a `axios`, `fetch` o `HttpClient`. **[MEDIUM]**
- [ ] Las funciones de API están agrupadas por feature, tipadas y sin lógica de UI.
- [ ] Las respuestas se validan o están tipadas desde una fuente fiable (→ skill `typescript`).

## 3. Autenticación

- [ ] El token se adjunta en un interceptor, no en cada llamada.
- [ ] El refresh token usa cola single-flight; N peticiones concurrentes con 401 provocan un solo refresh. **[HIGH]** si no: logouts aleatorios.
- [ ] El interceptor no entra en bucle si el propio refresh devuelve 401. **[HIGH]**
- [ ] Ante sesión expirada definitiva se limpia el estado y se redirige a login una sola vez.
- [ ] 401 (no autenticado) y 403 (sin permiso) se tratan distinto. **[LOW–MEDIUM]**
- [ ] Los tokens no se guardan en `localStorage`/`sessionStorage`. **[HIGH]** si el access token es de larga duración; **[MEDIUM]** si es corto. Nunca en la URL ni en logs. **[CRITICAL]** si hay secretos de servidor (API keys privadas) en el bundle.

## 4. Ciclo de vida y concurrencia

- [ ] Las peticiones se cancelan al desmontar o al navegar (AbortController, `signal` de la librería, `takeUntilDestroyed`). **[MEDIUM]**
- [ ] Respuestas obsoletas no pisan a las recientes en búsquedas, filtros y autocompletados. **[HIGH]** si se muestran datos de otro filtro.
- [ ] No hay peticiones duplicadas para el mismo recurso en la misma pantalla (dedupe). **[LOW–MEDIUM]**
- [ ] Peticiones independientes se lanzan en paralelo, no en cascada. **[LOW–MEDIUM]**

## 5. Server state y caché

- [ ] Se usa una librería de server state o, si no, hay un mecanismo coherente de caché/invalidación. **[MEDIUM]** si se reimplementa a mano con stores y efectos.
- [ ] Los datos del servidor no se duplican manualmente en stores globales. **[MEDIUM]**
- [ ] Las query keys incluyen todas las variables que afectan al resultado. **[HIGH]** si faltan y se muestran datos equivocados.
- [ ] `staleTime` definido de forma consciente para cada tipo de dato. **[LOW]**
- [ ] Tras cada mutación se invalida o actualiza la caché afectada. **[MEDIUM]**; **[HIGH]** si el usuario ve datos viejos tras guardar en un flujo principal.
- [ ] Los optimistic updates tienen rollback en caso de error. **[MEDIUM]**
- [ ] En SSR, la caché/cliente se crea por petición, no como singleton de módulo. **[CRITICAL]** si puede mezclar datos de usuarios.

## 6. Reintentos y resiliencia

- [ ] No se reintentan errores 4xx. **[LOW–MEDIUM]**
- [ ] No se reintentan automáticamente mutaciones no idempotentes. **[HIGH]** si pueden duplicar operaciones.
- [ ] Hay estado de UI para carga, vacío, error (con reintento) y éxito en cada consulta. **[MEDIUM]**
- [ ] Los errores no se tragan en `catch` vacíos o solo con `console.log`. **[MEDIUM]**

## 7. Tiempo real

- [ ] Una conexión gestionada centralmente, no una por componente. **[MEDIUM]**
- [ ] Reconexión con backoff y re-sincronización tras reconectar. **[MEDIUM]**
- [ ] Las suscripciones se cierran al desmontar y al cerrar sesión. **[MEDIUM]** (fuga de memoria y eventos duplicados).

## Cómo inspeccionar rápido

- Llamadas directas: buscar `axios.`, `fetch(`, `this.http.`, `$fetch(` dentro de `components/`, `views/`, `pages/`.
- Clientes dispersos: buscar `axios.create(`.
- Interceptores: buscar `interceptors.request.use`, `interceptors.response.use`, `HttpInterceptorFn`.
- Tokens: buscar `localStorage.setItem(` con `token`, `Authorization`.
- Carga manual: `useEffect` u `onMounted` que contengan `await` + asignación de estado.
- Cancelación: buscar `AbortController`, `signal`, `takeUntilDestroyed`; su ausencia junto a búsquedas/autocompletados es sospechosa.
