# Técnicas responsive por tipo de problema

Ejemplos en CSS y su equivalente en Tailwind. Verifica siempre los breakpoints reales del proyecto.

## Encontrar qué desborda

Antes de corregir, localiza el elemento culpable:

```js
// en la consola del navegador: lista elementos más anchos que el viewport
[...document.querySelectorAll('*')].filter((el) => el.getBoundingClientRect().right > document.documentElement.clientWidth + 1)
```

O temporalmente `* { outline: 1px solid red }` para ver las cajas. Culpables habituales: anchos fijos, `100vw`, imágenes sin `max-width`, palabras/URLs largas sin `break-words`, hijos flex con `min-width: auto`, márgenes negativos, elementos posicionados de forma absoluta.

## Contenedores

```css
.container { width: 100%; max-width: 80rem; margin-inline: auto; padding-inline: clamp(1rem, 3vw, 2rem); }
```

`w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`

- Nunca `width: 900px` en un contenedor; si hace falta un mínimo, `min-width` con cuidado y `max-width: 100%`.
- `100vw` incluye la barra de scroll vertical en escritorio y provoca scroll horizontal: usa `100%`.
- Paddings laterales escalonados: grandes en desktop, 16 px en móvil.

## Flexbox que aplasta o desborda

```css
.row { display: flex; flex-wrap: wrap; gap: 1rem; }
.row > .text { min-width: 0; flex: 1 1 16rem; }   /* min-width: 0 permite encoger texto largo */
.row > .avatar { flex-shrink: 0; }                 /* lo que no debe aplastarse */
```

`flex flex-wrap gap-4` · `min-w-0 flex-1` · `shrink-0`

- **Header con título y botones:** `flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between`.
- Por defecto un hijo flex no encoge por debajo de su contenido (`min-width: auto`): es la causa nº 1 de desbordes con texto largo.

## Grids que se adaptan

```css
.grid-auto { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(min(16rem, 100%), 1fr)); }
```

- `auto-fit` + `minmax(min(X, 100%), 1fr)` adapta las columnas sin breakpoints y sin desbordar en pantallas más estrechas que `X`.
- Con breakpoints: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4`.

## Container queries

Cuando el componente vive en sitios de ancho distinto (sidebar, columna principal), adapta por el ancho del contenedor, no del viewport:

```css
.card-wrapper { container-type: inline-size; }
@container (min-width: 32rem) { .card { display: grid; grid-template-columns: 8rem 1fr; } }
```

Tailwind v4: `@container` en el padre y `@md:grid-cols-2` en el hijo (en v3, plugin `@tailwindcss/container-queries`).

## Tablas

El scroll horizontal **dentro de su contenedor** es una solución válida cuando el formato tabular es esencial. El defecto es que desborde la página.

```html
<div class="w-full overflow-x-auto rounded-lg border">
  <table class="min-w-full">
    <thead><tr><th class="whitespace-nowrap">…</th></tr></thead>
    …
  </table>
</div>
```

- La columna de acciones siempre alcanzable: fija a la derecha (`sticky right-0` con fondo) o como primera columna.
- La primera columna identificativa puede fijarse a la izquierda (`sticky left-0`).
- Encabezados con `whitespace-nowrap` o anchos mínimos para que no se deformen.
- **No** conviertas la tabla en tarjetas: eso es un cambio de diseño (→ `ux-review`), salvo que el usuario lo pida.

## Modales y drawers

```html
<div class="fixed inset-0 grid place-items-center p-2 sm:p-4">
  <div class="flex max-h-[90dvh] w-full flex-col sm:max-w-lg">   <!-- dvh: respeta las barras del navegador móvil -->
    <header class="shrink-0">…</header>
    <div class="flex-1 overflow-y-auto">…</div>                  <!-- solo el cuerpo hace scroll -->
    <footer class="shrink-0 border-t">…</footer>                 <!-- acciones siempre visibles -->
  </div>
</div>
```

- Nunca alturas fijas (`height: 600px`) en modales.
- `dvh`/`svh` en lugar de `vh` en móvil (en `vh` las barras del navegador tapan el pie). Añade `vh` como respaldo si hay que soportar navegadores antiguos.
- Drawers laterales: `w-full sm:max-w-md` y altura completa con scroll interno.

## Formularios

- Columnado progresivo: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4`.
- Campos que van juntos (prefijo + teléfono, tipo + número de documento) pueden seguir en 2 columnas en móvil: `grid grid-cols-[6rem_1fr]`.
- Barra de acciones: botones a ancho completo y apilados en móvil si chocan (`flex flex-col-reverse gap-2 sm:flex-row sm:justify-end`).
- Filtros con muchos controles: `flex flex-wrap gap-2` o grid; nunca desbordando el header.

## Dashboards y gráficos

- KPIs: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4`; en móvil evita 20 tarjetas a una columna si dos caben (`grid-cols-2` con tarjetas compactas), sin cambiar su diseño.
- Gráficos: contenedor con ancho fluido y alto definido (`h-64 sm:h-80`), y el gráfico se redimensiona con `ResizeObserver` (ECharts: `chart.resize()`; Chart.js: `responsive: true` con contenedor de tamaño definido). Desconecta el observer al desmontar.

## Textos largos

- `overflow-wrap: anywhere` / `break-words` para nombres, emails y URLs largos.
- `truncate` o `line-clamp-2` solo si el texto completo está accesible de otra forma (tooltip, detalle); nunca en datos legales o críticos.
- `hyphens: auto` con `lang` correcto para textos en columnas estrechas.

## Alturas reducidas

- Headers y footers fijos restan altura: en `1366 × 768` ≈ 650 px útiles, en `1280 × 720` ≈ 600 px.
- Paneles con altura `calc(100dvh - var(--header-h))` y scroll interno.
- Media queries de altura para casos extremos: `@media (max-height: 760px) { … }` (Tailwind: variante personalizada `max-h-[760px]:` vía `@custom-variant` o `screens: { short: { raw: '(max-height: 760px)' } }`).

## Shell de la aplicación

- Sidebar: visible en `lg+`; por debajo, oculto y accesible desde un botón (si el diseño ya contempla ese comportamiento; si no existe, crearlo es nivel 5 y requiere aprobación).
- Contenido principal con `min-w-0` para que no lo empuje un hijo ancho.
- Header: el nombre largo del usuario o de la organización se trunca antes que desplazar notificaciones o avatar.

## Imágenes y medios

```css
img, video { max-width: 100%; height: auto; }
```

Con `width`/`height` o `aspect-ratio` para evitar saltos de layout.

## Objetivos táctiles

En viewports táctiles, controles de al menos 24×24 px (WCAG 2.5.8), recomendado 44×44: aumenta el área con padding sin cambiar el tamaño visual del icono.
