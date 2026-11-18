# Checklist de auditoría — rendimiento

Severidad orientativa entre corchetes según impacto en páginas clave ([severity.md](../../../standards/severity.md)). Anota siempre el entorno de medición (laboratorio/campo, dispositivo, red).

## 1. Medición

- [ ] Hay datos de campo (RUM con `web-vitals` o similar, o CrUX) de las páginas clave. **[LOW]** si no existen.
- [ ] Hay una línea base de laboratorio reproducible (Lighthouse móvil, mediana de varias ejecuciones).
- [ ] Existe algún presupuesto de rendimiento en CI (tamaño de bundle, Lighthouse CI, budgets). **[LOW–MEDIUM]**

## 2. Core Web Vitals (p75)

- [ ] LCP ≤ 2.5 s. **[HIGH]** si > 4 s en páginas de entrada o conversión; **[MEDIUM]** entre 2.5 y 4 s.
- [ ] INP ≤ 200 ms. **[HIGH]** si > 500 ms en interacciones principales.
- [ ] CLS ≤ 0.1. **[MEDIUM]**; **[HIGH]** si provoca clics erróneos (botones que se mueven).

## 3. LCP

- [ ] El recurso LCP está en el HTML inicial o precargado. **[MEDIUM]**
- [ ] La imagen LCP tiene `fetchpriority="high"` y no tiene `loading="lazy"`. **[MEDIUM]**
- [ ] No hay CSS o JS síncrono bloqueando el render innecesariamente. **[MEDIUM]**
- [ ] TTFB razonable (< ~800 ms); HTML servido desde CDN o caché cuando es posible. **[MEDIUM]**

## 4. JavaScript

- [ ] Hay code splitting por ruta. **[MEDIUM]**; **[HIGH]** si todo el código de la app se descarga en la primera carga de una app grande.
- [ ] Librerías pesadas de uso puntual se cargan bajo demanda. **[MEDIUM]**
- [ ] No hay dependencias sobredimensionadas o duplicadas (dos librerías de fechas, varias versiones de la misma). **[LOW–MEDIUM]**
- [ ] El JS inicial está dentro del presupuesto fijado. **[MEDIUM]**
- [ ] No se envían polyfills innecesarios para los navegadores objetivo. **[LOW]**
- [ ] Source maps de producción no se sirven públicamente si no hace falta (también es un tema de `security`). **[LOW]**

## 5. Hilo principal e interacción

- [ ] No hay tareas largas (> 50 ms) en las interacciones principales; el trabajo pesado se trocea o va a un worker. **[MEDIUM–HIGH]**
- [ ] Búsquedas y filtros en vivo usan debounce. **[LOW–MEDIUM]**
- [ ] Listas de cientos o miles de elementos se virtualizan o paginan. **[MEDIUM]**; **[HIGH]** si congelan la página.
- [ ] Sin layout thrashing (lecturas y escrituras de layout intercaladas en bucles). **[MEDIUM]**

## 6. Recursos

- [ ] Imágenes en formato moderno y con tamaños por viewport. **[MEDIUM]**
- [ ] Imágenes fuera del pliegue con lazy loading. **[LOW–MEDIUM]**
- [ ] Imágenes, iframes y embeds con dimensiones reservadas. **[MEDIUM]**
- [ ] Fuentes en woff2, subconjunto, pocas variantes y sin salto de layout al cargar. **[LOW–MEDIUM]**
- [ ] Assets con hash cacheados como `immutable`; HTML revalidado. **[MEDIUM]**
- [ ] Compresión Brotli/gzip activa. **[MEDIUM]**

## 7. Terceros

- [ ] Inventario de scripts de terceros con su coste. **[INFO]**
- [ ] Scripts de terceros diferidos o con fachada; ninguno síncrono en `<head>` sin necesidad. **[MEDIUM]**
- [ ] No hay scripts de terceros sin uso. **[LOW]**

## Cómo inspeccionar rápido

- `npx lighthouse <url> --form-factor=mobile --view` (o desde DevTools).
- Visualizador del bundle del proyecto (ver [patterns.md § Analizar](patterns.md#analizar)).
- Buscar `loading="lazy"` en la imagen principal del hero y `<img` sin `width`/`height`.
- Buscar imports estáticos de librerías pesadas (`chart.js`, `echarts`, `xlsx`, `jspdf`, `monaco`, `quill`, `mapbox`, `moment`) en componentes de rutas iniciales.
- Rutas definidas con `component: Page` en lugar de import dinámico.
