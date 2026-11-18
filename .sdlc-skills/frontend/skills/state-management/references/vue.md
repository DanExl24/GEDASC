# Estado y reactividad — notas Vue / Pinia

## Pinia (setup store)

```ts
// features/cart/stores/cart.store.ts
export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])

  const itemCount = computed(() => items.value.reduce((n, i) => n + i.qty, 0))
  const subtotal = computed(() => items.value.reduce((s, i) => s + i.qty * i.unitPrice, 0))

  function addItem(product: Product, qty = 1) {
    const existing = items.value.find((i) => i.productId === product.id)
    if (existing) existing.qty += qty
    else items.value.push({ productId: product.id, unitPrice: product.price, qty })
  }
  function clear() { items.value = [] }

  return { items, itemCount, subtotal, addItem, clear }
})
```

- Todo lo que se devuelve es público; lo que no se devuelve es privado (pero Pinia necesita que el **estado** se devuelva para devtools y SSR).
- Desde componentes, extrae estado con **`storeToRefs`**:
  ```ts
  const cart = useCartStore()
  const { items, subtotal } = storeToRefs(cart)   // ✅ siguen siendo reactivos
  const { addItem } = cart                         // las acciones se pueden desestructurar directamente
  const { items } = cart                           // ❌ pierde reactividad
  ```
- No modifiques el estado del store desde componentes (`cart.items.push(...)`); usa acciones.

## Pérdida de reactividad

| Caso | Problema | Corrección |
| :--- | :--- | :--- |
| `const { a } = reactive(obj)` | `a` es un valor suelto | `toRefs(state)` o acceder como `state.a` |
| `const { a } = store` | igual que arriba | `storeToRefs(store)` |
| `const p = props; const { id } = p` / `const { id } = props` en la función `setup()` | `id` no se actualiza | `toRefs(props)`, `toRef(props, 'id')` o `() => props.id` |
| Pasar `ref.value` a un composable | el composable recibe un valor fijo | pasar el `ref` o un getter y leer con `toValue()` |
| `let state = reactive({...}); state = reactive({...})` | se reemplaza la referencia, el template sigue con la vieja | `ref()` y reasignar `.value`, o `Object.assign(state, nuevo)` |

**Vue 3.5+:** `const { id } = defineProps<…>()` en `<script setup>` **sí** es reactivo (el compilador lo transforma). Pero para observarlo hay que usar un getter: `watch(() => id, …)`, no `watch(id, …)`. Y pasarlo a un composable también requiere getter: `useThing(() => id)`.

## Watchers y efectos

- Prefiere `computed` antes que `watch` para valores derivados.
- `watch` con `{ deep: true }` sobre estructuras grandes es caro; observa la propiedad concreta con un getter.
- Datos grandes que se reemplazan enteros y no necesitan reactividad profunda (respuestas grandes, datasets de gráficos): `shallowRef` o `markRaw`.
- Instancias de librerías externas (mapas, gráficos, editores) nunca en `ref()`/`reactive()` profundo: `shallowRef` o `markRaw`, o la reactividad las envolverá en proxies (lento y con errores raros).

## Cleanup

```ts
onMounted(() => {
  window.addEventListener('resize', onResize)
  timer = setInterval(poll, 10_000)
})
onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  clearInterval(timer)
})
```

- En composables reutilizables usa `onScopeDispose` (funciona dentro de componentes y de `effectScope`).
- VueUse (`useEventListener`, `useIntervalFn`, `useResizeObserver`) hace el cleanup automáticamente.
- `<KeepAlive>`: los componentes no se desmontan; usa `onDeactivated`/`onActivated` para pausar timers y listeners.

## provide / inject

- Para estado compartido en un subárbol (un wizard, un layout) sin crear un store global.
- Tipado con `InjectionKey` (ver skill `typescript`). Proporciona refs de solo lectura (`readonly(state)`) y funciones para modificarlas.

## SSR (Nuxt)

- Usa `useState('key', () => init)` o Pinia (por petición gracias a Nuxt) para estado compartido; **nunca** `const state = ref()` a nivel de módulo fuera de un composable, porque se comparte entre peticiones en el servidor.
- `localStorage` solo en `onMounted` o dentro de `if (import.meta.client)`.
