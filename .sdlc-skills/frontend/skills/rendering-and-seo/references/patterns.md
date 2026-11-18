# Patrones de render y SEO técnico

## Estrategias

| Estrategia | Qué es | Bueno para | Coste |
| :--- | :--- | :--- | :--- |
| **CSR** (SPA) | HTML vacío; el navegador descarga JS y renderiza | Paneles privados, apps muy interactivas | LCP depende del JS; sin SEO fiable |
| **SSG** / prerender | HTML generado en el build | Contenido que cambia poco (landing, docs, blog) | Rebuild para actualizar; no personalizado |
| **ISR** / revalidación | SSG que se regenera cada N segundos o bajo demanda | Catálogos, fichas, contenido semi-dinámico | Datos ligeramente desfasados (controlado) |
| **SSR** | HTML generado en cada petición | Contenido público muy cambiante o personalizado | Servidor en cada petición; TTFB |
| **Streaming SSR** | SSR que envía HTML por partes según llegan los datos | Páginas con partes rápidas y lentas | Complejidad de Suspense/boundaries |
| **Server Components** (React) | Componentes que solo se ejecutan en servidor y no envían JS | Reducir JS del cliente en apps Next.js | Modelo mental servidor/cliente |
| **Islas / hidratación parcial** | Solo se hidratan las partes interactivas | Sitios de contenido con poca interacción (Astro, `@defer` hidratación incremental, lazy hydration en Nuxt) | Comunicación entre islas |

## Elegir estrategia

| Tipo de página | ¿Indexable? | ¿Personalizada? | ¿Cambia a menudo? | Estrategia |
| :--- | :---: | :---: | :---: | :--- |
| Landing, marketing, docs | Sí | No | Poco | SSG |
| Blog, catálogo, ficha de producto | Sí | No | Algo | SSG + ISR / revalidación bajo demanda |
| Listados con filtros públicos | Sí (las combinaciones principales) | No | Sí | SSR con caché en CDN corta |
| Página pública con partes del usuario (precio con descuento, "hola, Ana") | Sí | Parcialmente | — | SSG/ISR del contenido + datos del usuario en cliente (o SSR sin caché pública) |
| Panel tras login | No | Sí | Sí | CSR (o SSR si mejora mucho la carga percibida) |
| Checkout, carrito | No | Sí | Sí | CSR o SSR sin caché |

## Hidratación

La hidratación conecta el HTML del servidor con la app del cliente. El primer render en cliente **debe producir el mismo HTML**.

Causas habituales de mismatch:
- `new Date()`, `Date.now()`, zonas horarias y formatos de locale distintos entre servidor y navegador.
- `Math.random()`, IDs generados sin la utilidad del framework (`useId`).
- Acceso a `window`, `localStorage`, `navigator`, tamaño de pantalla durante el render.
- Datos distintos entre la petición del servidor y la del cliente (no se transfirió el estado).
- HTML inválido (`<div>` dentro de `<p>`, tablas sin `<tbody>`): el navegador lo corrige y el árbol no coincide.
- Extensiones del navegador que modifican el DOM (no es un bug de la app, pero ensucia la consola).

Soluciones:
- Formatear fechas con zona horaria explícita o renderizarlas en cliente tras montar.
- Contenido solo de cliente en un componente "client only" o tras el montaje (`onMounted`, `useEffect`, `afterNextRender`).
- Transferir el estado del servidor al cliente (los meta-frameworks lo hacen con su API de datos).
- No silenciar los avisos de hidratación sin entender la causa.

## Seguridad y aislamiento en SSR

- **Estado por petición:** stores, clientes de caché (QueryClient) y contextos se crean por petición, nunca como variable de módulo (→ `state-management`, `data-fetching`). Un error aquí muestra datos de un usuario a otro.
- **Caché de páginas:** una respuesta con datos personales **nunca** con `Cache-Control: public`. Para contenido público cacheado, los datos del usuario se cargan en cliente.
- **Secretos:** solo las variables con prefijo público (`VITE_`, `NEXT_PUBLIC_`, `NUXT_PUBLIC_`/`runtimeConfig.public`) llegan al cliente; todo lo demás se queda en servidor. Revisa que no se pase un objeto completo con datos sensibles como prop a un componente de cliente: se serializa en el HTML.

## SEO técnico

### Por página
```html
<title>Zapatillas de running Modelo X · Tienda</title>                <!-- único, ~50–60 caracteres -->
<meta name="description" content="…">                                 <!-- único, ~150–160 caracteres -->
<link rel="canonical" href="https://tienda.com/zapatillas/modelo-x">   <!-- URL absoluta preferida -->
<meta property="og:title" content="…">
<meta property="og:description" content="…">
<meta property="og:image" content="https://tienda.com/og/modelo-x.jpg"><!-- 1200×630, URL absoluta -->
<meta property="og:url" content="https://tienda.com/zapatillas/modelo-x">
<meta name="twitter:card" content="summary_large_image">
```

- Un `h1` que describe la página; jerarquía de encabezados real.
- Páginas que no deben indexarse (búsqueda interna, filtros con infinitas combinaciones, resultados vacíos, entornos de staging): `<meta name="robots" content="noindex">` (y que **no** estén bloqueadas en robots.txt, o el buscador no verá el `noindex`).
- Los metadatos deben estar en el HTML del servidor; las redes sociales no ejecutan JS.

### Datos estructurados (JSON-LD)
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Modelo X",
  "image": ["https://tienda.com/img/modelo-x.jpg"],
  "offers": { "@type": "Offer", "price": "89.90", "priceCurrency": "EUR", "availability": "https://schema.org/InStock" }
}
</script>
```
Tipos frecuentes: `Organization`, `WebSite`, `BreadcrumbList`, `Product`, `Article`, `FAQPage`, `Event`, `LocalBusiness`. Deben reflejar contenido visible en la página. Escapa correctamente el JSON si incluye texto del usuario (→ `security`).

### A nivel de sitio
- `sitemap.xml` con las URLs canónicas indexables (y `lastmod` real); referenciado en `robots.txt`.
- `robots.txt`: permite el rastreo de lo público; no lo uses para "ocultar" información sensible (es público).
- `hreflang` en sitios multi-idioma, recíproco entre versiones e incluyendo `x-default`.
- HTTPS, una sola versión del dominio (con o sin `www`) con redirección 301 a la canónica.

### URLs y enlaces
- Rutas con history mode (`/productos/x`), no hash (`/#/productos/x`): los fragmentos no se indexan como páginas distintas.
- Enlaces internos con `<a href="…">` reales; un `div` con `onClick` que navega no lo sigue un buscador.
- URLs estables, en minúsculas, legibles; parámetros de seguimiento (`utm_*`) fuera del canonical.
- Paginación con URLs propias (`?page=2`) y enlaces rastreables.

### Códigos de estado
- Página inexistente → **HTTP 404** real. En una SPA servida con fallback a `index.html`, todas las URLs devuelven 200 ("soft 404"): resuélvelo con SSR/prerender o, como mínimo, `noindex` en la vista de "no encontrado".
- Contenido movido → **301** a la nueva URL (configurado en servidor/CDN o en el meta-framework).
- Errores del servidor → 5xx (no una página de error con 200).

## Anti-patrones

| Anti-patrón | Consecuencia | Corrección |
| :--- | :--- | :--- |
| Sitio de contenido público como SPA pura | Indexación lenta o incompleta, vistas previas vacías | SSG/SSR para esas páginas |
| SSR "porque sí" en un panel privado | Coste de servidor sin beneficio de SEO | CSR o justificarlo por rendimiento medido |
| Mismo `<title>` en todas las páginas | Resultados de búsqueda indistinguibles | Título por página |
| `noindex` + bloqueo en robots.txt | El buscador no ve el `noindex` | Solo `noindex` |
| Hash routing en páginas públicas | No indexables como páginas | History mode |
| 200 en páginas inexistentes | Soft 404, contenido basura indexado | 404 real o `noindex` |
| Store o caché a nivel de módulo en SSR | **Datos de un usuario mostrados a otro** | Instancia por petición |
| HTML personalizado con caché pública | Fuga de datos en CDN | Sin caché pública o personalización en cliente |
| Variables secretas con prefijo público | Secretos en el bundle | Mover a servidor |
