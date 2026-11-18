# Data fetching — notas Vue / Nuxt

## TanStack Query (Vue Query)

```ts
// features/orders/api/useOrders.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { computed, type MaybeRefOrGetter, toValue } from 'vue'

export function useOrders(filters: MaybeRefOrGetter<OrderFilters>) {
  return useQuery({
    queryKey: computed(() => orderKeys.list(toValue(filters))),   // reactivo: cambia la key → nueva consulta
    queryFn: ({ signal }) => ordersApi.list(toValue(filters), signal),
    staleTime: 30_000,
  })
}
```

- Pasa refs o getters, no valores sueltos: si pasas `filters.value`, la query no reaccionará a los cambios.
- En la plantilla: `isPending`, `isError`, `data`, `error`, `refetch`.
- Instala el plugin una vez: `app.use(VueQueryPlugin, { queryClient })`.

## Sin librería: composable con cancelación

```ts
export function useCancelableRequest() {
  let controller: AbortController | null = null

  const run = async <T>(fn: (signal: AbortSignal) => Promise<T>) => {
    controller?.abort()
    controller = new AbortController()
    return fn(controller.signal)
  }

  onScopeDispose(() => controller?.abort())   // se cancela al desmontar el componente o el scope
  return { run }
}
```

- `onScopeDispose` funciona tanto en componentes como en `effectScope` (stores, composables compartidos).
- Para búsquedas con `watch`, usa el tercer argumento `onCleanup` (o `onWatcherCleanup` en Vue 3.5+) para abortar la petición anterior:
  ```ts
  watch(term, async (t, _old, onCleanup) => {
    const c = new AbortController()
    onCleanup(() => c.abort())
    results.value = await api.search(t, c.signal)
  })
  ```

## Pinia y server state

- Antipatrón frecuente: store de Pinia con `items`, `loading`, `error` y una action `fetchItems()` llamada en cada `onMounted`. Es una caché manual sin invalidación ni dedupe. Migra a Vue Query y deja en Pinia solo el estado de cliente.
- Si no se puede introducir Vue Query, considera **Pinia Colada** (capa de data fetching sobre Pinia, del equipo de Pinia) antes que reimplementar.

## Nuxt

- `useFetch` / `useAsyncData` resuelven SSR + hidratación sin doble petición. Usa siempre una **key** explícita y estable en `useAsyncData`.
- `$fetch` (ofetch) para mutaciones y en event handlers; **no** lo uses en el setup de un componente para cargar datos (se ejecutaría en servidor y otra vez en cliente).
- `refreshNuxtData(key)` o `refresh()` tras una mutación para invalidar.
- Interceptores globales: crea una instancia con `$fetch.create({ baseURL, onRequest, onResponseError })` en un plugin y expónla con `provide`.
- Con Vue Query en Nuxt, usa `onServerPrefetch` o `suspense()` para SSR y un `QueryClient` por petición (el módulo oficial lo gestiona).
