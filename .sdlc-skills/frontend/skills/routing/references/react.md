# Enrutado — notas React Router / TanStack Router / Next.js

## React Router (modo data)

```tsx
const router = createBrowserRouter([
  { path: '/login', lazy: () => import('@/features/auth/routes/login') },
  {
    path: '/app',
    loader: requireAuthLoader,                 // se ejecuta antes de renderizar
    lazy: () => import('@/app/layouts/private'),
    errorElement: <RouteError />,
    children: [
      { index: true, loader: () => redirect('/app/pedidos') },
      { path: 'pedidos', lazy: () => import('@/features/orders/routes/list') },
      { path: 'pedidos/:id', lazy: () => import('@/features/orders/routes/detail') },
    ],
  },
  { path: '*', lazy: () => import('@/app/routes/not-found') },
])

async function requireAuthLoader({ request }: LoaderFunctionArgs) {
  const session = await auth.ensureSession()
  if (!session) {
    const url = new URL(request.url)
    throw redirect(`/login?redirect=${encodeURIComponent(url.pathname + url.search)}`)
  }
  return null
}
```

- Los loaders cargan datos al navegar (sin cascada); combínalos con TanStack Query (`queryClient.ensureQueryData`) para tener caché.
- `errorElement` por ruta; `useRouteError()` para mostrar el error y distinguir 404 de otros.
- Estado en la URL: `useSearchParams()`, parseando con un schema; `setSearchParams(next, { replace: true })` para búsquedas en vivo.
- Cambios sin guardar: `useBlocker(isDirty && !isSubmitting)`.
- Scroll: `<ScrollRestoration />` en el layout raíz.
- `NavLink` aplica `aria-current="page"` automáticamente al enlace activo.

## TanStack Router

- Rutas y **search params tipados y validados** (`validateSearch` con un schema): la mejor opción si el estado en la URL es central en la app.
- `beforeLoad` para guards (redirigir con `throw redirect(...)`) y `loader` para datos.
- Rutas basadas en archivos con generación de tipos.

## Next.js App Router

- Rutas por carpetas en `app/`; layouts anidados con `layout.tsx`; `loading.tsx`, `error.tsx`, `not-found.tsx` por segmento.
- Protección: comprobar la sesión en el layout o la página (Server Component) y `redirect('/login?redirect=…')`; `middleware.ts` para comprobaciones baratas (presencia de cookie), **no** como única barrera de autorización: verifica también en cada acción y en el acceso a datos.
- Estado en la URL: `searchParams` en la página (Server Component) o `useSearchParams()` + `router.replace()` en cliente; `nuqs` simplifica el estado tipado en query params.
- `<Link prefetch>`: Next hace prefetch automático de los enlaces visibles en producción.
- Modales con URL: rutas paralelas (`@modal`) e interceptadas (`(.)foto/[id]`).
- No hay bloqueador de navegación nativo estable para cambios sin guardar: intercepta los enlaces del formulario y usa `beforeunload`.
