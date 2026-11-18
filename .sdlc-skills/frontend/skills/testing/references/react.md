# Testing — notas React / Next.js

## Herramientas

- **Vitest** (o Jest) + **@testing-library/react** + `@testing-library/user-event` + `@testing-library/jest-dom`.
- Entorno `jsdom`/`happy-dom` o **Vitest browser mode** para componentes que dependen de layout o APIs reales del navegador.

## Render con proveedores

```tsx
// test/render.tsx
export function renderWithProviders(ui: React.ReactElement, { route = '/' } = {}) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  const user = userEvent.setup()
  const result = render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </QueryClientProvider>,
  )
  return { user, queryClient, ...result }
}
```

- Un `QueryClient` nuevo en cada test.
- Para probar rutas con loaders (React Router modo data): `createMemoryRouter(routes, { initialEntries: [route] })` + `<RouterProvider>`.

## Hooks

```ts
const { result } = renderHook(() => useOrderFilters(), { wrapper: Providers })
act(() => result.current.setStatus('paid'))
expect(result.current.filters.status).toBe('paid')
```

Prefiere probar hooks a través del componente que los usa, salvo hooks reutilizables con lógica propia.

## Stores

- Zustand: recrea el store por test (exporta una factoría `createCartStore()` o resetea con `useCartStore.setState(initialState, true)` en `beforeEach`).
- Redux Toolkit: crea el store con `configureStore` por test (función `setupStore(preloadedState)`).

## Next.js

- Componentes cliente: se prueban como cualquier componente React; mockea `next/navigation` (`useRouter`, `useSearchParams`) o envuélvelos en un proveedor de prueba.
- **Server Components asíncronos**: el soporte en Testing Library/Vitest es limitado; extrae la lógica de datos a funciones probables con tests unitarios y cubre la página con tests E2E (Playwright).
- Server Actions: pruébalas como funciones (validación y autorización), con la capa de datos simulada.

## Detalles

- `act()` explícito rara vez hace falta con Testing Library y `user-event`; si aparece el aviso de `act`, normalmente falta esperar algo (`findBy…`).
- StrictMode en tests ayuda a detectar efectos sin cleanup (se montan dos veces).
- Portales (modales): `screen` busca en todo el documento.
