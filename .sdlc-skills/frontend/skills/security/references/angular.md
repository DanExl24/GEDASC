# Seguridad — notas Angular

## Sanitización integrada

- Angular trata todos los valores como no confiables y **sanitiza automáticamente** `[innerHTML]`, `[href]`, `[src]` y estilos según el contexto (quita scripts y URLs `javascript:`).
- **`DomSanitizer.bypassSecurityTrustHtml/Url/ResourceUrl/Script/Style`** desactiva esa protección: cada uso es un hallazgo potencial. Solo es aceptable con contenido propio y constante, o tras sanitizar con DOMPurify, y con un comentario que lo justifique.
- `ElementRef.nativeElement.innerHTML = …` y `Renderer2.setProperty(el, 'innerHTML', …)` saltan el sanitizador.
- No concatenes contenido de usuarios en plantillas compiladas en runtime (no hagas plantillas dinámicas con JIT).

## Trusted Types y CSP

- Angular es compatible con Trusted Types (`require-trusted-types-for 'script'`, políticas `angular` y `angular#unsafe-bypass`).
- CSP con nonces: atributo `ngCspNonce` en el elemento raíz o el token `CSP_NONCE`; versiones recientes ofrecen generación automática de CSP basada en hashes para apps estáticas (`autoCsp` en la configuración de seguridad del build). Comprueba la versión del proyecto.

## CSRF / XSRF

`HttpClient` lee la cookie `XSRF-TOKEN` y envía la cabecera `X-XSRF-TOKEN` en peticiones de escritura a URLs relativas:

```ts
provideHttpClient(withXsrfConfiguration({ cookieName: 'XSRF-TOKEN', headerName: 'X-XSRF-TOKEN' }))
```

El backend debe emitir la cookie y validar la cabecera. No se envía a URLs absolutas de otros dominios.

## Entorno y secretos

`environment.ts` se compila dentro del bundle: **todo su contenido es público**. Los secretos van en el servidor (Angular SSR/Express o el backend).

## Otros

- Interceptor de autenticación: adjunta el token solo a las URLs de tu API (no a cualquier petición saliente a terceros).
- Logout: limpia servicios con estado, cachés y almacenamiento.
