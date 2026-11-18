# Enrutado — notas Angular Router

## Configuración

```ts
// app.config.ts
provideRouter(
  routes,
  withComponentInputBinding(),                                  // params y query como input() del componente
  withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' }),
  withPreloading(PreloadAllModules),                            // o una estrategia propia por ruta
  withRouterConfig({ paramsInheritanceStrategy: 'always' }),
)
```

```ts
// app.routes.ts
export const routes: Routes = [
  { path: 'login', title: 'Iniciar sesión', loadComponent: () => import('./features/auth/login.page') },
  {
    path: 'app',
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    loadComponent: () => import('./core/layout/private-layout.component'),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'pedidos' },
      { path: 'pedidos', loadChildren: () => import('./features/orders/orders.routes') },
      { path: 'admin', canMatch: [roleGuard('admin')], loadChildren: () => import('./features/admin/admin.routes') },
    ],
  },
  { path: '403', title: 'Sin acceso', loadComponent: () => import('./core/pages/forbidden.page') },
  { path: '**', title: 'Página no encontrada', loadComponent: () => import('./core/pages/not-found.page') },
]
```

- `title` en cada ruta actualiza `document.title` (o una `TitleStrategy` propia con sufijo).
- `canMatch` impide incluso descargar el código de rutas a las que el usuario no tiene acceso.

## Guards funcionales

```ts
export const authGuard: CanActivateFn = async (_route, state) => {
  const auth = inject(AuthService)
  const router = inject(Router)
  await auth.ready()                                            // sesión restaurada
  return auth.isAuthenticated()
    ? true
    : router.createUrlTree(['/login'], { queryParams: { redirect: state.url } })
}

export const roleGuard = (role: Role): CanMatchFn => () => {
  const auth = inject(AuthService)
  return auth.hasRole(role) || inject(Router).createUrlTree(['/403'])
}
```

- Devuelve un `UrlTree` para redirigir (no navegues dentro del guard).
- En el login, valida `redirect` antes de `router.navigateByUrl()` (solo rutas internas).

## Datos por ruta

- Resolvers funcionales (`ResolveFn`) para datos imprescindibles antes de mostrar la vista; para el resto, carga en el componente con un estado de carga (los resolvers bloquean la navegación).
- Con `withComponentInputBinding()`, el resultado del resolver, los params y los query params llegan como `input()`.

## Estado en la URL

```ts
export class OrdersPage {
  private router = inject(Router)
  private route = inject(ActivatedRoute)
  filters = toSignal(this.route.queryParamMap.pipe(map((p) => OrderFiltersSchema.parse(Object.fromEntries(p.keys.map((k) => [k, p.get(k)]))))))

  setFilters(patch: Partial<OrderFilters>, replaceUrl = false) {
    this.router.navigate([], { relativeTo: this.route, queryParams: { ...patch, page: patch.page ?? null }, queryParamsHandling: 'merge', replaceUrl })
  }
}
```

(`null` elimina el parámetro de la URL.)

## Otros

- Cambios sin guardar: `CanDeactivateFn` (→ `forms`).
- `routerLinkActive` con `ariaCurrentWhenActive="page"`.
- Foco tras navegar: escuchar `NavigationEnd` y enfocar el `h1` con `afterNextRender` (→ `accessibility`).
- Errores de carga de chunks: `withNavigationErrorHandler()` (o un `ErrorHandler`) que recargue la página una vez ante errores de importación dinámica.
