# Testing — notas Angular

## Herramientas

- Karma está obsoleto; las versiones recientes del Angular CLI adoptan **Vitest** como runner (también hay soporte de Jest y Web Test Runner). Comprueba el builder de `test` en `angular.json`.
- **@testing-library/angular** sobre TestBed, con `@testing-library/user-event`.
- Component harnesses del CDK (`TestbedHarnessEnvironment`) para interactuar con componentes de Angular Material sin depender de su DOM interno.

## Test de componente

```ts
import { render, screen } from '@testing-library/angular'
import userEvent from '@testing-library/user-event'

test('muestra los errores del servidor junto a cada campo', async () => {
  server.use(/* handler de MSW que devuelve 422 */)
  const user = userEvent.setup()
  await render(AccountFormComponent, {
    providers: [provideHttpClient(withFetch()), provideRouter([])],
  })

  await user.type(screen.getByLabelText('Email'), 'ana@empresa.com')
  await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))

  expect(await screen.findByText('Este email ya está registrado')).toBeInTheDocument()
})
```

- `render` acepta `inputs` (signal inputs incluidos), `providers`, `imports` y `routes`.
- Componentes standalone: se importan directamente; sin módulos de test.

## Red

- **MSW** con `setupServer` (Node) intercepta tanto `fetch` como `XMLHttpRequest`, así que funciona con `HttpClient` con o sin `withFetch()`. En Vitest browser mode usa `setupWorker`.
- `provideHttpClientTesting()` + `HttpTestingController` es la alternativa nativa: útil para tests de servicios; en tests de componente, MSW mantiene la red en la frontera y reutiliza handlers.

## Servicios, signals y RxJS

- Servicios con signals: `TestBed.inject(CartStore)`, llama a sus métodos y comprueba las signals de lectura.
- `effect()` en tests: `TestBed.flushEffects()` (o `TestBed.tick()` en versiones recientes) para ejecutarlos.
- Observables con tiempo (debounce): `fakeAsync` + `tick()`, o temporizadores falsos del runner.

## Guards y resolvers

```ts
const result = await TestBed.runInInjectionContext(() => authGuard(route, state))
expect(result).toEqual(router.createUrlTree(['/login'], { queryParams: { redirect: '/app/pedidos' } }))
```

O renderiza con `routes` y navega con `RouterTestingHarness` para probar la navegación real.

## Detalles

- Zoneless: con detección de cambios sin zone.js, usa `await fixture.whenStable()` o las utilidades asíncronas de Testing Library en lugar de `fixture.detectChanges()` manual.
- Evita `fixture.componentInstance` para leer o forzar estado interno; interactúa por el DOM.
