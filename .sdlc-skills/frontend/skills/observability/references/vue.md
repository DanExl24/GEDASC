# Observabilidad — notas Vue / Nuxt

## Handler global

```ts
app.config.errorHandler = (err, instance, info) => {
  reportIfUnexpected(err)                     // Sentry lo hace automáticamente si se integra con la app
  // info: 'render function', 'setup function', 'watcher callback'…
}
app.config.warnHandler = import.meta.env.DEV ? undefined : () => {}   // los warnings no van a producción
```

`app.config.errorHandler` captura errores de render, setup, watchers y hooks de ciclo de vida, pero no los de callbacks fuera de Vue (`setTimeout`, listeners nativos).

## Boundaries por sección

```vue
<!-- shared/ui/ErrorBoundary.vue -->
<script setup lang="ts">
const error = ref<unknown>(null)
onErrorCaptured((err) => {
  error.value = err
  reportIfUnexpected(err)
  return false                                // no propagar: esta boundary lo gestiona
})
const retry = () => { error.value = null }
</script>

<template>
  <slot v-if="!error" />
  <div v-else role="alert">
    <p>No se pudo cargar esta sección.</p>
    <button type="button" @click="retry">Reintentar</button>
  </div>
</template>
```

Envuelve cada vista o widget independiente; la clave en el slot (`:key`) permite re-montar al reintentar.

## Sentry

`@sentry/vue`: `Sentry.init({ app, integrations: [Sentry.browserTracingIntegration({ router })], … })`; nombra las transacciones por ruta. `@sentry/vite-plugin` para subir source maps con `sourcemap: 'hidden'` en Vite.

## Chunks tras un despliegue

```ts
router.onError((error, to) => {
  const isChunkError = /Failed to fetch dynamically imported module|Importing a module script failed/.test(String(error?.message))
  if (isChunkError && !sessionStorage.getItem('chunk-reload')) {
    sessionStorage.setItem('chunk-reload', '1')
    window.location.assign(to.fullPath)
  }
})
```

Vite emite además el evento `vite:preloadError` en `window` para fallos de precarga.

## Nuxt

- `@sentry/nuxt` cubre cliente y servidor (Nitro).
- `error.vue` para errores fatales; `<NuxtErrorBoundary>` para secciones; `showError`/`clearError`.
- Hook `app:chunkError` y la opción `experimental.emitRouteChunkError` para recargar ante chunks perdidos.
