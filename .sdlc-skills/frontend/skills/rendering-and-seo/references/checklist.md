# Checklist de auditoría — render y SEO técnico

Severidad orientativa entre corchetes ([severity.md](../../../standards/severity.md)). Para el SEO, la severidad depende de cuánto tráfico orgánico importa al negocio; en un panel interno, la mayoría de puntos de SEO no aplican (⚪).

## 1. Estrategia de render

- [ ] Cada tipo de página usa una estrategia adecuada a si es indexable, personalizada y cambiante. **[MEDIUM–HIGH]** si contenido público clave depende solo de CSR.
- [ ] El contenido indexable está en el HTML que devuelve el servidor (`curl -s <url>`). **[HIGH]** en sitios que dependen de tráfico orgánico.
- [ ] Las páginas privadas no pagan el coste de SSR sin justificación medida. **[INFO–LOW]**

## 2. Hidratación

- [ ] Sin avisos de hydration mismatch en consola. **[MEDIUM]**; **[HIGH]** si provocan contenido incorrecto o pérdida de interactividad.
- [ ] Fechas, aleatorios, IDs y APIs del navegador no difieren entre servidor y cliente en el primer render.
- [ ] El estado obtenido en servidor se transfiere al cliente (sin doble petición). **[LOW–MEDIUM]**
- [ ] HTML válido (sin bloques dentro de párrafos, etc.). **[LOW]**

## 3. Aislamiento y caché en SSR

- [ ] Stores, clientes de caché y contextos se crean por petición. **[CRITICAL]** si hay singletons con datos de usuario.
- [ ] Respuestas con datos personales no se cachean públicamente (CDN). **[CRITICAL]**
- [ ] Contenido público cacheado con una política explícita (s-maxage, stale-while-revalidate, revalidación). **[LOW–MEDIUM]**
- [ ] Solo variables públicas llegan al cliente; sin secretos en el bundle ni en el estado serializado. **[CRITICAL]** si hay secretos expuestos.

## 4. Metadatos por página

- [ ] `<title>` único y descriptivo en cada página indexable. **[MEDIUM]**
- [ ] `meta description` única. **[LOW]**
- [ ] `canonical` correcto (sin parámetros de seguimiento, apuntando a la versión preferida). **[MEDIUM]**
- [ ] Open Graph / Twitter Card con imagen absoluta en las páginas que se comparten. **[LOW–MEDIUM]**
- [ ] Metadatos presentes en el HTML del servidor, no solo tras ejecutar JS. **[MEDIUM]**
- [ ] `noindex` en páginas que no deben indexarse (búsqueda interna, staging, resultados vacíos). **[MEDIUM]**; **[HIGH]** si staging está indexado.

## 5. Estructura y contenido técnico

- [ ] Un `h1` por página y encabezados jerárquicos. **[LOW]**
- [ ] Imágenes de contenido con `alt`. **[LOW]** (y → `accessibility`).
- [ ] Datos estructurados válidos donde aplican (producto, artículo, breadcrumbs, organización). **[LOW–MEDIUM]**
- [ ] Contenido de `lang` correcto en `<html>`; `hreflang` recíproco en sitios multi-idioma. **[MEDIUM]** en sitios multi-idioma.

## 6. URLs, enlaces y códigos de estado

- [ ] History mode, sin hash routing en páginas públicas. **[HIGH]** si el contenido público usa hash.
- [ ] Enlaces internos con `<a href>` rastreables. **[MEDIUM]**
- [ ] URLs inexistentes devuelven 404 real (sin soft 404). **[MEDIUM]**
- [ ] Contenido movido redirige con 301. **[MEDIUM]** en migraciones.
- [ ] Una sola versión del dominio y protocolo (HTTPS, con/sin `www`) con redirección. **[MEDIUM]**
- [ ] Paginación con URLs propias. **[LOW]**

## 7. Sitio

- [ ] `sitemap.xml` actualizado con URLs canónicas y referenciado en `robots.txt`. **[LOW–MEDIUM]**
- [ ] `robots.txt` no bloquea recursos necesarios para renderizar (JS/CSS) ni páginas que deberían indexarse. **[HIGH]** si bloquea el sitio.
- [ ] Core Web Vitals en verde (→ `performance`).

## Cómo inspeccionar rápido

- HTML del servidor: `curl -s https://sitio/pagina | grep -iE '<title>|name="description"|rel="canonical"|og:|application/ld\+json|noindex'`.
- Código de estado de una URL inexistente: `curl -s -o /dev/null -w '%{http_code}' https://sitio/no-existe`.
- Consola del navegador: avisos de hidratación.
- Buscar en código: `localStorage`/`window` en el cuerpo de componentes renderizados en servidor; `Date.now()`/`Math.random()` en plantillas; variables de módulo con datos en código de servidor; `createWebHashHistory`/`HashRouter`/`useHash: true`.
