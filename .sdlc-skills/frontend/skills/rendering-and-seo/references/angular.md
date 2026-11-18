# Render y SEO — notas Angular

## Angular SSR

- `ng add @angular/ssr` añade el servidor y la configuración.
- **Modo de render por ruta** (configuración de rutas de servidor):
  ```ts
  // app.routes.server.ts
  export const serverRoutes: ServerRoute[] = [
    { path: '', renderMode: RenderMode.Prerender },
    { path: 'blog/:slug', renderMode: RenderMode.Prerender, getPrerenderParams: async () => (await listSlugs()).map((slug) => ({ slug })) },
    { path: 'productos/**', renderMode: RenderMode.Server },
    { path: 'app/**', renderMode: RenderMode.Client },
  ]
  ```
  (API introducida en versiones recientes; en versiones anteriores, prerender configurado en `angular.json`.)
- 404 real en SSR: `{ path: '**', renderMode: RenderMode.Server, status: 404 }` o fijar el estado de la respuesta desde el servidor para la página "no encontrado".

## Hidratación

- `provideClientHydration()` en `app.config.ts`; con `withEventReplay()` se reproducen los clics hechos antes de hidratar.
- **Hidratación incremental**: `withIncrementalHydration()` + `@defer (hydrate on viewport | interaction | idle)` para hidratar partes de la página solo cuando hacen falta.
- `ngSkipHydration` en componentes que manipulan el DOM directamente y no pueden hidratarse (solución temporal).
- Código solo de navegador: `afterNextRender()`, o `isPlatformBrowser(inject(PLATFORM_ID))`.
- Transfer cache de `HttpClient` (activo con la hidratación) evita repetir en cliente las peticiones hechas en servidor.

## Metadatos

```ts
export class ProductPage {
  private title = inject(Title)
  private meta = inject(Meta)

  constructor() {
    effect(() => {
      const p = this.product()
      this.title.setTitle(`${p.name} · Tienda`)
      this.meta.updateTag({ name: 'description', content: p.summary })
      this.meta.updateTag({ property: 'og:title', content: p.name })
      this.meta.updateTag({ property: 'og:image', content: p.ogImage })
    })
  }
}
```

- Títulos por ruta con la propiedad `title` de la ruta (o una `TitleStrategy` propia).
- Canonical: inyecta `DOCUMENT` y gestiona un `<link rel="canonical">` en un servicio.
- Sitemap y robots: genéralos en el build (script) o con un endpoint del servidor Express.

## Sin SSR

Una app Angular servida como SPA tiene los mismos problemas que cualquier CSR: metadatos solo tras ejecutar JS y soft 404. Para páginas públicas, prerender o SSR.
