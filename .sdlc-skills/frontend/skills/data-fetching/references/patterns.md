# Patrones de data fetching

Los ejemplos usan axios y TanStack Query por ser los más extendidos; los principios aplican igual con `fetch`/ky/ofetch, SWR o RTK Query. Ver las referencias de stack para Vue, React y Angular.

## Cliente HTTP base

```ts
// shared/api/http.ts
import axios, { AxiosError } from 'axios'
import { AppError } from './errors'
import { env } from '@/shared/config/env'

export const http = axios.create({
  baseURL: env.API_URL,
  timeout: 15_000,
  withCredentials: true,          // solo si la sesión va por cookie
  headers: { Accept: 'application/json' },
})

http.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => Promise.reject(toAppError(error)),
)

// Forma del error que devuelve el backend: ajústala al contrato real
type ApiErrorBody = { error?: { message?: string; fields?: Record<string, string[]> } }

function toAppError(error: AxiosError<ApiErrorBody>): AppError {
  if (axios.isCancel(error)) return new AppError('CANCELLED', 'Petición cancelada')
  if (!error.response) return new AppError('NETWORK', 'Sin conexión con el servidor')

  const { status, data } = error.response
  const message = data?.error?.message ?? 'Error inesperado'

  switch (status) {
    case 401: return new AppError('UNAUTHORIZED', message, status)
    case 403: return new AppError('FORBIDDEN', message, status)
    case 404: return new AppError('NOT_FOUND', message, status)
    case 409: return new AppError('CONFLICT', message, status)
    case 422:
    case 400: return new AppError('VALIDATION', message, status, data?.error?.fields)
    default:  return new AppError(status >= 500 ? 'SERVER' : 'UNKNOWN', message, status)
  }
}
```

- Adapta `toAppError` al formato real de errores del backend (léelo antes de escribirlo).
- `AppError` está definido en la skill `typescript` (patterns § Errores tipados).
- Una sola instancia. Si hacen falta clientes distintos (otra API), uno por API, cada uno en su módulo; nunca `axios.create()` disperso por componentes.

## Funciones de API por feature

```ts
// features/orders/api/orders.api.ts
import { http } from '@/shared/api/http'
import { OrderSchema, OrderListSchema, type Order, type OrderFilters } from '../model/order'

export const ordersApi = {
  list: async (filters: OrderFilters, signal?: AbortSignal) => {
    const { data } = await http.get('/orders', { params: filters, signal })
    return OrderListSchema.parse(data)
  },
  get: async (id: string, signal?: AbortSignal) => {
    const { data } = await http.get(`/orders/${id}`, { signal })
    return OrderSchema.parse(data)
  },
  create: async (input: CreateOrderInput) => {
    const { data } = await http.post('/orders', input)
    return OrderSchema.parse(data)
  },
}
```

- Sin estado, sin UI, sin toasts. Solo HTTP + parseo.
- Aceptan `signal` para que la capa de query pueda cancelar.

## Refresh token (single-flight)

Problema: el access token caduca, 5 peticiones reciben 401 a la vez y se lanzan 5 refresh; el backend invalida el refresh token en el segundo uso (rotación) y el usuario queda deslogueado.

```ts
// shared/api/auth-refresh.ts
let refreshPromise: Promise<void> | null = null

http.interceptors.response.use(undefined, async (error) => {
  const original = error.config
  const status = error.response?.status
  const isRefreshCall = original?.url?.includes('/auth/refresh')

  if (status !== 401 || original?._retried || isRefreshCall) {
    return Promise.reject(error)
  }
  original._retried = true

  try {
    refreshPromise ??= refreshSession().finally(() => { refreshPromise = null })
    await refreshPromise            // todas las peticiones esperan al MISMO refresh
    return http(original)           // reintento con el token nuevo
  } catch (refreshError) {
    onSessionExpired()              // limpiar sesión y redirigir a login, una sola vez
    return Promise.reject(error)
  }
})
```

- Registra este interceptor **antes** que el de normalización de errores (o trabaja sobre el error crudo), para poder leer el `status` y la `config` originales.
- `refreshSession()` actualiza el token donde viva (memoria o cookie). Si la sesión va por cookie httpOnly, el reintento ya lleva la cookie nueva.
- `onSessionExpired()` debe ser idempotente (no redirigir 5 veces).
- Con `fetch` el patrón es el mismo, envolviendo `fetch` en una función `request()`.

## Tokens y sesión

Resumen (el detalle, incluidos CSRF y logout, está en la skill `security`):
- **Preferible:** sesión en cookie `httpOnly; Secure; SameSite=Lax|Strict` emitida por el backend (el JS no puede leerla, así que un XSS no la roba). Requiere protección CSRF en el backend si `SameSite` no basta.
- **Si hay Bearer token:** access token **en memoria** (variable de módulo/store, no persistido) con vida corta; refresh token en cookie httpOnly. Evita `localStorage` para tokens: cualquier script inyectado puede leerlos.
- Nunca pongas tokens en la URL ni en logs.

## Server state con TanStack Query

### Query keys organizadas

```ts
// features/orders/api/orders.keys.ts
export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (filters: OrderFilters) => [...orderKeys.lists(), filters] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
}
```

Permite invalidar con precisión: `invalidateQueries({ queryKey: orderKeys.lists() })` refresca todas las listas sin tocar los detalles.

### Queries

```ts
export const orderListQuery = (filters: OrderFilters) => ({
  queryKey: orderKeys.list(filters),
  queryFn: ({ signal }: { signal: AbortSignal }) => ordersApi.list(filters, signal),  // cancelación automática
  staleTime: 30_000,
})
```

- **`staleTime`**: cuánto tiempo los datos se consideran frescos (por defecto 0 = siempre obsoletos → refetch al montar y al enfocar la ventana). Elige un valor por tipo de dato: catálogos que casi no cambian, minutos; saldos, 0–10 s.
- **`gcTime`** (antes `cacheTime`): cuánto se conservan en memoria sin usarse.
- La query key incluye **todo** lo que cambia el resultado (filtros, página, id). Si falta algo, se mostrarán datos de otra consulta.
- Las respuestas fuera de orden no son un problema: cada key tiene su propia entrada y la librería cancela o ignora las obsoletas.

### Mutaciones e invalidación

```ts
useMutation({
  mutationFn: ordersApi.create,
  onSuccess: (order) => {
    queryClient.setQueryData(orderKeys.detail(order.id), order)        // ya tenemos el dato
    return queryClient.invalidateQueries({ queryKey: orderKeys.lists() }) // las listas se recalculan
  },
})
```

### Optimistic update con rollback

```ts
useMutation({
  mutationFn: (vars: { id: string; status: OrderStatus }) => ordersApi.updateStatus(vars),
  onMutate: async ({ id, status }) => {
    await queryClient.cancelQueries({ queryKey: orderKeys.detail(id) })
    const previous = queryClient.getQueryData<Order>(orderKeys.detail(id))
    queryClient.setQueryData<Order>(orderKeys.detail(id), (old) => old && { ...old, status })
    return { previous }
  },
  onError: (_err, { id }, ctx) => {
    if (ctx?.previous) queryClient.setQueryData(orderKeys.detail(id), ctx.previous)
  },
  onSettled: (_d, _e, { id }) => queryClient.invalidateQueries({ queryKey: orderKeys.detail(id) }),
})
```

Úsalo para acciones frecuentes y con alta probabilidad de éxito (likes, toggles, reordenar). No para pagos ni operaciones donde mostrar un éxito falso es grave.

### Paginación e infinito

- Paginación clásica: incluye la página en la key y usa `placeholderData: keepPreviousData` para no parpadear entre páginas.
- Scroll infinito: `useInfiniteQuery` con `getNextPageParam`; preferible paginación por cursor en el backend.

### Prefetch y dependencias

- Prefetch al pasar el ratón sobre un enlace o en el loader de la ruta: `queryClient.prefetchQuery(orderDetailQuery(id))`.
- Query dependiente: `enabled: !!userId`.
- Peticiones independientes en paralelo, nunca en cascada (`await a; await b;` cuando b no depende de a es una cascada).

## Sin librería de server state

Si el proyecto no puede introducir una librería, como mínimo:

```ts
// cancelar la petición anterior y descartar respuestas obsoletas
let controller: AbortController | null = null

async function search(term: string) {
  controller?.abort()
  controller = new AbortController()
  try {
    const result = await api.search(term, controller.signal)
    results.value = result           // solo llega aquí la última
  } catch (e) {
    if (e instanceof AppError && e.code === 'CANCELLED') return
    error.value = e
  }
}
```

Y cancelar en el desmontaje del componente (ver referencias de stack).

## Reintentos

- TanStack Query reintenta 3 veces por defecto en queries. Configúralo para **no reintentar 4xx**:
  ```ts
  retry: (count, error) => error instanceof AppError && ['NETWORK', 'SERVER'].includes(error.code) && count < 3
  ```
- Mutaciones: sin reintento automático salvo que el endpoint sea idempotente o use una cabecera `Idempotency-Key`.
- Backoff exponencial con jitter para reintentos manuales.

## Tiempo real (WebSocket / SSE)

- Una sola conexión por app (o por canal), gestionada en un módulo, no en cada componente.
- **Reconexión** con backoff exponencial y límite; heartbeat/ping para detectar conexiones muertas.
- Al reconectar, **re-sincroniza**: invalida las queries afectadas, porque pudiste perder eventos.
- Integra los eventos en la caché del server state en lugar de mantener otro estado paralelo:
  ```ts
  socket.on('order.updated', (order) => queryClient.setQueryData(orderKeys.detail(order.id), order))
  ```
- Cierra suscripciones y conexiones al desmontar o al cerrar sesión.
- SSE (`EventSource`) es más simple si solo hace falta servidor → cliente.

## Anti-patrones

| Anti-patrón | Consecuencia | Corrección |
| :--- | :--- | :--- |
| `axios.get` en el componente | Lógica de red dispersa, imposible de testear y de cambiar | Funciones de API + query hook/composable/servicio |
| `useEffect`/`onMounted` + `setState` para cargar datos | Condiciones de carrera, sin caché, sin dedupe, doble petición en StrictMode | Librería de server state |
| Copiar la respuesta a un store global | Dos fuentes de verdad, datos obsoletos | La caché de la query es la fuente de verdad |
| Refresh token sin cola | Logouts aleatorios con peticiones concurrentes | Single-flight |
| Reintentar POST o 4xx | Duplicados en BD, carga inútil | Reintentar solo idempotentes y errores transitorios |
| Sin `staleTime` en datos estables | Refetch en cada montaje y foco de ventana | `staleTime` por tipo de dato |
| `catch` que solo hace `console.log` | Error invisible para el usuario | Estado de error en la UI con reintento |
| Query key incompleta | Datos de otro filtro/usuario mostrados | Incluir todas las dependencias en la key |
| Caché compartida entre peticiones en SSR | **Datos de un usuario mostrados a otro** | Un `QueryClient` por petición en servidor |
