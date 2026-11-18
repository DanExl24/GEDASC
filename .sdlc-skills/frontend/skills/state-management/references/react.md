# Estado y reactividad — notas React

## Elegir herramienta

| Necesidad | Herramienta |
| :--- | :--- |
| Estado de un componente | `useState` / `useReducer` |
| Compartir en un subárbol, cambia poco (tema, sesión, idioma) | Context |
| Estado global que cambia con frecuencia o lo leen muchos componentes | Zustand, Jotai o Redux Toolkit |
| Datos del servidor | TanStack Query / SWR / RTK Query (→ `data-fetching`) |
| Estado en la URL | `useSearchParams` (React Router / Next) o `nuqs` |

## Context sin re-renders masivos

```tsx
// ❌ un objeto nuevo en cada render → todos los consumidores se re-renderizan siempre
<AppContext.Provider value={{ user, theme, setTheme, cart, addToCart }}>

// ✅ contextos separados por preocupación y valor memoizado
const value = useMemo(() => ({ theme, setTheme }), [theme])
<ThemeContext.Provider value={value}>
```

Context no es un gestor de estado: todos los consumidores se re-renderizan cuando cambia el valor. Para estado que cambia mucho, usa un store con selectores.

## Zustand

```ts
export const useCartStore = create<CartState>()((set) => ({
  items: [],
  addItem: (product, qty = 1) =>
    set((s) => ({ items: upsert(s.items, product, qty) })),   // inmutable
  clear: () => set({ items: [] }),
}))

// ✅ selector: solo re-renderiza si cambia lo seleccionado
const count = useCartStore((s) => s.items.length)

// selector que devuelve un objeto nuevo → usar useShallow (Zustand v5)
const { items, clear } = useCartStore(useShallow((s) => ({ items: s.items, clear: s.clear })))

// ❌ sin selector: re-renderiza con cualquier cambio del store
const store = useCartStore()
```

Derivados: calcúlalos en el selector o con `useMemo`, no los guardes en el store.

## Redux Toolkit

- `createSlice` (con Immer: "mutar" dentro del reducer es seguro), `createSelector` para derivados memoizados.
- No guardes en Redux datos del servidor a mano: usa RTK Query.
- Selecciona lo mínimo con `useSelector`; seleccionar un objeto nuevo en cada llamada provoca re-renders (usa `createSelector` o `shallowEqual`).

## Efectos y dependencias

- Las dependencias de `useEffect` deben estar completas (regla `react-hooks/exhaustive-deps`). Silenciarla es la causa nº 1 de estado obsoleto (stale closures).
- Objetos/arrays/funciones creados en el render cambian de identidad en cada render: como dependencia, disparan el efecto siempre. Muévelos fuera del componente, dentro del efecto o memoízalos.
- **No necesitas un efecto** para: derivar datos (calcúlalos en el render), resetear estado al cambiar una prop (usa `key` en el componente), responder a un evento (hazlo en el handler).

## Cleanup

```tsx
useEffect(() => {
  const controller = new AbortController()
  window.addEventListener('resize', onResize, { signal: controller.signal })
  const id = setInterval(poll, 10_000)
  return () => {
    controller.abort()
    clearInterval(id)
  }
}, [])
```

En desarrollo, StrictMode monta, desmonta y vuelve a montar los componentes para detectar cleanups ausentes: si algo se duplica en desarrollo, falta un cleanup.

## Re-renders

- **React Compiler** (si el proyecto lo usa) memoiza automáticamente; no añadas `useMemo`/`useCallback`/`memo` a mano sin medir.
- Sin compilador: `memo` en componentes caros que reciben props estables; `useCallback`/`useMemo` solo cuando la identidad importa (props de componentes memoizados, dependencias de efectos).
- Mide antes de optimizar: React DevTools Profiler, "Highlight updates when components render".
- Baja el estado: si solo un hijo usa un estado que cambia mucho, muévelo al hijo.

## Estado en la URL

```tsx
const [params, setParams] = useSearchParams()
const page = Number(params.get('page') ?? 1)
const setPage = (p: number) => setParams((prev) => { prev.set('page', String(p)); return prev })
```

## SSR (Next.js)

- Stores de Zustand/Redux creados por petición (patrón "store provider" con `useRef` para crear el store una vez por árbol), no a nivel de módulo.
- `localStorage` y `window` solo en efectos o componentes cliente; cuidado con los mismatches de hidratación al leer estado persistido en el primer render.
