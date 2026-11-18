# Rendimiento — notas Vue / Nuxt

## Code splitting

- Rutas: `component: () => import('./pages/OrdersPage.vue')`.
- Componentes pesados: `defineAsyncComponent(() => import('./RichEditor.vue'))`, con `loadingComponent` y `errorComponent` si tardan.
- Nuxt: los componentes con prefijo `Lazy` (`<LazyRichEditor />`) se cargan bajo demanda; las páginas ya se dividen por ruta.
- Nuxt 3.16+ / 4: hidratación diferida de componentes (`hydrate-on-visible`, `hydrate-on-idle`, `hydrate-on-interaction`) en componentes `Lazy*`.

## Render

- `v-memo` en filas de listas grandes cuyo contenido depende de pocos valores.
- `v-once` para contenido estático que nunca cambia.
- `shallowRef` / `markRaw` para datasets grandes e instancias de librerías (evita proxies profundos).
- `computed` en lugar de métodos en plantillas para cálculos costosos (se cachean).
- `v-show` para elementos que alternan a menudo; `v-if` para los que rara vez se muestran.
- `<KeepAlive>` (con `max`) para vistas que se visitan una y otra vez y son caras de montar.
- Props estables: pasar objetos nuevos en cada render provoca actualizaciones de hijos.

## Listas grandes

`vue-virtual-scroller` o `@tanstack/vue-virtual`; en Nuxt, solo en cliente (`<ClientOnly>`) si la librería no soporta SSR.

## Imágenes y fuentes (Nuxt)

- `@nuxt/image`: `<NuxtImg>` / `<NuxtPicture>` con formatos modernos, `sizes` y proveedor de CDN; `preload` y `fetchpriority="high"` en la imagen principal.
- `@nuxt/fonts`: auto-hospeda fuentes y genera métricas de respaldo para evitar CLS.
- `@nuxt/scripts`: carga de scripts de terceros con estrategias (al interactuar, en idle) y fachadas.

## Bundle

- Vite: `rollup-plugin-visualizer`; `build.rollupOptions.output.manualChunks` solo si el reparto automático es claramente malo.
- `unplugin-icons` o imports por icono en lugar de librerías completas.
- Nuxt: `npx nuxi analyze`.
