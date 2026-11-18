# Estado y reactividad — notas Angular

## Elegir herramienta

| Necesidad | Herramienta |
| :--- | :--- |
| Estado de un componente | `signal()` / `computed()` en el componente |
| Estado de una feature compartido entre componentes | Servicio con signals, provisto en la ruta de la feature |
| Estado global con mucha lógica, equipos grandes, trazabilidad | NgRx SignalStore (o NgRx Store clásico si ya existe) |
| Datos del servidor | → `data-fetching` (resource, TanStack Query, servicios con caché) |

## Servicio con signals

```ts
@Injectable()   // provisto en la ruta de la feature, no en root, si solo lo usa esa feature
export class CartStore {
  private readonly _items = signal<CartItem[]>([])

  readonly items = this._items.asReadonly()   // los componentes no pueden escribir
  readonly itemCount = computed(() => this._items().reduce((n, i) => n + i.qty, 0))
  readonly subtotal = computed(() => this._items().reduce((s, i) => s + i.qty * i.unitPrice, 0))

  addItem(product: Product, qty = 1) {
    this._items.update((items) => upsert(items, product, qty))   // inmutable
  }
  clear() { this._items.set([]) }
}
```

- Expón signals de solo lectura y métodos para modificarlas.
- **Inmutabilidad:** las signals comparan por referencia; mutar un array u objeto en su sitio (`this._items().push(x)`) no notifica a nadie.
- `linkedSignal()` para estado local que se reinicia cuando cambia otra signal (por ejemplo, la opción seleccionada cuando cambia la lista).

## `effect()` con moderación

- `effect()` es para sincronizar con el exterior (localStorage, logging, librerías imperativas, DOM).
- No uses `effect()` para copiar una signal en otra: usa `computed()` o `linkedSignal()`.
- Escribir signals dentro de `effect()` es una señal de alerta (riesgo de bucles y de estado inconsistente).

## RxJS y suscripciones

- Prefiere `async` pipe o `toSignal()`: se desuscriben solos.
- Suscripciones manuales: `.pipe(takeUntilDestroyed())` en el contexto de inyección, o `takeUntilDestroyed(this.destroyRef)` fuera de él.
- `BehaviorSubject` en servicios: expón `asObservable()`, nunca el subject.
- Evita `subscribe` dentro de `subscribe`: usa operadores (`switchMap`, `combineLatest`).

## Cleanup

```ts
export class ChartComponent {
  private destroyRef = inject(DestroyRef)

  constructor() {
    const chart = createChart(…)
    const onResize = () => chart.resize()
    window.addEventListener('resize', onResize)
    this.destroyRef.onDestroy(() => {
      window.removeEventListener('resize', onResize)
      chart.destroy()
    })
  }
}
```

## Detección de cambios y rendimiento

- `ChangeDetectionStrategy.OnPush` en componentes; con signals y `async` pipe funciona de forma natural.
- En aplicaciones zoneless (sin zone.js), la UI solo se actualiza por signals, eventos de plantilla o `markForCheck`: mutar propiedades normales de la clase desde callbacks no refresca la vista.
- `@for` exige `track`: usa un id estable (`track item.id`), no `$index`, si los elementos se reordenan o eliminan.

## NgRx

- SignalStore (`signalStore`, `withState`, `withComputed`, `withMethods`) es el enfoque moderno; NgRx Store con actions/reducers/effects para apps que ya lo usan o necesitan su trazabilidad.
- No guardes respuestas de API sin una estrategia de caché e invalidación explícita (→ `data-fetching`).
- Selectores memoizados para derivados.

## SSR

- No uses variables de módulo (fuera de clases) para estado de usuario: se comparten entre peticiones.
- `localStorage`/`window` solo en el navegador (`afterNextRender`, o comprobando `isPlatformBrowser`).
