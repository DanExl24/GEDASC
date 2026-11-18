# Patrones de rendimiento

## Medir

### Laboratorio (diagnóstico reproducible)
- **Lighthouse** (DevTools o CLI) en modo **móvil**; repite 3–5 veces y usa la mediana.
- **DevTools → Performance**: graba la carga y las interacciones con CPU 4× más lenta y red "Fast 4G"/"Slow 4G". Busca tareas largas (barras rojas), el elemento LCP (marcador en la línea de tiempo) y los layout shifts.
- **DevTools → Network**: waterfall, prioridades, tamaños transferidos, caché.
- WebPageTest para pruebas en dispositivos y ubicaciones reales.

### Campo (lo que sufren los usuarios)
```ts
import { onCLS, onINP, onLCP } from 'web-vitals'

function send(metric: { name: string; value: number; id: string; rating: string }) {
  navigator.sendBeacon('/analytics/vitals', JSON.stringify(metric))
}
onLCP(send); onINP(send); onCLS(send)
```
- Para depurar INP en campo usa la build de atribución (`web-vitals/attribution`): indica qué elemento e interacción fueron lentos.
- CrUX (Chrome UX Report / PageSpeed Insights) da datos de campo de sitios públicos con tráfico suficiente.
- Compara siempre por percentil 75 y separando móvil y escritorio.

## LCP

El elemento LCP suele ser la imagen principal, un título grande o un bloque de texto. Su tiempo se descompone en: TTFB → retraso hasta que se descubre el recurso → descarga → render.

- **Descubrimiento temprano:** el recurso LCP debe estar en el HTML inicial (no inyectado por JS ni como `background-image` en CSS cargado tarde).
- **Prioridad:** `<img fetchpriority="high">` en la imagen LCP; **nunca** `loading="lazy"` en ella. `<link rel="preload">` si se descubre tarde.
- **Imágenes:** AVIF/WebP, `srcset` + `sizes` para no servir 2000 px a un móvil, CDN de imágenes con redimensionado.
- **Bloqueo de render:** CSS crítico mínimo; JS no esencial con `defer`/`type="module"`; sin scripts síncronos en `<head>`.
- **TTFB:** CDN, caché de HTML en el borde cuando sea posible, SSR/SSG para contenido público (→ `rendering-and-seo`).
- **En SPA puras:** el LCP espera a que se descargue y ejecute el JS y luego a los datos. Reduce el JS inicial, precarga los datos de la primera vista, o renderiza en servidor.
- `preconnect` a orígenes críticos de terceros (CDN de imágenes, API) con moderación (2–3).

## INP

INP mide el tiempo desde la interacción hasta el siguiente frame pintado: retraso de entrada (hilo ocupado) + procesamiento de handlers + render.

- **Trocea las tareas largas** (> 50 ms) y cede el hilo:
  ```ts
  type SchedulerWithYield = { yield?: () => Promise<void> }

  function yieldToMain(): Promise<void> {
    const scheduler = (globalThis as { scheduler?: SchedulerWithYield }).scheduler
    return scheduler?.yield ? scheduler.yield() : new Promise((resolve) => setTimeout(resolve, 0))
  }

  async function processInChunks<T>(items: T[], fn: (item: T) => void) {
    for (const [i, item] of items.entries()) {
      fn(item)
      if (i % 200 === 199) await yieldToMain()   // cede el hilo cada 200 elementos
    }
  }
  ```
- **Feedback inmediato y trabajo después:** actualiza la UI (estado pulsado, spinner) y difiere el trabajo pesado (React `useTransition`/`useDeferredValue`; en otros frameworks, `requestAnimationFrame` + `setTimeout`).
- **Debounce** en búsquedas y filtros en vivo; no recalcules en cada tecla.
- **Menos DOM y menos render:** virtualiza listas largas; evita re-renders de árboles grandes (→ `state-management`).
- **Web Workers** para cálculo pesado (parseo de ficheros, filtros sobre miles de filas, criptografía).
- **Layout thrashing:** no alternes lecturas (`offsetHeight`, `getBoundingClientRect`) y escrituras de estilo en bucle; agrupa lecturas y luego escrituras.
- **Terceros:** scripts de analítica, chat o tests A/B suelen dominar el hilo principal. Difiérelos.

## CLS

- Imágenes, vídeos, iframes y avatares con `width`/`height` o `aspect-ratio`.
- Espacio reservado para contenido tardío: banners, anuncios, embeds, avisos de cookies (mejor superpuestos que empujando).
- Skeletons del mismo tamaño que el contenido final.
- No insertar contenido por encima del que el usuario está viendo (salvo en respuesta a su interacción).
- **Fuentes:** `font-display: swap` + `size-adjust`/`ascent-override` en la fuente de respaldo para que el cambio no mueva el texto (Next/Nuxt/Angular lo automatizan con sus módulos de fuentes).
- Animaciones con `transform`, nunca con `top`/`height`.

## JavaScript y bundle

### Analizar
- Vite/Rollup: `rollup-plugin-visualizer` o `npx vite-bundle-visualizer`.
- webpack: `webpack-bundle-analyzer`. Next: `@next/bundle-analyzer`.
- Angular: `ng build --stats-json` + `esbuild` analyzer o `source-map-explorer`.
- Cualquier bundle con source maps: `npx source-map-explorer dist/**/*.js`.

### Reducir
- **Code splitting por ruta** (lazy routes) como mínimo; cada ruta carga solo lo suyo.
- **Imports dinámicos** de librerías pesadas usadas en pocos sitios (editores de texto rico, gráficos, mapas, PDF, Excel): `const { jsPDF } = await import('jspdf')` al usarlas.
- **Dependencias grandes:** `moment` → `date-fns`/`dayjs`/`Intl`; `lodash` → `lodash-es` con imports individuales o nativo; librerías de iconos importadas completas → imports por icono.
- **Tree-shaking:** ESM, `sideEffects: false` en paquetes propios, sin `import * as` innecesarios, cuidado con barrels que arrastran módulos.
- **Polyfills:** target moderno (`es2020`+); no envíes polyfills a navegadores que no los necesitan.
- **Presupuesto orientativo** para el JS inicial de una página: < ~170 KB comprimido en móvil de gama media; ajústalo al proyecto, pero fija uno.

## Imágenes

- Formato moderno (AVIF/WebP) con respaldo.
- Dimensiones correctas por viewport (`srcset`/`sizes`).
- `loading="lazy"` y `decoding="async"` **por debajo del pliegue**; `fetchpriority="high"` en la imagen LCP.
- Componentes del framework: `next/image`, `<NuxtImg>`, `NgOptimizedImage`.
- SVG optimizados (SVGO); iconos en sprite o componente, no PNG.

## Fuentes

- `woff2`, subconjunto de caracteres necesarios, pocas variantes (o una fuente variable).
- `preload` solo de la fuente usada en el contenido LCP.
- Auto-hospedadas mejor que desde terceros (evita conexiones extra).
- Considera fuentes del sistema para interfaces de trabajo.

## Caché, compresión y red

- Assets con hash en el nombre: `Cache-Control: public, max-age=31536000, immutable`.
- HTML: `no-cache` (revalida) para que los despliegues se vean al momento.
- Compresión Brotli (o gzip) para texto; HTTP/2 o HTTP/3.
- Service worker para caché offline o de navegación solo si el caso lo justifica (complejidad de invalidación).

## Listas y tablas grandes

- Virtualización a partir de cientos de filas: TanStack Virtual (React/Vue/Angular), `vue-virtual-scroller`, CDK `cdk-virtual-scroll-viewport`.
- Paginación en servidor antes que cargar 10.000 filas.
- `content-visibility: auto` en secciones largas fuera de pantalla (con `contain-intrinsic-size`).

## Terceros

- Inventario de scripts de terceros y su coste (DevTools → Performance, agrupado por terceros).
- `async`/`defer`, carga tras la interacción o tras `load`.
- **Fachadas:** mostrar una imagen del chat/vídeo y cargar el widget real al hacer clic.
- Elimina los que nadie usa.

## Presupuestos en CI

```json
// package.json — size-limit
"size-limit": [{ "path": "dist/assets/index-*.js", "limit": "170 kB" }]
```

- Lighthouse CI (`@lhci/cli`) con aserciones de LCP, CLS, TBT y tamaño en las páginas clave.
- Angular: `budgets` en `angular.json` (falla el build si se superan).
- Comenta el diff de tamaño en cada PR para que el equipo vea el impacto.

## Anti-patrones

| Anti-patrón | Consecuencia | Corrección |
| :--- | :--- | :--- |
| `loading="lazy"` en la imagen principal | LCP retrasado | `fetchpriority="high"`, sin lazy |
| Todo el JS en un bundle | Carga inicial enorme | Code splitting por ruta + imports dinámicos |
| Librería de 300 KB para una función | JS innecesario | Nativo o librería pequeña |
| Imágenes sin dimensiones | CLS | `width`/`height` o `aspect-ratio` |
| Handler que procesa 10.000 elementos de una vez | INP malo | Trocear, worker, virtualizar |
| Optimizar sin medir | Esfuerzo en lo que no importa | Línea base y métrica objetivo |
| Medir solo en escritorio potente | Problemas invisibles | Móvil, CPU 4×, red lenta, datos de campo |
| Scripts de terceros síncronos en `<head>` | Bloqueo de render | `defer`/`async`/fachada |
