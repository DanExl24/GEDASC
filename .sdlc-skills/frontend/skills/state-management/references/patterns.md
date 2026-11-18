# Patrones de estado y reactividad

## Clasificar el estado

| Tipo | Ejemplos | Dónde vive |
| :--- | :--- | :--- |
| **Servidor** | lista de pedidos, perfil del usuario, catálogo | Librería de server state (TanStack Query, SWR, RTK Query…) → skill `data-fetching` |
| **URL** | filtros, búsqueda, página, pestaña activa, id seleccionado | Query params / ruta → el usuario puede compartir el enlace y usar atrás/adelante |
| **Formulario** | valores, errores, dirty, touched | Librería de formularios o estado local del formulario → skill `forms` |
| **UI local** | modal abierto, acordeón expandido, hover, valor de un input no compartido | Estado del componente |
| **Cliente compartido** | sesión/usuario autenticado, tema, idioma, carrito sin persistir en servidor, preferencias, estado de un wizard multi-página | Store global o provide/context |
| **Persistente en cliente** | preferencias, borradores | Store + `localStorage`/IndexedDB (ver § Persistencia) |
| **Derivado** | totales, listas filtradas, flags calculados | `computed` / selector / `useMemo`. **Nunca almacenado** |

Regla práctica: si al quitar un dato del store global solo se rompe un componente (o un componente y sus hijos), ese dato no era global.

## Subir el estado gradualmente

```text
estado local  →  ancestro común (props)  →  provide/inject · Context · servicio de feature  →  store global
```

Sube un nivel solo cuando el actual no basta. La mayoría del estado se queda en los dos primeros.

## Diseño de un store

```ts
// Ejemplo agnóstico (la sintaxis concreta está en cada referencia de stack)
store cart {
  // estado fuente: mínimo e independiente
  items: CartItem[]
  couponCode: string | null

  // derivados: calculados, nunca asignados
  get itemCount() { return sum(items.map(i => i.qty)) }
  get subtotal()  { return sum(items.map(i => i.qty * i.unitPrice)) }

  // acciones con intención de negocio
  addItem(product, qty)
  removeItem(productId)
  applyCoupon(code)
  clear()
}
```

- Estado **normalizado** cuando hay entidades relacionadas o actualizaciones por id: `{ byId: Record<Id, Item>, ids: Id[] }` en lugar de arrays anidados que hay que recorrer para actualizar.
- **Inmutabilidad** donde la librería la requiere (React, Redux, Zustand, signals con objetos): crea nuevos objetos en vez de mutar. Pinia y Vue permiten mutar de forma reactiva, pero hazlo dentro de acciones.
- Nada de lógica de negocio crítica (precios finales, permisos) calculada solo en cliente: el backend es la fuente de verdad; el cliente puede mostrar una estimación.
- Si el store crece más allá de ~200–300 líneas o mezcla dominios, pártelo por feature.

## Fugas de memoria: cleanup

Todo recurso creado en un componente o store debe liberarse:

| Recurso | Liberación |
| :--- | :--- |
| `addEventListener` en `window`/`document` | `removeEventListener` con la **misma referencia** de función (o `AbortController` + `{ signal }`) |
| `setInterval` / `setTimeout` recurrente | `clearInterval` / `clearTimeout` |
| WebSocket, `EventSource` | `close()` y quitar handlers |
| Suscripción a observable / store externo / event bus | `unsubscribe()` / función de desuscripción |
| `ResizeObserver`, `IntersectionObserver`, `MutationObserver` | `disconnect()` |
| Librerías imperativas (gráficos, mapas, editores) | su método `destroy()`/`dispose()` |
| Peticiones en vuelo | `abort()` (→ skill `data-fetching`) |

Patrón útil para varios listeners: un `AbortController` por componente.

```ts
const controller = new AbortController()
window.addEventListener('resize', onResize, { signal: controller.signal })
document.addEventListener('keydown', onKey, { signal: controller.signal })
// al desmontar:
controller.abort()   // elimina ambos listeners
```

Otras fuentes de fugas: cachés de módulo que crecen sin límite (Map global sin expiración), closures que retienen componentes desmontados dentro de stores, referencias a nodos del DOM guardadas en stores.

## No sincronizar con efectos

```ts
// ❌ dos fuentes de verdad + un render extra + riesgo de bucle
watch(items, (v) => { total.value = sum(v) })
useEffect(() => { setTotal(sum(items)) }, [items])

// ✅ derivado
const total = computed(() => sum(items.value))
const total = useMemo(() => sum(items), [items])   // o simplemente calcularlo en el render si es barato
```

Los efectos son para sincronizar con **sistemas externos** (DOM, red, almacenamiento, librerías imperativas), no para mantener estado interno coherente.

## Bucles infinitos de render

Causas habituales:
- Un efecto/watcher que modifica el mismo estado del que depende.
- Dependencias que son objetos o funciones nuevas en cada render (React).
- Un `computed`/getter con efectos secundarios (mutar estado dentro de un `computed`).
- Dos watchers que se modifican mutuamente.

## Persistencia

```ts
// Principios, independientes de la librería (pinia-plugin-persistedstate, zustand/persist, etc.)
persist: {
  key: 'app:preferences',
  version: 2,                       // al cambiar la forma del estado
  pick: ['theme', 'locale'],        // solo lo necesario, nunca el store entero
  migrate: (old, fromVersion) => …, // convierte formatos anteriores en vez de romper
}
```

- **Nunca** persistas tokens, datos sensibles o PII en `localStorage` sin cifrado y sin necesidad.
- Valida lo que lees de almacenamiento (es `unknown`; el usuario o una versión anterior pudieron dejar cualquier cosa).
- Sincroniza entre pestañas si importa (evento `storage` o `BroadcastChannel`).
- Limpia el estado persistido al cerrar sesión.

## Estado en SSR

- Un store/instancia **por petición**. Un singleton a nivel de módulo en el servidor se comparte entre usuarios → fuga de datos entre sesiones (**CRITICAL**).
- El estado se serializa en el servidor y se hidrata en el cliente: debe ser serializable (sin funciones, clases con métodos, `Map`/`Set` sin adaptar, fechas sin transformar).
- Acceso a `window`, `localStorage` o `document` solo en el cliente (en hooks de montaje o tras comprobar el entorno).

## Anti-patrones

| Anti-patrón | Consecuencia | Corrección |
| :--- | :--- | :--- |
| Store global como caché de API | Datos obsoletos, carga duplicada | Server state (→ `data-fetching`) |
| Estado efímero de UI en el store global | Re-renders globales, acoplamiento | Estado local |
| Filtros y paginación en un store en vez de la URL | No se puede compartir el enlace; atrás no funciona | Query params |
| Derivados almacenados | Desincronización | `computed`/selector |
| Mutar el store desde cualquier componente | Cambios imposibles de rastrear | Acciones |
| Listener sin cleanup | Memoria creciente, handlers duplicados | Cleanup en desmontaje |
| `watch`/`useEffect` para copiar estado | Renders extra, bucles | Derivar |
| Un único contexto/store con todo | Cualquier cambio re-renderiza toda la app | Partir por preocupación, selectores |
| Singleton con datos de usuario en SSR | **Datos de un usuario visibles para otro** | Estado por petición |
