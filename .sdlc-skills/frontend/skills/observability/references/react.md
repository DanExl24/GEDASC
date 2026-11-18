# Observabilidad — notas React / Next.js

## Error boundaries

```tsx
import { ErrorBoundary } from 'react-error-boundary'

<ErrorBoundary
  FallbackComponent={({ resetErrorBoundary }) => (
    <div role="alert">
      <p>No se pudo cargar esta sección.</p>
      <button type="button" onClick={resetErrorBoundary}>Reintentar</button>
    </div>
  )}
  onError={(error) => reportIfUnexpected(error)}
  onReset={() => queryClient.resetQueries({ queryKey: orderKeys.all })}
>
  <OrdersPanel />
</ErrorBoundary>
```

- Las boundaries **no capturan** errores en handlers de eventos, código asíncrono fuera del render ni en el propio servidor: esos van con `try/catch` y `reportIfUnexpected`.
- Con TanStack Query, `throwOnError` (o `useSuspenseQuery`) lleva los errores de datos a la boundary; `QueryErrorResetBoundary` para reintentar.
- React 19: `createRoot(el, { onUncaughtError, onCaughtError, onRecoverableError })` para reportar errores a nivel raíz.

## React Router

`errorElement` / `ErrorBoundary` por ruta; `useRouteError()` para distinguir 404 de errores reales.

## Sentry

`@sentry/react` con `Sentry.ErrorBoundary` o `reactErrorHandler()` para los callbacks de `createRoot`; integración de tracing con React Router. `@sentry/vite-plugin` para source maps.

## Next.js

- `error.tsx` por segmento (componente cliente con `reset()`), `global-error.tsx` para errores del layout raíz, `not-found.tsx`.
- `@sentry/nextjs` instrumenta cliente, servidor y edge (archivos `instrumentation.ts` e `instrumentation-client.ts`); sube source maps en el build.
- Los errores de Server Components llegan al cliente sin el mensaje original en producción (solo un `digest`): regístralos en el servidor.

## Chunks tras un despliegue

`lazy()` lanza al fallar el import: envuélvelo para recargar una vez ante errores de carga de módulos, o captúralo en la boundary de la ruta. En Vite, escucha `vite:preloadError`.
