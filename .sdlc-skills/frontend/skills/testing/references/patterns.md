# Patrones de testing de frontend

Los ejemplos usan Vitest + Testing Library + MSW; los equivalentes por framework están en las referencias de stack.

## Qué probar en cada nivel

| Nivel | Qué | Herramienta | Proporción |
| :--- | :--- | :--- | :--- |
| Estático | Tipos, lint (incluido lint de accesibilidad) | TypeScript, ESLint | Siempre, en CI |
| Unitario | Lógica pura: formateadores, cálculos, schemas, reducers, utilidades | Vitest/Jest | Muchos, muy rápidos |
| Componente / integración | Un componente o una feature con sus hijos reales, red simulada | Testing Library + MSW (jsdom/happy-dom o modo navegador) | **El grueso** del valor en frontend |
| Visual | Apariencia de componentes y páginas en estados clave | Storybook + Chromatic, o Playwright `toHaveScreenshot` | Componentes base y pantallas críticas |
| E2E | Flujos críticos completos contra la app real | Playwright/Cypress | Pocos (dominio QA) |

## Anatomía de un test de componente

```ts
import { render, screen } from '@testing-library/vue'   // o /react, /angular
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/msw/server'

test('muestra los errores del servidor junto a cada campo', async () => {
  server.use(
    http.post('/api/accounts', () =>
      HttpResponse.json({ error: { message: 'Datos inválidos', fields: { email: ['Este email ya está registrado'] } } }, { status: 422 }),
    ),
  )
  const user = userEvent.setup()
  render(AccountForm)

  await user.type(screen.getByLabelText('Email'), 'ana@empresa.com')
  await user.type(screen.getByLabelText('Nombre'), 'Ana')
  await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))

  expect(await screen.findByText('Este email ya está registrado')).toBeInTheDocument()
  expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true')
  expect(screen.getByLabelText('Email')).toHaveValue('ana@empresa.com')   // no se pierden los datos
})
```

Estructura: **preparar** (datos y handlers) → **actuar** (como el usuario) → **comprobar** (lo que ve).

## Consultas: orden de preferencia

1. `getByRole('button', { name: 'Guardar' })` — la mejor: refleja accesibilidad.
2. `getByLabelText('Email')` — campos de formulario.
3. `getByPlaceholderText`, `getByText`, `getByDisplayValue`.
4. `getByAltText`, `getByTitle`.
5. `getByTestId` — solo si no hay forma semántica (y pregúntate por qué).

Variantes: `getBy…` (debe existir ya), `queryBy…` (para comprobar que **no** existe), `findBy…` (espera a que aparezca; asíncrono).

## Interacción

- `userEvent.setup()` y `await user.click/type/keyboard/selectOptions/upload`: simula la secuencia real de eventos (foco, teclas, input, change).
- `fireEvent` solo para eventos que `user-event` no cubre.
- Prueba también el teclado en componentes interactivos (`await user.keyboard('{Escape}')`, `{Tab}`).

## Red con MSW

```ts
// test/msw/handlers.ts — compartidos con Storybook y el modo desarrollo
export const handlers = [
  http.get('/api/orders', ({ request }) => {
    const status = new URL(request.url).searchParams.get('status')
    return HttpResponse.json(orderFactory.list(3, { status }))
  }),
]

// test/msw/server.ts
export const server = setupServer(...handlers)

// setupTests.ts
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))   // peticiones no previstas = fallo
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

- `server.use(...)` dentro del test para sobrescribir un handler (errores, vacío, lentitud con `delay()`).
- **No mockees axios/fetch ni las funciones de API**: el test dejaría de cubrir interceptores, normalización de errores y parseo.
- `onUnhandledRequest: 'error'` detecta peticiones olvidadas.

## Estados que cubrir

Para cada vista con datos: **carga** (skeleton visible), **vacío** (mensaje y acción), **error** (mensaje y reintento que funciona), **éxito**. Para cada acción: **pendiente** (botón deshabilitado), **error**, **éxito** (feedback y caché actualizada).

## Formularios

- Validación en cliente: errores al salir del campo y al enviar.
- Envío correcto: datos enviados (inspecciona el body en el handler de MSW) y resultado (redirección, mensaje, reset).
- Errores del servidor 422 por campo y errores generales.
- Doble envío: dos clics rápidos → una sola petición (cuenta las llamadas en el handler).

## Stores, hooks y composables

- Prueba a través de su API pública (acciones y getters), no de su estado interno.
- Hooks/composables: `renderHook` (React/Vue Testing Library) o un componente de prueba mínimo.
- Mejor aún: pruébalos indirectamente a través del componente que los usa, salvo que sean reutilizables y con lógica compleja.

## Router y guards

- Renderiza con un router de memoria y rutas reales (o un subconjunto) para probar navegación, guards y estado en la URL.
- Guards: sin sesión → redirige a login con `redirect`; con sesión sin rol → 403; parámetro `redirect` externo → se ignora.

## Asincronía y tiempo

- `await screen.findBy…` o `await waitFor(() => expect(…))`; **nunca** `await sleep(500)`.
- Temporizadores falsos (`vi.useFakeTimers()`) para debounce, polling y expiraciones; con `user-event`, `userEvent.setup({ advanceTimers: vi.advanceTimersByTime })`.
- Fecha fija (`vi.setSystemTime`) cuando el resultado depende de "hoy".

## Aislamiento

- Un `QueryClient` nuevo por test con `retry: false` (si no, los errores tardan por los reintentos y la caché se comparte).
- Store nuevo por test (Pinia `createPinia()`/`createTestingPinia()`, store de Zustand recreado, TestBed por test).
- Limpia almacenamiento (`localStorage.clear()`), handlers de MSW, temporizadores y mocks (`vi.restoreAllMocks()`) en `afterEach`.

## Datos de prueba

Factorías con valores por defecto realistas y sobrescritura de lo relevante para el test:

```ts
export const orderFactory = {
  build: (overrides: Partial<Order> = {}): Order => ({
    id: crypto.randomUUID(), number: 'F-1001', status: 'pending', total: 120.5, createdAt: '2026-01-15T10:00:00Z', ...overrides,
  }),
  list: (n: number, overrides: Partial<Order> = {}) => Array.from({ length: n }, (_, i) => orderFactory.build({ number: `F-${1001 + i}`, ...overrides })),
}
```

Cada test muestra solo los datos que importan para él.

## Regresión visual

- Historias de Storybook por variante y estado (las de `design-system`) + Chromatic, o Playwright `expect(page).toHaveScreenshot()`.
- Estabiliza: fuentes cargadas, animaciones desactivadas, fecha y datos fijos, viewport fijo (usa algunos de [viewports.md](../../../standards/viewports.md)).
- Revisa los diffs como parte de la PR; no aceptes cambios visuales en bloque sin mirar.

## Intermitencia (flakiness): causas habituales

| Causa | Solución |
| :--- | :--- |
| Esperas fijas o falta de espera | `findBy`/`waitFor` sobre una condición |
| Estado compartido entre tests (store, caché, localStorage, handlers) | Crear y limpiar por test |
| Dependencia del orden de ejecución | Aislar; ejecutar en orden aleatorio para detectarlo |
| Fecha, zona horaria, aleatorios | Fijar reloj, TZ en CI, semillas |
| Peticiones reales o no controladas | MSW con `onUnhandledRequest: 'error'` |
| Animaciones y transiciones | Desactivarlas en el entorno de test |
| Promesas sin esperar | `await` en todas las interacciones; regla de lint `no-floating-promises` |

## Cobertura

- Úsala para encontrar **comportamiento crítico sin tests**, no como meta (un 100% con aserciones débiles no protege nada).
- Prioriza: formularios principales, permisos, cálculos que ve el usuario, estados de error.
- Pruebas de mutación (Stryker) para medir si los tests detectan cambios en lógica crítica.

## Anti-patrones

| Anti-patrón | Consecuencia | Corrección |
| :--- | :--- | :--- |
| Probar estado interno, métodos privados o props de hijos | Tests que se rompen al refactorizar | Probar lo que ve y hace el usuario |
| Selectores por clase CSS o estructura del DOM | Fragilidad | Consultas por rol/etiqueta/texto |
| Mockear axios o las funciones de API | Interceptores y errores sin cubrir | MSW |
| Mockear todos los hijos (shallow) | No se prueba la integración real | Renderizar los hijos reales |
| Snapshots enormes del DOM | Se aceptan sin mirar | Aserciones concretas; snapshots pequeños o visuales |
| `sleep` en tests | Lentitud e intermitencia | Esperar condiciones |
| Tests sin aserciones o con `expect(true)` | Falsa seguridad | Aserciones sobre el resultado |
| Un solo test gigante por componente | Fallos difíciles de diagnosticar | Un comportamiento por test |
