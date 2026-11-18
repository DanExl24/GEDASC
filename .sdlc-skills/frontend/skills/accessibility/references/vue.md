# Accesibilidad — notas Vue / Nuxt

## Lint

`eslint-plugin-vuejs-accessibility` con la configuración recomendada (`plugin:vuejs-accessibility/recommended` o su equivalente en flat config).

## Modales y overlays

- `<Teleport to="body">` para renderizar el modal fuera del árbol (evita problemas de `z-index` y `overflow`), pero aplica `inert` al contenedor de la app mientras está abierto.
- Focus trap: el `<dialog>` nativo con `showModal()`, `@vueuse/integrations/useFocusTrap` (focus-trap) o una librería headless (Reka UI, Headless UI) que ya lo implementa.
- Restaurar el foco: guarda `document.activeElement` al abrir y llama a `.focus()` al cerrar (después de que el modal se desmonte, con `nextTick`).

## Cambio de ruta

```ts
// router.ts
router.afterEach(async (to) => {
  document.title = (to.meta.title as string | undefined) ?? 'MiApp'
  await nextTick()
  const target = document.querySelector<HTMLElement>('main h1') ?? document.querySelector<HTMLElement>('main')
  if (target) { target.tabIndex = -1; target.focus({ preventScroll: false }) }
})
```

Nuxt: Nuxt incluye un anunciador de rutas (`<NuxtRouteAnnouncer>`) que anuncia el título de la nueva página; complétalo con `useHead({ title })` en cada página.

## Regiones live

Composable con una única región montada en el layout:

```ts
const message = ref('')
export function useAnnouncer() {
  return { announce: (text: string) => { message.value = ''; nextTick(() => (message.value = text)) }, message }
}
```

(Vaciar y volver a asignar asegura que se anuncie aunque el texto se repita.)

## Atributos ARIA dinámicos

- Vue elimina el atributo cuando el valor es `null`/`undefined`, pero `false` se renderiza como `"false"`, que es lo correcto para `aria-expanded`, `aria-selected`, `aria-pressed`. Usa booleanos para estos.
- IDs únicos para `aria-labelledby`/`aria-describedby`/`for`: `useId()` (Vue 3.5+), estable también en SSR.

## Eventos de teclado

- Modificadores `@keydown.enter`, `@keydown.esc`, `@keydown.space.prevent`, `@keydown.up/down`.
- No pongas `@click` en elementos no interactivos; si lo haces por necesidad, añade rol, `tabindex` y manejo de teclado.

## Librerías

- **Reka UI** (antes Radix Vue) y **Headless UI**: dialog, menu, tabs, combobox, listbox accesibles.
- PrimeVue/Vuetify: revisan accesibilidad, pero verifica la configuración (etiquetas, `aria-label` en botones de icono) en cada uso.
