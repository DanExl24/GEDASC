# Render y SEO — notas React / Next.js / React Router

## Next.js App Router

- **Estático por defecto** cuando la ruta no usa datos dinámicos (cookies, headers, `searchParams`) ni fetch sin caché.
- Rutas dinámicas prerenderizadas: `generateStaticParams()`.
- Revalidación: `export const revalidate = 3600` en la ruta, `fetch(url, { next: { revalidate, tags } })` y `revalidateTag()`/`revalidatePath()` tras mutaciones. El comportamiento de caché por defecto ha cambiado entre versiones de Next: compruébalo en la del proyecto y declara la intención explícitamente.
- Forzar dinámico: `export const dynamic = 'force-dynamic'` o leer `cookies()`/`headers()`.
- Streaming: `loading.tsx` y `<Suspense>` alrededor de las partes lentas.
- 404 real: `notFound()` en la página + `not-found.tsx`. Redirecciones: `redirect()`/`permanentRedirect()` o `redirects` en `next.config`.

### Metadatos

```tsx
// app/productos/[slug]/page.tsx
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const product = await getProduct(slug)
  return {
    title: `${product.name} · Tienda`,
    description: product.summary,
    alternates: { canonical: `/productos/${slug}` },
    openGraph: { title: product.name, images: [product.ogImage] },
  }
}
```

- `metadataBase` en el layout raíz para que las URLs relativas se resuelvan a absolutas.
- `app/sitemap.ts` y `app/robots.ts` generan los archivos del sitio.
- JSON-LD: `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />` (el `replace` evita cerrar el script con contenido malicioso).
- `opengraph-image.tsx` para generar imágenes OG dinámicas.

### Server Components y seguridad

- Lo que un Server Component pasa como prop a un Client Component se serializa en el HTML: pasa solo los campos necesarios, no el objeto de usuario completo.
- `import 'server-only'` en módulos con secretos o acceso a base de datos.

## React Router v7 (framework mode) / Remix

- `loader` en servidor por ruta; `export const meta` para metadatos; `headers` para caché por ruta.
- Prerender de rutas estáticas con la opción `prerender` de la configuración.
- 404: lanzar `data(null, { status: 404 })` (o una `Response` con 404) desde el loader y manejarlo en el `ErrorBoundary`.

## React 19 sin framework

- `<title>`, `<meta>` y `<link>` renderizados en cualquier componente se elevan al `<head>`; útil en SPA, pero sigue siendo render en cliente (sin SEO fiable para páginas públicas).
- Para contenido público: prerender (Vite + plugin de prerender) o un meta-framework.

## Hidratación

- React muestra el diff del mismatch en consola (React 19 con más detalle).
- `useId()` para IDs; `suppressHydrationWarning` solo en el elemento concreto con una diferencia intencionada (por ejemplo, una marca de tiempo), nunca en contenedores grandes.
- Contenido solo de cliente: estado `mounted` tras `useEffect`, o `next/dynamic` con `ssr: false` en componentes cliente.
