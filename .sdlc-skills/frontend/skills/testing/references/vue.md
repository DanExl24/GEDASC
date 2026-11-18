# Testing — notas Vue / Nuxt

## Herramientas

- **Vitest** + **@testing-library/vue** (basada en `@vue/test-utils`) + `@testing-library/user-event` + `@testing-library/jest-dom`.
- Entorno `jsdom` o `happy-dom`, o **Vitest browser mode** (Playwright) para tests de componente en un navegador real.
- Nuxt: `@nuxt/test-utils` (`mountSuspended`, `mockNuxtImport`, `registerEndpoint`) para componentes que usan auto-imports y composables de Nuxt.

## Render con plugins

```ts
// test/render.ts
import { render } from '@testing-library/vue'
import { createTestingPinia } from '@pinia/testing'
import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query'
import { createRouter, createMemoryHistory } from 'vue-router'

export async function renderWithApp(component: Component, { route = '/', props = {}, initialState = {} } = {}) {
  const router = createRouter({ history: createMemoryHistory(), routes })
  router.push(route)
  await router.isReady()
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  return render(component, {
    props,
    global: {
      plugins: [
        router,
        [VueQueryPlugin, { queryClient }],
        createTestingPinia({ initialState, stubActions: false, createSpy: vi.fn }),   // acciones reales; cambia a true para aislar
      ],
    },
  })
}
```

- `createTestingPinia` con `stubActions: false` cuando quieres probar el comportamiento real del store en el componente; `true` para aislar el componente y comprobar que llama a la acción.
- Stores en tests unitarios: `setActivePinia(createPinia())` en `beforeEach`.

## Composables

- Composables sin dependencias de ciclo de vida: llámalos directamente dentro de un `effectScope()`.
- Con ciclo de vida o `inject`: monta un componente de prueba mínimo o usa un helper `withSetup()` que devuelva el resultado del composable.

## Detalles

- `@vue/test-utils` directamente (`mount`, `wrapper.find`) invita a probar implementación (`wrapper.vm`); prefiere las consultas de Testing Library.
- `<Teleport>`: los modales se renderizan en `body`; `screen` los encuentra (busca en todo el documento).
- `defineAsyncComponent` y `<Suspense>`: usa `findBy…` para esperar a que se resuelvan.
- Transiciones: desactívalas en tests (`global.stubs: { transition: false }` o stub de `Transition`).
