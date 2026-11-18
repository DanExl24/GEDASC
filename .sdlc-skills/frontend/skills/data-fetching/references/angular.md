# Data fetching — notas Angular

## Configuración y cliente

```ts
// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withFetch(), withInterceptors([authInterceptor, errorInterceptor])),
  ],
}
```

- Interceptores funcionales (`HttpInterceptorFn`) en lugar de clases en código nuevo.
- `HttpClient` ya es el cliente centralizado: el antipatrón en Angular no es `axios.create()` disperso, sino URLs y manejo de errores repetidos en cada servicio.
- Base URL mediante `InjectionToken` o un interceptor que antepone el prefijo.

## Refresh token single-flight con RxJS

```ts
let refresh$: Observable<void> | null = null

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService)
  return next(withToken(req, auth.token())).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status !== 401 || req.url.includes('/auth/refresh')) return throwError(() => err)
      refresh$ ??= auth.refresh().pipe(
        finalize(() => (refresh$ = null)),
        shareReplay({ bufferSize: 1, refCount: false }),   // todas las peticiones comparten el mismo refresh
      )
      return refresh$.pipe(
        switchMap(() => next(withToken(req, auth.token()))),
        catchError((e) => { auth.expireSession(); return throwError(() => e) }),
      )
    }),
  )
}
```

## Cancelación y condiciones de carrera

- **`switchMap`** cancela la petición anterior al llegar un valor nuevo: es la herramienta estándar para búsquedas y filtros.
  ```ts
  results$ = this.term$.pipe(debounceTime(300), distinctUntilChanged(), switchMap((t) => this.api.search(t)))
  ```
- No uses `mergeMap` para búsquedas (las respuestas pueden llegar fuera de orden).
- `exhaustMap` para acciones que no deben solaparse (botón de guardar mientras hay un guardado en curso).
- Suscripciones manuales: `takeUntilDestroyed()` (o `DestroyRef`) para que se cierren con el componente. Mejor aún, `async` pipe o `toSignal()`, que se desuscriben solos.

## Signals y recursos

- `toSignal(observable$)` para consumir un observable en plantillas basadas en signals.
- `resource()` / `rxResource()` / `httpResource()` (APIs recientes; comprueba en la versión del proyecto si siguen marcadas como experimentales) cargan datos reactivamente a partir de signals y cancelan la petición anterior al cambiar los parámetros.
- **TanStack Query para Angular** (`@tanstack/angular-query-experimental`) aporta caché e invalidación al estilo de los otros frameworks.

## Server state

- Antipatrón: servicio con `BehaviorSubject<Order[]>` + método `load()` llamado en cada `ngOnInit`. Es una caché manual. Si la app tiene muchas pantallas con datos del servidor, valora TanStack Query o NgRx con un patrón de caché explícito (por ejemplo, entity adapter + timestamps).
- Tras una mutación, recarga o actualiza el estado local en el mismo servicio; no dejes que cada componente lo haga por su cuenta.

## SSR (Angular SSR)

- `withHttpTransferCacheOptions` / transfer cache evita repetir en el cliente las peticiones ya hechas en el servidor.
- Servicios con estado en `providedIn: 'root'` son por petición en SSR moderno, pero cualquier variable de módulo (fuera de la clase) se comparte entre peticiones: no guardes datos de usuario ahí.
