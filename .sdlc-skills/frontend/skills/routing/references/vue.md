# Enrutado — notas Vue Router / Nuxt

## Definición y tipado

```ts
// app/router.ts
const routes: RouteRecordRaw[] = [
  { path: '/login', name: 'login', component: () => import('@/features/auth/pages/LoginPage.vue') },
  {
    path: '/app',
    component: () => import('@/app/layouts/PrivateLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: { name: 'orders' } },
      ...ordersRoutes,                                   // exportadas por la feature
      { path: 'admin', meta: { roles: ['admin'] }, children: adminRoutes },
    ],
  },
  { path: '/403', name: 'forbidden', component: () => import('@/app/pages/ForbiddenPage.vue') },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('@/app/pages/NotFoundPage.vue') },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: (to, _from, saved) => saved ?? (to.hash ? { el: to.hash, top: 80 } : { top: 0 }),
})
```

Tipado de `meta` con module augmentation:

```ts
declare module 'vue-router' {
  interface RouteMeta { requiresAuth?: boolean; roles?: Role[]; title?: string }
}
```

Rutas tipadas por nombre y params: `unplugin-vue-router` (rutas basadas en archivos con tipos generados) o la integración de tipos de Vue Router en versiones recientes.

## Guards

```ts
router.beforeEach(async (to) => {
  await auth.ready                                     // promesa de sesión restaurada
  const needsAuth = to.matched.some((r) => r.meta.requiresAuth)
  if (needsAuth && !auth.isAuthenticated) return { name: 'login', query: { redirect: to.fullPath } }
  const roles = to.matched.flatMap((r) => r.meta.roles ?? [])
  if (roles.length && !roles.some((r) => auth.hasRole(r))) return { name: 'forbidden' }
})
```

- Devuelve `true`/`undefined` (continuar), una ruta (redirigir) o `false` (cancelar); evita el antiguo `next()`.
- `meta` se hereda por `to.matched`: los hijos de `/app` quedan protegidos.
- Errores de carga de chunks: `router.onError((err, to) => { if (/Failed to fetch dynamically imported module|Importing a module script failed/.test(err.message)) window.location.assign(to.fullPath) })` (con un control para no entrar en bucle).

## Estado en la URL

```ts
const route = useRoute()
const router = useRouter()
const filters = computed(() => OrderFiltersSchema.parse(route.query))

function setFilters(patch: Partial<OrderFilters>, { replace = false } = {}) {
  const next = { ...filters.value, ...patch, page: patch.page ?? 1 }
  const query = omitDefaults(next, defaultFilters)
  return replace ? router.replace({ query }) : router.push({ query })
}
```

`useRouteQuery` de VueUse simplifica parámetros individuales con transformación.

## Cambios sin guardar y foco

- `onBeforeRouteLeave` en el componente del formulario (→ `forms`).
- `router.afterEach` para título y foco (→ `accessibility`).

## Nuxt

- Rutas por archivos en `pages/`; layouts en `layouts/`; metadatos con `definePageMeta({ middleware: 'auth', layout: 'private', roles: [...] })`.
- Middleware de ruta (`middleware/auth.ts`) con `defineNuxtRouteMiddleware` y `navigateTo('/login?redirect=…')`; corre en servidor y en cliente, así que la sesión debe poder leerse en ambos (cookie).
- `navigateTo(url, { external: true })` solo para destinos externos conocidos; nunca con un `redirect` sin validar.
- 404: `throw createError({ statusCode: 404 })` y `error.vue`.
