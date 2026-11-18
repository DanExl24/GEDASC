---
name: rendering-and-seo
description: Elige, implementa y audita la estrategia de render y el SEO técnico del frontend (Vue/Nuxt, React/Next.js/React Router, Angular SSR). Cubre CSR, SSR, SSG, ISR, streaming, Server Components e hidratación parcial; errores de hidratación; caché de páginas renderizadas; fugas de datos y secretos en SSR; y SEO técnico (títulos y meta por página, canonical, robots, sitemap, hreflang, Open Graph, datos estructurados JSON-LD, URLs rastreables, códigos de estado reales y soft 404). Úsala al decidir la arquitectura de render, montar o revisar SSR/SSG, o cuando las páginas públicas no indexan o se comparten mal en redes. No la uses para Core Web Vitals en detalle (performance) ni para la navegación en sí (routing).
---

# Estrategia de render y SEO técnico

Dónde y cuándo se genera el HTML determina qué ve un buscador, qué tan rápido aparece el contenido y cuánto JavaScript necesita el navegador. La decisión correcta depende de **quién consume cada página**: un usuario autenticado en un panel, un buscador indexando un catálogo o una red social generando una vista previa.

## Cuándo usarla

- Arrancar un proyecto y decidir entre SPA, SSR, SSG o un meta-framework.
- Montar o migrar a SSR/SSG (Nuxt, Next.js, Angular SSR, React Router framework mode).
- Errores de hidratación ("Hydration mismatch"), parpadeos al cargar.
- Páginas públicas que no aparecen en Google, títulos repetidos, vistas previas rotas al compartir enlaces.
- Revisar el SEO técnico antes de lanzar o migrar un sitio.

**No es para:** optimizar LCP/INP/CLS en detalle → `performance` · navegación, guards y estado en la URL → `routing` · contenido, palabras clave y estrategia de marketing (fuera del alcance técnico).

## Paso 0: contexto (ambos modos)

1. Detecta framework y meta-framework, modo de render actual y dónde se despliega (CDN estática, Node, edge, serverless). Carga [vue.md](references/vue.md), [react.md](references/react.md) o [angular.md](references/angular.md).
2. Clasifica las páginas: públicas indexables (landing, catálogo, blog, fichas), públicas no indexables (búsqueda interna, carrito) y privadas (panel tras login).
3. Para auditorías de SEO, consigue la URL pública y revisa el HTML que devuelve el servidor (`curl -s <url>`), no solo el DOM tras ejecutar JS.

## Modo Construir

1. **Elige la estrategia por tipo de página** con la [matriz de decisión](references/patterns.md#elegir-estrategia). Lo habitual es un modelo híbrido: SSG/ISR para contenido público, SSR para lo público y personalizado o muy cambiante, CSR para el panel privado.
2. **Implementa el render** con las primitivas del framework (route rules, `generateStaticParams`, prerender, `RenderMode`…).
3. **Evita errores de hidratación**: nada que difiera entre servidor y cliente en el primer render (fechas, aleatorios, `window`, locale). Ver [patterns.md § Hidratación](references/patterns.md#hidratación).
4. **Protege el SSR:** estado por petición, sin datos de usuario en caché pública, sin secretos en el bundle del cliente.
5. **SEO técnico por página indexable:** `title` y `description` únicos, canonical, Open Graph, datos estructurados si aplica, enlaces `<a href>` rastreables, 404 reales. Sitemap y robots a nivel de sitio.
6. Verifica el HTML servido (`curl`), los metadatos y, si es posible, la herramienta de inspección de URL de Search Console o un validador de datos estructurados. Entrega según [output-formats.md § Construir](../../standards/output-formats.md#modo-construir).

## Modo Auditar

1. Para cada tipo de página: ¿qué estrategia usa?, ¿es la adecuada?, ¿qué HTML devuelve el servidor?
2. Revisa hidratación (consola del navegador), caché de respuestas y riesgos de fuga de datos entre usuarios.
3. Recorre [checklist.md](references/checklist.md) (render + SEO).
4. Clasifica con [severity.md](../../standards/severity.md) y entrega según [output-formats.md § Auditar](../../standards/output-formats.md#modo-auditar) con código `FE-SEO`.

## Principios

1. **La estrategia se elige por página, no por proyecto.**
2. **Lo que debe indexarse debe estar en el HTML del servidor.** Google ejecuta JS, pero tarde y no siempre; otros buscadores y las redes sociales, casi nunca.
3. **Panel privado no necesita SSR por SEO.** Si se usa SSR ahí, que sea por rendimiento percibido, no por inercia.
4. **El primer render debe ser idéntico en servidor y cliente.**
5. **En SSR, cada petición está aislada:** nada de estado de usuario en módulos compartidos ni en cachés públicas.
6. **Cada URL indexable es única, estable y devuelve el código HTTP correcto.**
7. **Los metadatos describen la página concreta**, no el sitio en general.

## Referencias

| Archivo | Cuándo cargarlo |
| :--- | :--- |
| [patterns.md](references/patterns.md) | Siempre: decisión de render, hidratación, SEO técnico. |
| [checklist.md](references/checklist.md) | Modo Auditar. |
| [vue.md](references/vue.md) · [react.md](references/react.md) · [angular.md](references/angular.md) | Según el stack. |

## Skills relacionadas

- `performance`: el render en servidor como palanca de LCP y el coste de hidratación.
- `routing`: URLs limpias, 404 y redirecciones.
- `state-management` y `data-fetching`: estado y caché por petición en SSR.
- `security`: secretos en el bundle y caché de páginas con datos personales.
- `accessibility`: HTML semántico y títulos de página, que también benefician al SEO.
- `i18n`: URLs por idioma, `hreflang` y metadatos traducidos.
