# Rendimiento — notas Angular

## Carga diferida

- Rutas: `loadComponent` / `loadChildren`.
- **`@defer`** en plantillas para cargar componentes pesados bajo demanda, con disparadores:
  ```html
  @defer (on viewport) {
    <app-sales-chart [data]="data()" />
  } @placeholder (minimum 300ms) {
    <div class="h-80 animate-pulse"></div>   <!-- mismo tamaño: sin CLS -->
  } @loading {
    <app-spinner />
  }
  ```
  Disparadores: `on idle`, `on viewport`, `on interaction`, `on hover`, `on timer(…)`, `when condición`; `prefetch on idle` para descargar antes de mostrar.
- Estrategias de precarga del router (`withPreloading(PreloadAllModules)` o una estrategia propia por ruta) para equilibrar carga inicial y navegación.

## Detección de cambios

- `ChangeDetectionStrategy.OnPush` en todos los componentes; con signals y `async` pipe, solo se revisa lo que cambia.
- Aplicaciones **zoneless** (sin zone.js): menos trabajo de detección de cambios y menos JS; requiere que el estado de la UI pase por signals o eventos de plantilla.
- `@for` con `track` por id estable; evita funciones en plantillas que se recalculan en cada ciclo (usa `computed()` o pipes puros).

## Imágenes

`NgOptimizedImage` (`ngSrc`): exige dimensiones (sin CLS), genera `srcset`, aplica lazy loading por defecto y `priority` para la imagen LCP, y avisa en desarrollo de errores comunes.

## Listas grandes

`cdk-virtual-scroll-viewport` del CDK o TanStack Virtual para Angular.

## Bundle y presupuestos

```jsonc
// angular.json → configurations.production.budgets
"budgets": [
  { "type": "initial", "maximumWarning": "500kb", "maximumError": "1mb" },
  { "type": "anyComponentStyle", "maximumWarning": "4kb", "maximumError": "8kb" }
]
```

- Los budgets miden tamaños sin comprimir; ajusta los límites al proyecto y bájalos con el tiempo.
- Análisis: `ng build --stats-json` y un visualizador de esbuild, o `source-map-explorer`.
- Evita importar módulos completos de Angular Material o RxJS que no se usen.

## SSR

Con Angular SSR, hidratación (`provideClientHydration()`) e hidratación incremental con `@defer (hydrate on …)` para no hidratar de golpe toda la página (→ `rendering-and-seo`).
