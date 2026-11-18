---
name: performance
description: Mide, optimiza y audita el rendimiento web del frontend (Vue, React, Angular). Cubre Core Web Vitals (LCP, INP, CLS) con datos de campo y de laboratorio, tamaño del bundle y code splitting, imágenes, fuentes, scripts de terceros, caché y compresión de assets, tareas largas en el hilo principal, virtualización de listas y presupuestos de rendimiento en CI. Úsala cuando la app carga lento, responde con retraso a los clics, la página salta al cargar, el bundle crece o hay que preparar un release con objetivos de rendimiento. No la uses para fugas de memoria o re-renders por estado mal ubicado (state-management) ni para estrategia de render SSR/SSG (rendering-and-seo).
---

# Rendimiento web

El rendimiento se mide en lo que percibe el usuario: **cuánto tarda en ver el contenido principal (LCP), cuánto tarda la página en responder cuando interactúa (INP) y cuánto se mueve el contenido mientras carga (CLS)**. Primero se mide, luego se optimiza lo que más pesa, y luego se protege con un presupuesto.

## Cuándo usarla

- La app tarda en mostrar contenido, sobre todo en móvil o redes lentas.
- Clics y teclas responden con retraso; scroll a tirones.
- El contenido salta mientras carga.
- El bundle de JavaScript ha crecido sin control.
- Preparar un release o una landing con objetivos de Core Web Vitals.

**No es para:** fugas de memoria, re-renders por estado mal ubicado o reactividad → `state-management` · elegir entre CSR/SSR/SSG → `rendering-and-seo` · peticiones duplicadas o en cascada → `data-fetching` · rendimiento del backend o de la base de datos → dominios backend/database.

## Objetivos (percentil 75 de usuarios reales)

| Métrica | Bueno | Necesita mejora | Malo | Mide |
| :--- | :--- | :--- | :--- | :--- |
| **LCP** (Largest Contentful Paint) | ≤ 2.5 s | ≤ 4 s | > 4 s | Carga del contenido principal |
| **INP** (Interaction to Next Paint) | ≤ 200 ms | ≤ 500 ms | > 500 ms | Respuesta a interacciones (sustituyó a FID en 2024) |
| **CLS** (Cumulative Layout Shift) | ≤ 0.1 | ≤ 0.25 | > 0.25 | Estabilidad visual |

Métricas de apoyo: TTFB (respuesta del servidor), FCP (primer contenido), TBT (bloqueo del hilo principal en laboratorio).

## Paso 0: contexto (ambos modos)

1. Detecta framework, bundler (Vite, webpack, Next/Turbopack, Angular CLI/esbuild) y estrategia de render. Carga [vue.md](references/vue.md), [react.md](references/react.md) o [angular.md](references/angular.md).
2. Averigua qué hay medido: ¿RUM (`web-vitals`, Sentry, Datadog, Vercel Analytics)?, ¿CrUX?, ¿Lighthouse CI?, ¿presupuestos de bundle?
3. Identifica las páginas que importan (entrada principal, landing, checkout) y el dispositivo objetivo (casi siempre: móvil de gama media con red 4G lenta).

## Modo Construir / Optimizar

1. **Mide primero** (ver [patterns.md § Medir](references/patterns.md#medir)): laboratorio para diagnosticar, campo para saber qué sufren los usuarios. Sin línea base no hay optimización, solo cambios.
2. **Ataca la métrica peor y su causa principal:**
   - LCP → recurso LCP descubierto pronto y priorizado, sin bloqueo de render, TTFB bajo.
   - INP → tareas largas fuera del hilo principal o troceadas, handlers ligeros, menos trabajo de render.
   - CLS → espacio reservado para todo lo que carga tarde.
3. **Reduce el JavaScript**: análisis del bundle, code splitting por ruta, imports dinámicos de librerías pesadas, sustituir dependencias grandes.
4. **Optimiza recursos**: imágenes (formato, tamaño, lazy), fuentes (woff2, subset, preload), terceros (diferir o fachada), caché y compresión.
5. **Verifica** con la misma medición que la línea base y **protege con presupuestos** en CI (size-limit, Lighthouse CI, budgets de Angular).
6. Entrega según [output-formats.md § Construir](../../standards/output-formats.md#modo-construir) con métricas antes/después.

## Modo Auditar

1. Mide las páginas clave (Lighthouse en modo móvil, DevTools Performance con CPU 4× y red lenta, datos de campo si existen).
2. Analiza el bundle (visualizador del bundler) y el waterfall de red.
3. Recorre [checklist.md](references/checklist.md).
4. Clasifica con [severity.md](../../standards/severity.md) y entrega según [output-formats.md § Auditar](../../standards/output-formats.md#modo-auditar) con código `FE-PERF`, incluyendo las métricas medidas y el entorno de medición.

## Principios

1. **Medir antes y después.** Cada optimización se justifica con un número.
2. **Datos de campo mandan.** Lighthouse en un portátil potente no es el usuario con un móvil de gama media.
3. **El JavaScript es el recurso más caro:** se descarga, se parsea, se compila y se ejecuta en el hilo principal. El mejor código es el que no se envía.
4. **Prioriza lo que ve el usuario primero;** difiere todo lo demás.
5. **El hilo principal es compartido:** ninguna tarea debería pasar de ~50 ms.
6. **Reserva el espacio** de todo lo que llega tarde.
7. **Un presupuesto en CI evita regresiones** mejor que cualquier auditoría puntual.

## Referencias

| Archivo | Cuándo cargarlo |
| :--- | :--- |
| [patterns.md](references/patterns.md) | Siempre: medición y técnicas por métrica. |
| [checklist.md](references/checklist.md) | Modo Auditar. |
| [vue.md](references/vue.md) · [react.md](references/react.md) · [angular.md](references/angular.md) | Según el stack. |

## Skills relacionadas

- `rendering-and-seo`: SSR/SSG/streaming como palanca para LCP; coste de hidratación.
- `state-management`: re-renders y memoria.
- `data-fetching`: cascadas de peticiones, prefetch, caché de datos.
- `design-system`: CLS en componentes, animaciones con `transform`/`opacity`, sistema de iconos.
- `routing`: lazy loading y prefetch de rutas.
- `observability`: Core Web Vitals de campo por ruta y release.
- `tooling`: presupuestos de tamaño y Lighthouse CI en el pipeline.
