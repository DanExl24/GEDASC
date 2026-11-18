# Data fetching — notas React / Next.js

## TanStack Query

```tsx
// features/orders/api/useOrders.ts
import { useQuery, queryOptions } from '@tanstack/react-query'

export const orderListOptions = (filters: OrderFilters) =>
  queryOptions({
    queryKey: orderKeys.list(filters),
    queryFn: ({ signal }) => ordersApi.list(filters, signal),
    staleTime: 30_000,
  })

export const useOrders = (filters: OrderFilters) => useQuery(orderListOptions(filters))
```

- `queryOptions()` mantiene tipadas la key y la función, y se reutiliza en `useQuery`, `prefetchQuery` y `ensureQueryData` (loaders).
- v5: `isPending` (antes `isLoading` para "sin datos aún"), `gcTime` (antes `cacheTime`), `placeholderData: keepPreviousData` (antes `keepPreviousData: true`).
- `useSuspenseQuery` si la app usa Suspense y Error Boundaries para los estados de carga y error.
- Un `QueryClient` creado **una vez** (fuera del componente o con `useState(() => new QueryClient())`), nunca en cada render.

## Por qué no `useEffect` para cargar datos

```tsx
// ❌ condición de carrera, sin caché, doble petición en StrictMode, sin cancelación
useEffect(() => {
  fetchOrders(filters).then(setOrders)
}, [filters])
```

Si no se puede usar una librería, como mínimo:

```tsx
useEffect(() => {
  const controller = new AbortController()
  ordersApi.list(filters, controller.signal)
    .then(setOrders)
    .catch((e) => { if (!(e instanceof AppError && e.code === 'CANCELLED')) setError(e) })
  return () => controller.abort()      // cancela al cambiar filtros o desmontar
}, [filters])
```

Ojo: si `filters` es un objeto creado en cada render, el efecto se dispara en cada render. Memoízalo o usa sus campos primitivos como dependencias.

## Alternativas

- **SWR**: más ligero; mismas ideas (key, revalidación, `mutate` para invalidar).
- **RTK Query**: si el proyecto ya usa Redux Toolkit; las tags (`providesTags`/`invalidatesTags`) cumplen el papel de las query keys.

## React 19

- `use(promise)` dentro de Suspense para consumir promesas creadas fuera del render (normalmente por el framework o un loader). No crees la promesa dentro del componente: se recrea en cada render.
- `useOptimistic` para optimistic UI en formularios con actions; con TanStack Query, usa su patrón `onMutate`.

## Next.js (App Router)

- **Server Components** cargan datos directamente en el servidor (`await` en el componente), sin cliente HTTP en el navegador. Es la opción por defecto para datos de lectura.
- La caché de `fetch` en Next ha cambiado entre versiones (Next 15 dejó de cachear por defecto). Declara siempre la intención: `fetch(url, { next: { revalidate: 60 } })` o `cache: 'no-store'`, y verifica el comportamiento en la versión del proyecto.
- Tras una mutación (Server Action): `revalidatePath()` o `revalidateTag()`.
- Para datos interactivos en cliente (filtros en vivo, polling, infinito), TanStack Query en componentes cliente, con hidratación desde el servidor (`HydrationBoundary` + `dehydrate`). Crea el `QueryClient` del servidor **por petición**.
- No llames a tus propios Route Handlers desde Server Components (`fetch('/api/...')`): llama directamente a la función de datos.
