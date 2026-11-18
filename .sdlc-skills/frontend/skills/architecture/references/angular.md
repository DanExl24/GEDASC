# Arquitectura — notas Angular

## Estructura recomendada (standalone)

Angular moderno usa componentes standalone por defecto; los `NgModule` ya no son necesarios para organizar.

```text
src/app/
├── core/            # singletons de la app: interceptores, guards globales, layout, config
├── features/
│   └── orders/
│       ├── components/
│       ├── data-access/   # servicios HTTP y estado de la feature
│       ├── ui/            # componentes presentacionales (inputs/outputs, sin servicios)
│       ├── orders.routes.ts
│       └── index.ts
├── shared/          # ui, pipes, directivas y utilidades genéricas
├── app.config.ts    # provideRouter, provideHttpClient(withInterceptors(...)), etc.
└── app.routes.ts
```

- **Rutas lazy por feature:** `{ path: 'orders', loadChildren: () => import('./features/orders/orders.routes') }` o `loadComponent` para componentes sueltos.
- **Smart vs presentational:** los componentes de `ui/` solo reciben `input()` y emiten `output()`; los de `components/` (o páginas) inyectan servicios y orquestan.
- **Providers con alcance:** servicios de una feature con `providedIn: 'root'` solo si son realmente globales; si no, provéelos en la ruta (`providers: [...]` en la definición de ruta) para que su ciclo de vida sea el de la feature.
- `core/` no debe convertirse en un cajón: solo lo que se instancia una vez para toda la app.

## Nx (habitual en proyectos Angular grandes)

- Librerías por feature y por tipo: `feature-*`, `data-access-*`, `ui-*`, `util-*`.
- Etiquetas (`tags`) en `project.json` y la regla `@nx/enforce-module-boundaries` para prohibir, por ejemplo, que `ui` dependa de `data-access`.
- `nx graph` para visualizar dependencias y detectar ciclos.

## Señales de alerta específicas

- `SharedModule` gigante importado en todas partes (herencia de apps con NgModules): migrar a imports standalone explícitos.
- Servicios con estado en `providedIn: 'root'` que en realidad pertenecen a una sola feature.
- Barrels internos que provocan ciclos de inyección o `undefined` en tiempo de carga.
