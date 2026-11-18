# Observabilidad — notas Angular

## ErrorHandler global

```ts
@Injectable()
export class AppErrorHandler implements ErrorHandler {
  handleError(error: unknown) {
    reportIfUnexpected(error)
    if (isDevMode()) console.error(error)
  }
}

// app.config.ts
providers: [
  { provide: ErrorHandler, useClass: AppErrorHandler },
  provideBrowserGlobalErrorListeners(),       // versiones recientes: captura error y unhandledrejection globales
]
```

Con Sentry: `Sentry.createErrorHandler()` como `ErrorHandler` y `Sentry.TraceService` para trazas de navegación (`@sentry/angular`).

## Errores por sección

Angular no tiene error boundaries de plantilla. Opciones:
- Gestionar el estado de error en el componente o servicio que carga los datos (patrón `status: 'error'` + reintento).
- `@defer` con bloque `@error` para fallos de carga de componentes diferidos.
- Resolvers que redirigen a una página de error ante fallos críticos.

## HTTP

Un interceptor puede registrar `SERVER`/errores inesperados de forma centralizada; los esperados (`VALIDATION`, `FORBIDDEN`) los maneja la UI (→ `data-fetching`).

## Chunks tras un despliegue

`withNavigationErrorHandler()` en `provideRouter` para detectar errores de carga de rutas lazy y recargar una vez. El service worker de Angular (`SwUpdate.versionUpdates`, `unrecoverable`) permite avisar de nuevas versiones si se usa PWA.

## Source maps

`"sourceMap": { "scripts": true, "hidden": true }` en la configuración de producción de `angular.json` genera mapas sin referencia en los bundles; súbelos a la herramienta y no los publiques.
