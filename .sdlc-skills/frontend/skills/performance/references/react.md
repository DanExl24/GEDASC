# Rendimiento — notas React / Next.js

## Code splitting

- `const Editor = lazy(() => import('./Editor'))` con `<Suspense fallback>`.
- React Router: propiedad `lazy` en la definición de rutas.
- Next.js: las rutas ya se dividen; para componentes pesados de cliente, `next/dynamic` (`ssr: false` solo si el componente no puede renderizarse en servidor).

## INP en React

- **`useTransition`** para actualizaciones no urgentes (filtrar una lista grande tras teclear): el input responde y la lista se actualiza después.
  ```tsx
  const [isPending, startTransition] = useTransition()
  const onChange = (v: string) => { setQuery(v); startTransition(() => setFilter(v)) }
  ```
- **`useDeferredValue`** para derivar una versión "atrasada" de un valor que alimenta un render caro.
- **React Compiler** (si el proyecto lo usa) memoiza componentes y valores automáticamente; sin él, `memo`/`useMemo`/`useCallback` donde el Profiler muestre renders caros.
- Profiler de React DevTools para localizar componentes que se renderizan demasiado o tardan.

## Server Components (Next.js App Router)

- Los Server Components no envían su JS al cliente: mantén la mayor parte del árbol en servidor y `'use client'` solo en las hojas interactivas.
- Librerías pesadas usadas para formatear o renderizar contenido (markdown, resaltado de sintaxis) en Server Components = 0 KB en el cliente.
- Streaming con `loading.tsx` y `<Suspense>` para mostrar pronto lo que no depende de datos lentos.

## Imágenes, fuentes y scripts (Next.js)

- `next/image` con `sizes` correcto; `priority` (o `fetchPriority="high"`) en la imagen LCP.
- `next/font` auto-hospeda y ajusta métricas (sin CLS).
- `next/script` con `strategy="lazyOnload"` o `"afterInteractive"` para terceros.

## Listas grandes

`@tanstack/react-virtual` o `react-window`.

## Bundle

- `@next/bundle-analyzer`; en Vite, `rollup-plugin-visualizer`.
- Barrels de librerías (iconos, utilidades) en Next: `optimizePackageImports` en `next.config` para las que no lo traen por defecto.
