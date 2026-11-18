# Arquitectura — notas React / Next.js

## React + Vite (SPA)

```text
src/
├── app/            # App.tsx, router, providers (QueryClientProvider, theme…)
├── features/
│   └── orders/
│       ├── components/
│       ├── hooks/         # useOrderFilters, useOrderTotals
│       ├── api/           # orders.api.ts, queries (TanStack Query)
│       ├── model/         # tipos, schemas, store de la feature si hace falta
│       ├── routes.tsx     # rutas de la feature con lazy()
│       └── index.ts
└── shared/
    ├── ui/
    ├── hooks/
    └── api/
```

- **Hooks personalizados** son la unidad de reutilización de lógica. Un componente que tiene más de ~3 `useState`/`useEffect` relacionados suele pedir un hook.
- **Providers:** agrúpalos en `app/providers.tsx`. Un Context por preocupación (tema, sesión), no un "AppContext" con todo: cualquier cambio re-renderiza a todos los consumidores (ver skill `state-management`).
- **Lazy routes:** `const OrdersPage = lazy(() => import('./pages/OrdersPage'))` con `<Suspense>`; o el `lazy` de las rutas en React Router.

## Next.js (App Router)

- El router de ficheros obliga a que las rutas vivan en `app/`. Mantén `app/` **delgado**: `page.tsx` importa y compone desde `features/` o `src/features/`.
- **Colocación:** Next permite carpetas privadas (`_components/`) y grupos de rutas (`(marketing)/`, `(dashboard)/`) para organizar sin afectar la URL. Úsalos para separar zonas de la app.
- **Frontera servidor/cliente:** marca `'use client'` lo más abajo posible del árbol (en hojas interactivas), no en layouts o páginas completas. Código que solo puede correr en servidor (secretos, acceso a BD) en módulos con `import 'server-only'`.
- Server Actions y Route Handlers son backend: aplica las reglas de la capa backend (validación, autorización).
- No mezcles en un mismo módulo código de servidor y de cliente: el bundler puede acabar enviando dependencias de servidor al navegador.

## Remix / React Router v7 (framework mode)

- Las rutas definen `loader`/`action`: la carga de datos vive en la ruta, no en `useEffect`. La lógica de dominio sigue yendo en `features/`, y el loader solo orquesta.
