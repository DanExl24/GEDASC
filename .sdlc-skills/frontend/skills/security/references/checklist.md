# Checklist de auditoría — seguridad en el frontend

Severidad orientativa entre corchetes ([severity.md](../../../standards/severity.md)). Para cada sink, indica el **origen de los datos**: un `v-html` con contenido estático propio no es lo mismo que uno con comentarios de usuarios.

## 1. XSS

- [ ] Ningún HTML de usuarios o terceros se inserta sin sanitizar (`v-html`, `dangerouslySetInnerHTML`, `[innerHTML]` con `bypassSecurityTrust*`, `innerHTML`). **[CRITICAL]** si el contenido lo controla otro usuario (XSS almacenado); **[HIGH]** si viene de la URL (reflejado).
- [ ] La sanitización usa una librería mantenida (DOMPurify o el sanitizador del framework), no expresiones regulares propias. **[HIGH]**
- [ ] URLs de usuarios en `href`/`src` se validan por protocolo (sin `javascript:`, `data:` en `href`). **[HIGH]**
- [ ] No hay `eval`, `new Function` ni `setTimeout`/`setInterval` con cadenas. **[HIGH]** si reciben datos externos; **[MEDIUM]** si no (impiden una CSP estricta).
- [ ] Markdown y texto enriquecido se renderizan con HTML desactivado o sanitizado. **[HIGH]**
- [ ] SVG de usuarios no se insertan inline ni se sirven desde el mismo origen sin sanitizar. **[HIGH]**
- [ ] JSON incrustado en `<script>` (estado SSR, JSON-LD) escapa `<`. **[HIGH]**
- [ ] (Vue) No se montan apps sobre HTML del servidor que contiene contenido de usuarios (in-DOM templates). **[CRITICAL]**

## 2. Sesión y tokens

- [ ] Tokens de acceso o refresco no se guardan en `localStorage`/`sessionStorage`. **[HIGH]**
- [ ] Si hay cookie de sesión: `httpOnly`, `Secure`, `SameSite` (verificable en DevTools → Application → Cookies). **[HIGH]** si falta `httpOnly` en la cookie de sesión.
- [ ] Operaciones que cambian estado no usan `GET`; hay protección CSRF donde la sesión va por cookie. **[HIGH]**
- [ ] OAuth/OIDC en SPA usa Authorization Code + PKCE, no flujo implícito. **[HIGH]**
- [ ] El logout invalida la sesión en servidor y limpia memoria, cachés y almacenamiento. **[MEDIUM]**; **[HIGH]** en equipos compartidos.
- [ ] Tokens y datos sensibles no aparecen en la URL. **[HIGH]**

## 3. Secretos

- [ ] No hay secretos en variables de entorno públicas ni en el código del cliente. **[CRITICAL]**
- [ ] El bundle de producción no contiene claves secretas (búsqueda en `dist/`). **[CRITICAL]**
- [ ] Las claves públicas por diseño están restringidas (dominios, permisos mínimos). **[MEDIUM]**
- [ ] Los source maps no se sirven públicamente sin necesidad. **[LOW]**

## 4. Autorización

- [ ] Las acciones ocultas o deshabilitadas por permisos están protegidas también en la API (verificar o señalar). **[CRITICAL]** si la API no autoriza.
- [ ] Precios, descuentos, límites y validaciones de negocio no se confían al cliente. **[CRITICAL]** si el backend acepta valores calculados por el cliente.
- [ ] Los IDs de recursos en rutas y peticiones no son la única barrera (el backend comprueba propiedad; → dominio security, IDOR).

## 5. CSP y cabeceras

- [ ] Existe una CSP (aunque sea en modo report-only). **[MEDIUM]**
- [ ] La app funciona sin `'unsafe-inline'` ni `'unsafe-eval'` en `script-src`. **[MEDIUM]**
- [ ] `frame-ancestors` (o `X-Frame-Options`) contra clickjacking. **[MEDIUM]**
- [ ] HSTS, `X-Content-Type-Options: nosniff`, `Referrer-Policy` presentes. **[LOW–MEDIUM]**

## 6. Navegación y comunicación

- [ ] Parámetros de redirección validados (solo destinos internos). **[HIGH]**
- [ ] Listeners de `message` validan `event.origin` y la forma del mensaje. **[HIGH]**
- [ ] `postMessage` con origen explícito, nunca `'*'` con datos sensibles. **[HIGH]**
- [ ] Iframes de terceros con `sandbox` mínimo. **[MEDIUM]**
- [ ] Enlaces externos con `rel="noopener noreferrer"`. **[LOW]**

## 7. Datos sensibles

- [ ] Sin `console.log` de datos personales o tokens en producción. **[MEDIUM]**
- [ ] Herramientas de errores, analítica y grabación de sesión filtran o enmascaran datos personales. **[MEDIUM–HIGH]** según el tipo de datos.
- [ ] No se persisten datos sensibles en el navegador sin necesidad. **[MEDIUM]**
- [ ] Mensajes de error al usuario sin detalles internos del backend. **[LOW–MEDIUM]**

## 8. Dependencias y terceros

- [ ] Lockfile versionado e instalación reproducible en CI. **[MEDIUM]**
- [ ] Auditoría de dependencias en CI; sin vulnerabilidades `high`/`critical` explotables pendientes. **[HIGH]** si hay vulnerabilidades explotables en dependencias de producción.
- [ ] Actualizaciones automatizadas (Dependabot/Renovate). **[LOW]**
- [ ] Scripts de CDN con versión fijada y SRI. **[MEDIUM]**
- [ ] Inventario de scripts de terceros justificado; sin terceros sin uso. **[LOW–MEDIUM]**

## Cómo inspeccionar rápido

- Sinks: buscar `v-html`, `dangerouslySetInnerHTML`, `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write`, `bypassSecurityTrust`, `eval(`, `new Function(`.
- URLs dinámicas: `:href=`, `href={`, `[href]=`, `window.location =`, `window.open(` con datos variables.
- Tokens: `localStorage.setItem(`, `sessionStorage.setItem(` cerca de `token`, `jwt`, `auth`.
- Secretos: variables `VITE_`, `NEXT_PUBLIC_`, `NUXT_PUBLIC_`, `environment.ts` con nombres como `SECRET`, `PRIVATE`, `KEY`; y `grep -rE "sk_live|AKIA|-----BEGIN|secret" dist/` tras el build.
- `postMessage`: `addEventListener('message'` sin comprobación de `origin`.
- Dependencias: `npm audit --omit=dev` / `pnpm audit --prod`.
- Cabeceras: `curl -sI https://sitio | grep -iE 'content-security|strict-transport|x-frame|x-content-type|referrer-policy'`.
