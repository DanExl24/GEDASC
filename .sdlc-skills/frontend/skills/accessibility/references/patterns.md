# Patrones accesibles

Basados en la ARIA Authoring Practices Guide (APG) del W3C. Si el proyecto usa una librería headless (Radix, Reka UI, React Aria, Headless UI, Angular CDK), úsala: implementa estos patrones y está probada con lectores de pantalla.

## Botón vs enlace

- **Navega a otra URL** → `<a href="…">`.
- **Ejecuta una acción** en la página → `<button type="button">`.
- Nunca `<a>` sin `href` ni `<div @click>` como botón.

Si no hay más remedio que un elemento no nativo:

```html
<div role="button" tabindex="0" aria-pressed="false"
     @click="toggle" @keydown.enter.prevent="toggle" @keydown.space.prevent="toggle">
```

(Y aun así, preferir `<button>`.)

## Botón de solo icono

```html
<button type="button" aria-label="Cerrar diálogo">
  <XIcon aria-hidden="true" />
</button>
```

Si hay tooltip visible con el mismo texto, el `aria-label` debe coincidir (WCAG 2.5.3).

## Modal (dialog)

Opción recomendada: el elemento nativo `<dialog>` con `showModal()`. Da foco confinado, `Escape` y fondo inerte de serie.

```html
<button type="button" @click="open" ref="trigger">Eliminar cuenta</button>

<dialog ref="dialog" aria-labelledby="dlg-title" @close="onClose">
  <h2 id="dlg-title">¿Eliminar la cuenta?</h2>
  <p>Esta acción no se puede deshacer.</p>
  <button type="button" @click="dialog.close()">Cancelar</button>
  <button type="button" class="danger" @click="confirm">Eliminar</button>
</dialog>
```

```ts
function open() { dialog.value.showModal() }               // foco al primer enfocable (o al que tenga autofocus)
function onClose() { trigger.value.focus() }               // devolver el foco al disparador
```

Requisitos si se implementa a mano:
1. `role="dialog"` + `aria-modal="true"` + `aria-labelledby` (y `aria-describedby` si hay descripción).
2. Al abrir: foco al primer elemento útil (en confirmaciones destructivas, al botón seguro "Cancelar").
3. `Tab`/`Shift+Tab` circulan dentro del modal.
4. `Escape` cierra.
5. El resto de la página es inerte (`inert` en el contenedor principal) y no hace scroll.
6. Al cerrar: foco al elemento que lo abrió (o a uno lógico si ya no existe).

## Disclosure / acordeón

```html
<h3>
  <button type="button" :aria-expanded="open" aria-controls="sec-1" @click="open = !open">
    Datos de facturación
  </button>
</h3>
<div id="sec-1" :hidden="!open">…</div>
```

`<details><summary>` es la alternativa nativa para casos simples.

## Menú desplegable (menu button)

- Botón con `aria-haspopup="menu"`, `aria-expanded`, `aria-controls`.
- Lista con `role="menu"` y elementos `role="menuitem"`.
- Al abrir, foco al primer elemento; `↑`/`↓` mueven, `Home`/`End`, `Escape` cierra y devuelve el foco al botón; `Tab` cierra el menú.
- **Ojo:** `role="menu"` es para menús de acciones tipo aplicación. Para navegación del sitio, usa una lista de enlaces con un botón disclosure; no `menu`/`menuitem`.

## Tabs

```html
<div role="tablist" aria-label="Ajustes de la cuenta">
  <button role="tab" id="t-1" aria-selected="true" aria-controls="p-1" tabindex="0">Perfil</button>
  <button role="tab" id="t-2" aria-selected="false" aria-controls="p-2" tabindex="-1">Seguridad</button>
</div>
<div role="tabpanel" id="p-1" aria-labelledby="t-1" tabindex="0">…</div>
<div role="tabpanel" id="p-2" aria-labelledby="t-2" tabindex="0" hidden>…</div>
```

- Solo la pestaña activa en el orden de tabulación (roving tabindex).
- `←`/`→` cambian de pestaña; `Home`/`End` a la primera/última.

## Combobox (autocompletado)

- `input` con `role="combobox"`, `aria-expanded`, `aria-controls` (al listbox), `aria-autocomplete="list"` y `aria-activedescendant` (opción resaltada).
- Listbox `role="listbox"` con `role="option"` y `aria-selected`.
- `↓` abre/avanza, `↑` retrocede, `Enter` selecciona, `Escape` cierra (y si ya está cerrado, limpia).
- Anuncia el número de resultados en una región `role="status"`.
- Es el patrón más difícil de hacer bien: usa una librería siempre que se pueda.

## Regiones live

```html
<!-- presente en el DOM desde el inicio; se cambia su contenido -->
<div role="status" aria-live="polite" class="sr-only">{{ statusMessage }}</div>
<div role="alert">{{ criticalError }}</div>
```

- La región debe existir **antes** de cambiar el mensaje; insertarla ya con texto no siempre se anuncia.
- `polite` para confirmaciones y resultados; `assertive`/`alert` solo para errores que requieren atención inmediata.
- Un gestor centralizado de anuncios (un componente o servicio `announce(message)`) evita regiones duplicadas.

## Cambio de ruta en SPA

```ts
router.afterEach((to) => {
  document.title = `${to.meta.title} · MiApp`
  nextTick(() => {
    const h1 = document.querySelector('main h1') as HTMLElement | null
    h1?.setAttribute('tabindex', '-1')
    h1?.focus()                                  // el lector anuncia el nuevo título
  })
})
```

Alternativa: anunciar "Página: X" en una región live sin mover el foco. Elige una estrategia y aplícala en todas las rutas.

## Enlace para saltar al contenido

```html
<a href="#main" class="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2">Saltar al contenido principal</a>
…
<main id="main" tabindex="-1">…</main>
```

## Texto solo para lectores de pantalla

```css
.sr-only {
  position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0;
}
```

No uses `display: none` ni `visibility: hidden` para texto que debe leerse: lo ocultan también a los lectores.

## Formularios

```html
<label for="email">Email <span aria-hidden="true">*</span><span class="sr-only">(obligatorio)</span></label>
<input id="email" type="email" autocomplete="email" required
       aria-invalid="true" aria-describedby="email-hint email-error" />
<p id="email-hint">Usaremos este email para enviarte las facturas.</p>
<p id="email-error">Introduce un email válido, por ejemplo nombre@empresa.com</p>
```

- Al enviar con errores: foco al primer campo inválido, o a un resumen de errores con enlaces a cada campo.
- Más detalle en la skill `forms`.

## Foco visible y no oculto

```css
:focus-visible { outline: 2px solid var(--color-focus-ring); outline-offset: 2px; }
html { scroll-padding-top: 5rem; }    /* altura del header fijo: el foco no queda tapado (2.4.11) */
```

## Movimiento reducido

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

Mejor aún: animaciones no esenciales solo dentro de `@media (prefers-reduced-motion: no-preference)`.

## Drag & drop con alternativa (2.5.7)

Reordenar listas: además del arrastre, botones "Subir"/"Bajar" o un menú "Mover a…", y soporte de teclado (seleccionar con `Espacio`, mover con flechas, anunciar la nueva posición).
