# Patrones de seguridad en el frontend

## XSS

Los frameworks escapan el texto interpolado (`{{ }}`, `{ }`), así que el XSS en apps modernas aparece casi siempre por una **vía de escape**:

| Sink | Riesgo |
| :--- | :--- |
| `v-html`, `dangerouslySetInnerHTML`, `[innerHTML]` + `bypassSecurityTrustHtml` | Inserta HTML sin escapar |
| `el.innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write` | Igual, fuera del framework |
| `href`/`src`/`action` con URL del usuario | `javascript:alert(1)` se ejecuta al hacer clic |
| `eval`, `new Function`, `setTimeout('código')` | Ejecución de cadenas |
| Markdown o texto enriquecido renderizado a HTML | El conversor puede dejar pasar HTML o enlaces `javascript:` |
| SVG subido por usuarios y mostrado inline o servido desde el mismo origen | Puede contener scripts |
| Plantillas compiladas en el navegador con contenido del servidor (Vue in-DOM templates, AngularJS) | Inyección de expresiones del framework |
| JSON incrustado en `<script>` sin escapar `<` | `</script>` cierra la etiqueta e inyecta código |

### Sanitizar HTML

```ts
import DOMPurify from 'dompurify'

export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    USE_PROFILES: { html: true },          // sin SVG ni MathML si no hacen falta
    FORBID_TAGS: ['style', 'form'],
    FORBID_ATTR: ['style'],
  })
}
```

- Sanitiza **justo antes de insertar**, no al guardar (el contexto de uso puede cambiar).
- En SSR, DOMPurify necesita un DOM (`isomorphic-dompurify` o `jsdom`).
- Markdown: conversor con HTML desactivado (o sanitizando su salida) y enlaces filtrados.
- Mejor aún: si el contenido solo necesita formato básico, no permitas HTML; usa texto plano o un subconjunto de markdown.

### Validar URLs

```ts
const SAFE_PROTOCOLS = new Set(['https:', 'http:', 'mailto:', 'tel:'])

export function safeUrl(input: string, fallback = '#'): string {
  try {
    const url = new URL(input, window.location.origin)
    return SAFE_PROTOCOLS.has(url.protocol) ? url.href : fallback
  } catch {
    return fallback
  }
}
```

Aplica a cualquier `href`, `src`, `formaction` o `window.location = …` con datos que no controlas.

### Trusted Types

Con la cabecera `Content-Security-Policy: require-trusted-types-for 'script'`, el navegador (Chromium) rechaza asignar cadenas a sinks peligrosos salvo que pasen por una política declarada. Es la defensa más fuerte contra XSS basado en DOM; Angular lo soporta de forma nativa y DOMPurify puede devolver `TrustedHTML`.

## Tokens y sesión

| Opción | XSS puede robarlo | CSRF | Recomendación |
| :--- | :---: | :---: | :--- |
| Cookie `httpOnly; Secure; SameSite=Lax/Strict` | No (JS no la lee) | Mitigado por SameSite; añadir token CSRF en operaciones sensibles si hay subdominios o `SameSite=None` | **Preferida** para apps con backend propio (patrón BFF) |
| Access token en memoria + refresh en cookie httpOnly | Solo mientras la página está abierta (el atacante actúa, no se lo lleva para siempre) | El refresh por cookie requiere protección CSRF del endpoint | Buena para APIs con Bearer |
| `localStorage` / `sessionStorage` | **Sí, y persiste** | No aplica | Evitar para tokens |

- Un XSS puede hacer peticiones en nombre del usuario en cualquier caso; la cookie httpOnly impide que **exfiltre** la credencial para usarla después.
- OAuth/OIDC en SPA: flujo Authorization Code con PKCE (nunca el flujo implícito); valora un BFF que guarde los tokens en servidor.
- **Logout completo:** invalidar la sesión en el servidor, borrar estado en memoria, cachés de datos (QueryClient), almacenamiento persistido y redirigir.
- Expiración por inactividad con aviso previo (→ `accessibility` 2.2.1).

## CSRF

- Con sesión por cookie, el navegador la envía automáticamente: una web maliciosa puede provocar peticiones.
- `SameSite=Lax` (por defecto en navegadores modernos) bloquea la mayoría de casos entre sitios; no protege entre subdominios del mismo sitio.
- Operaciones que cambian estado nunca por `GET`.
- Token CSRF (cabecera personalizada como `X-XSRF-TOKEN` leída de una cookie no-httpOnly) para defensa adicional; Angular lo soporta de serie y axios puede configurarse (`xsrfCookieName`/`xsrfHeaderName`).

## Secretos y variables de entorno

- Todo lo que se incluye en el bundle es público. Prefijos públicos: `VITE_*`, `NEXT_PUBLIC_*`, `NUXT_PUBLIC_*` / `runtimeConfig.public`, `environment.ts` de Angular (todo es público).
- Públicas por diseño (aceptables): claves publicables de Stripe, claves de mapas restringidas por dominio, DSN de Sentry, IDs de analítica.
- **Nunca en el cliente:** claves secretas de APIs, credenciales de base de datos, tokens de servicio, claves privadas, secretos de firma de JWT.
- Llamadas a APIs que requieren secretos → a través del backend o de funciones del servidor.
- Revisa el bundle construido: `grep -rE "sk_live|AKIA|-----BEGIN|secret|password|api[_-]?key" dist/`.
- Source maps en producción: no exponen secretos (no debería haberlos), pero facilitan leer el código; súbelos solo a la herramienta de errores y no los sirvas públicamente si no es necesario.

## CSP y cabeceras

Las cabeceras las pone el servidor o la CDN, pero el frontend debe ser **compatible** con una política estricta.

```text
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'nonce-{aleatorio-por-respuesta}' 'strict-dynamic';
  style-src 'self';
  img-src 'self' data: https://cdn.ejemplo.com;
  connect-src 'self' https://api.ejemplo.com;
  frame-ancestors 'none';
  base-uri 'self';
  object-src 'none';
  form-action 'self';
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

- Evita `'unsafe-inline'` y `'unsafe-eval'`: elimina scripts inline, handlers en atributos (`onclick="…"`) y `eval`.
- Nonces requieren SSR o un servidor que los inyecte; en sitios estáticos, hashes de los scripts inline imprescindibles.
- Empieza con `Content-Security-Policy-Report-Only` y un endpoint de reportes, y endurece.
- `frame-ancestors 'none'` (o `'self'`) evita clickjacking.

## Open redirect

Cualquier parámetro que decida a dónde navegar (`redirect`, `returnUrl`, `next`) debe aceptar solo destinos internos (ver `routing` → `safeRedirect`).

## postMessage e iframes

```ts
window.addEventListener('message', (event) => {
  if (event.origin !== 'https://widget.socio.com') return      // valida SIEMPRE el origen
  const data = MessageSchema.safeParse(event.data)              // y la forma del mensaje
  if (!data.success) return
  // …
})

iframe.contentWindow?.postMessage(payload, 'https://widget.socio.com')   // nunca '*' con datos sensibles
```

- `<iframe sandbox="allow-scripts allow-same-origin…">` con el mínimo de permisos para contenido de terceros.
- Enlaces externos con `target="_blank"`: añade `rel="noopener noreferrer"` (los navegadores modernos aplican `noopener` por defecto, pero no `noreferrer`).

## Datos sensibles

- **Fuera de la URL:** tokens, emails, documentos de identidad, datos de salud. Las URLs quedan en historial, logs de servidores y proxies, y en la cabecera `Referer`.
- **Fuera de logs y analítica:** nada de `console.log` de respuestas con datos personales o tokens en producción; filtra datos personales en Sentry/Datadog (`beforeSend`), en grabaciones de sesión (enmascarar inputs) y en eventos de analítica.
- **Almacenamiento local:** no persistas datos sensibles; limpia todo al cerrar sesión.
- **Autocompletado:** usa los valores correctos (`current-password`, `one-time-code`); `autocomplete="off"` no es una medida de seguridad y perjudica a los gestores de contraseñas.

## Autorización cosmética

```ts
// ✅ correcto como UX
<button v-if="can('invoice:delete')">Eliminar</button>

// …siempre que la API también rechace DELETE /invoices/:id a quien no tenga permiso.
```

Cuando la UI calcula permisos, precios o límites, verifica (o señala) que el backend repite la comprobación. Si no lo hace → hallazgo **CRITICAL** para el backend.

## Cadena de suministro

- Lockfile versionado y `npm ci`/`pnpm install --frozen-lockfile` en CI.
- `npm audit` / `pnpm audit` en CI con umbral (fallar en `high`/`critical` explotables).
- Dependabot o Renovate para actualizaciones.
- Antes de añadir una dependencia: mantenimiento, popularidad, número de dependencias transitivas, permisos de scripts de instalación. Evita paquetes abandonados o con nombres sospechosos (typosquatting).
- Scripts desde CDN con versión fijada y **Subresource Integrity**:
  ```html
  <script src="https://cdn.ejemplo.com/lib@1.2.3/lib.min.js" integrity="sha384-…" crossorigin="anonymous"></script>
  ```
- Revisa periódicamente los scripts de terceros (analítica, chat, A/B): cada uno puede leer y modificar toda la página.

## Otros

- **Prototype pollution:** no hagas merge profundo de JSON no confiable en objetos de configuración; usa `Object.create(null)` o `Map` para diccionarios con claves del usuario.
- **Subida de archivos:** valida tipo y tamaño en cliente por UX; el servidor valida contenido real, renombra y sirve desde otro dominio o con `Content-Disposition: attachment`.
- **Clickjacking:** `frame-ancestors` en CSP.
- **Errores:** no muestres trazas ni mensajes internos del backend al usuario.
