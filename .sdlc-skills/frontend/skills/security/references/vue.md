# Seguridad — notas Vue / Nuxt

## Vías de escape

- `{{ }}` y los bindings escapan; **`v-html` no sanitiza nada**. Si hace falta, sanitiza antes:
  ```vue
  <div v-html="sanitizeHtml(comment.body)" />
  ```
  o una directiva propia `v-safe-html` que llame a DOMPurify, para que el patrón sea uno y auditable.
- `:href="url"` no filtra `javascript:`: usa `safeUrl(url)`.
- Funciones de render (`h()`) con `innerHTML` en las props: mismo riesgo que `v-html`.

## Plantillas in-DOM (inyección de expresiones)

Si Vue se monta sobre HTML que genera el servidor (por ejemplo, una app PHP/Rails con Vue "espolvoreado" y el compilador en runtime), cualquier contenido de usuario dentro de ese HTML se compila como plantilla: un comentario con `{{ constructor.constructor('alert(1)')() }}` se ejecuta. Soluciones:
- No montar Vue sobre zonas con contenido de usuarios, o marcarlas con `v-pre`.
- Usar plantillas precompiladas (SFC) y la build sin compilador.

## Nuxt

- `runtimeConfig` (privado, solo servidor) vs `runtimeConfig.public` (llega al cliente). Los secretos van en el privado y se usan en `server/` o en código que solo corre en servidor.
- Las rutas de `server/api` son endpoints públicos: validan entrada y autorizan como cualquier backend.
- Cabeceras de seguridad y CSP con nonces: módulo `nuxt-security` (CSP, HSTS, rate limiting básico, sanitización de entrada) o `routeRules` con `headers`.
- `useState` y payload de SSR se serializan en el HTML: no metas datos que el usuario no deba ver.

## Pinia y persistencia

`pinia-plugin-persistedstate` con `pick` explícito; nunca persistas el store de sesión completo con tokens.
