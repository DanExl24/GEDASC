# Render y SEO — notas Vue / Nuxt

## Nuxt: render híbrido por ruta

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  routeRules: {
    '/': { prerender: true },                         // SSG
    '/blog/**': { isr: 3600 },                         // regenerar como máximo cada hora (según el proveedor de despliegue)
    '/productos/**': { swr: 600 },                     // SSR con caché stale-while-revalidate
    '/app/**': { ssr: false },                         // panel privado en CSR
    '/api/**': { cors: true },
    '/precios-2024': { redirect: { to: '/precios', statusCode: 301 } },
  },
})
```

- `nuxi generate` prerenderiza todo el sitio (SSG completo) si no hace falta servidor.
- Datos: `useFetch`/`useAsyncData` transfieren el resultado del servidor al cliente (sin doble petición) y deben tener una key estable.
- Contenido solo de cliente: `<ClientOnly>` o `onMounted`.
- Errores 404 reales: `throw createError({ statusCode: 404, statusMessage: 'Producto no encontrado' })` en la página cuando el recurso no existe.

## Metadatos en Nuxt

```ts
useSeoMeta({
  title: () => `${product.value.name} · Tienda`,
  description: () => product.value.summary,
  ogTitle: () => product.value.name,
  ogImage: () => product.value.ogImage,
  twitterCard: 'summary_large_image',
})
useHead({ link: [{ rel: 'canonical', href: `https://tienda.com/productos/${slug}` }] })
```

- `app.head` en `nuxt.config` para valores por defecto y `titleTemplate`.
- Módulos: `@nuxtjs/sitemap`, `@nuxtjs/robots`, `nuxt-schema-org` (o el paquete unificado `@nuxtjs/seo`).

## Vue SPA (Vite) sin Nuxt

- Metadatos dinámicos con `@unhead/vue` (`useHead`, `useSeoMeta`), pero solo existen tras ejecutar JS: insuficiente para redes sociales y poco fiable para SEO.
- Opciones para páginas públicas: prerender en build (`vite-ssg`, plugins de prerender) o migrar esas páginas a Nuxt.
- Router en history mode (`createWebHistory`), no `createWebHashHistory`, y servidor con fallback a `index.html` (asumiendo el problema de soft 404).

## Hidratación en Vue

- Vue avisa en desarrollo de "Hydration mismatch" con el nodo afectado; en Vue 3.5+ se puede silenciar puntualmente con `data-allow-mismatch` en elementos donde la diferencia es intencionada (por ejemplo, una fecha relativa), pero no como solución general.
- `useId()` (Vue 3.5+) para IDs estables entre servidor y cliente.
