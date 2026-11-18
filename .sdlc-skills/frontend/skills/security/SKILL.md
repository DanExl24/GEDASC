---
name: security
description: Construye y audita la seguridad del lado del cliente en aplicaciones frontend (Vue, React, Angular). Cubre XSS y sinks peligrosos (v-html, dangerouslySetInnerHTML, bypassSecurityTrust, innerHTML, URLs javascript:), sanitización con DOMPurify y Trusted Types, almacenamiento de tokens y sesión, CSRF con cookies, secretos expuestos en el bundle y variables de entorno públicas, compatibilidad con CSP y cabeceras de seguridad, open redirects, postMessage, iframes, datos sensibles en URLs, logs y analítica, autorización solo cosmética en la UI y cadena de suministro de dependencias. Úsala al manejar HTML o enlaces de usuarios, autenticación en el cliente, scripts de terceros o antes de un release. No la uses para la seguridad del backend o la API (dominio security/backend) ni para pruebas DAST en runtime (dominio QA).
---

# Seguridad en el frontend

El código del frontend se ejecuta en la máquina del usuario, que puede leerlo, modificarlo y llamar a la API sin pasar por la interfaz. Por eso esta skill parte de dos verdades: **el frontend no puede guardar secretos ni imponer autorización**. Su trabajo es no abrir puertas: no ejecutar contenido de atacantes (XSS), no filtrar datos ni credenciales, y no dar falsas garantías.

## Cuándo usarla

- La app muestra HTML, markdown o enlaces que vienen de usuarios o de terceros.
- Implementar o revisar login, sesión, refresh token o logout en el cliente.
- Integrar scripts de terceros, widgets, iframes o `postMessage`.
- Preparar un release, una auditoría de seguridad o un pentest.
- Revisar dependencias tras una alerta de vulnerabilidad.

**No es para:** autenticación, autorización e inyecciones en la API → plugin `backend` (`authentication`, `authorization`, `api-security`) · pruebas dinámicas contra la app en ejecución (cabeceras, fuerza bruta) → dominio QA (`domains/05_qa_testing_engineering/04_dast_security_zap_audit`) · la lógica del refresh token → `data-fetching` (esta skill decide dónde vive el token).

## Paso 0: contexto (ambos modos)

1. Detecta framework, meta-framework y cómo autentica el backend (cookie httpOnly, Bearer, OAuth/OIDC con proveedor). Carga [vue.md](references/vue.md), [react.md](references/react.md) o [angular.md](references/angular.md).
2. Localiza: dónde se renderiza contenido de usuarios, dónde se guardan tokens, variables de entorno públicas, scripts de terceros, configuración de cabeceras (servidor, CDN, `vercel.json`, `netlify.toml`, nginx).
3. Revisa el estado de las dependencias (`npm audit`/`pnpm audit`, Dependabot/Renovate).

## Modo Construir

1. **Renderiza texto, no HTML.** Si hace falta HTML de usuarios, sanitízalo con DOMPurify (o el sanitizador del framework) justo antes de insertarlo. Ver [patterns.md § XSS](references/patterns.md#xss).
2. **Valida las URLs de usuarios** antes de ponerlas en `href`/`src` (solo `https:`, `http:`, `mailto:`…).
3. **Sesión:** cookie `httpOnly; Secure; SameSite` emitida por el backend como primera opción; si hay Bearer, access token en memoria y de vida corta. Nunca en `localStorage`. Ver [patterns.md § Sesión](references/patterns.md#tokens-y-sesión).
4. **Sin secretos en el cliente:** solo variables públicas por diseño (claves publicables). Todo lo demás, en el servidor.
5. **Compatible con una CSP estricta:** sin scripts ni estilos inline innecesarios, sin `eval`/`new Function`.
6. **Terceros mínimos**, con versión fijada y SRI si se cargan desde CDN.
7. **Autorización en el backend:** la UI oculta lo que el usuario no puede hacer, pero cada acción la verifica la API.
8. Entrega según [output-formats.md § Construir](../../standards/output-formats.md#modo-construir).

## Modo Auditar

1. Busca los sinks peligrosos y el origen de los datos que reciben (ver [checklist.md § Cómo inspeccionar](references/checklist.md#cómo-inspeccionar-rápido)).
2. Revisa sesión, tokens, logout y CSRF.
3. Revisa el bundle de producción y las variables públicas en busca de secretos.
4. Revisa cabeceras (si hay URL o configuración del servidor/CDN) y dependencias.
5. Recorre [checklist.md](references/checklist.md).
6. Clasifica con [severity.md](../../standards/severity.md) y entrega según [output-formats.md § Auditar](../../standards/output-formats.md#modo-auditar) con código `FE-SEC`. Si un hallazgo requiere corrección en el backend (autorización, validación), dilo explícitamente y recomienda el dominio correspondiente.

## Principios

1. **Todo lo que llega al navegador es público:** código, variables "de entorno", source maps, respuestas de la API.
2. **La UI no autoriza.** Ocultar un botón no impide la acción; el backend decide.
3. **La validación del cliente es UX, no seguridad.**
4. **El framework escapa por defecto; cada vía de escape es un riesgo** (`v-html`, `dangerouslySetInnerHTML`, `bypassSecurityTrust*`, `innerHTML`).
5. **Las credenciales no viven donde un script inyectado pueda leerlas.**
6. **Mínimos terceros, mínimos privilegios:** cada script externo puede leer toda la página.
7. **Los datos sensibles no salen de donde deben:** ni a la URL, ni a logs, ni a herramientas de analítica o errores sin filtrar.

## Referencias

| Archivo | Cuándo cargarlo |
| :--- | :--- |
| [patterns.md](references/patterns.md) | Siempre en modo Construir; en Auditar para las correcciones. |
| [checklist.md](references/checklist.md) | Modo Auditar. |
| [vue.md](references/vue.md) · [react.md](references/react.md) · [angular.md](references/angular.md) | Según el stack. |

## Skills relacionadas

- `data-fetching`: interceptores, refresh token y manejo de 401/403.
- `routing`: open redirects en el login, guards (y sus límites).
- `rendering-and-seo`: secretos y datos de usuario en SSR y en la caché de páginas.
- `state-management`: datos sensibles persistidos y limpieza al cerrar sesión.
- `forms`: subida de archivos y validación (que el backend repite).
- `tooling`: lockfile, auditoría de dependencias y variables de entorno en el pipeline.
- `observability`: datos personales en eventos de error, analítica y session replay.
