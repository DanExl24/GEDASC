# Arquitectura — notas Vue / Nuxt

## Vue 3 + Vite (SPA)

```text
src/
├── app/            # App.vue, router/, plugins (pinia, i18n), providers
├── features/
│   └── orders/
│       ├── components/
│       ├── composables/   # useOrderFilters, useOrderTotals
│       ├── api/           # orders.api.ts, queries
│       ├── stores/        # orders.store.ts (Pinia), solo si hay estado compartido
│       ├── pages/         # OrdersListPage.vue, OrderDetailPage.vue
│       ├── routes.ts      # rutas de la feature, cargadas con lazy import
│       └── index.ts
└── shared/
    ├── ui/                # BaseButton.vue, BaseModal.vue
    ├── composables/       # useDebounce, useMediaQuery
    └── api/               # http client
```

- **Rutas por feature:** cada feature exporta su `routes.ts` y `app/router` las une. Usa `component: () => import('./pages/OrdersListPage.vue')` para code splitting.
- **Composables** son la unidad de reutilización de lógica. Uno por responsabilidad, prefijo `use`, devuelven refs/computed. Si un composable solo lo usa una feature, vive en ella.
- **Pinia:** un store por feature como máximo, y solo si el estado se comparte entre vistas. No uses Pinia como caché de API (ver skill `data-fetching`).
- Evita registrar componentes globalmente (`app.component(...)`) salvo los de `shared/ui` muy usados; rompe el tree-shaking y oculta dependencias.
- Auto-imports (`unplugin-auto-import`, `unplugin-vue-components`): cómodos, pero ocultan de dónde viene cada cosa y saltan los límites entre features. Si se usan, limítalos a `shared/`.

## Nuxt 3/4

- Nuxt impone `pages/`, `components/`, `composables/`, `server/`. En Nuxt 4 el código de la app vive en `app/`.
- Para separar por features usa **Nuxt Layers**: cada feature grande como una layer (`layers/orders/`) con sus propios `components/`, `composables/`, `pages/`. Nuxt las fusiona automáticamente.
- Los auto-imports de Nuxt hacen que cualquier componente o composable sea accesible desde cualquier sitio: la disciplina de límites tiene que venir de convenciones y revisión (o de layers).
- `server/` (Nitro) es backend: sus reglas son las de la capa backend, no las del cliente.
