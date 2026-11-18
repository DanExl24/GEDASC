# Patrones de observabilidad

Los ejemplos usan Sentry por ser el más extendido; Datadog RUM, Bugsnag u OpenTelemetry siguen los mismos principios.

## Capas de manejo de errores

| Capa | Qué captura | Qué no captura |
| :--- | :--- | :--- |
| Handler global del framework (`app.config.errorHandler`, `ErrorHandler`, error boundary raíz) | Errores de render, ciclo de vida, watchers/effects | Errores en callbacks fuera del framework |
| `window.addEventListener('error')` | Errores síncronos no capturados, fallos de carga de recursos (con `capture: true`) | Promesas rechazadas |
| `window.addEventListener('unhandledrejection')` | Promesas rechazadas sin `catch` | — |
| Boundary por ruta o sección | Errores de render de esa parte: el resto de la app sigue funcionando | Errores en handlers de eventos (en React) |
| `try/catch` explícito en handlers asíncronos | Errores de acciones del usuario (guardar, enviar) con UX específica | — |

Los SDK de errores instalan los handlers globales; las boundaries y el manejo en handlers son trabajo de la aplicación.

## Errores esperados vs inesperados

```ts
function reportIfUnexpected(error: unknown) {
  if (error instanceof AppError && ['VALIDATION', 'UNAUTHORIZED', 'FORBIDDEN', 'NOT_FOUND', 'CONFLICT', 'CANCELLED'].includes(error.code)) {
    return   // parte del flujo normal: se muestra al usuario, no es un incidente
  }
  Sentry.captureException(error)
}
```

- `VALIDATION`, `FORBIDDEN`, `CANCELLED`: UX, no excepción.
- `NETWORK`: normalmente del usuario (sin conexión); regístralo como métrica o breadcrumb, no como error, salvo picos.
- `SERVER` y errores de JavaScript: excepción con contexto.

## UX de error

- **Fallback por sección**, no pantalla en blanco: "No se pudo cargar el historial. [Reintentar]" mientras el resto de la página funciona.
- **Conserva los datos del usuario** (formularios, borradores) ante cualquier error.
- **Mensaje humano** sin detalles técnicos; opcionalmente un identificador del evento para soporte ("Código: a1b2c3").
- **Error global** (la app no puede arrancar): página estática mínima con opción de recargar.

## Configuración del SDK de errores

```ts
Sentry.init({
  dsn: env.SENTRY_DSN,                         // el DSN es público por diseño
  environment: env.MODE,                       // production / staging
  release: env.APP_VERSION,                    // el mismo valor con el que se suben los source maps
  sampleRate: 1.0,                             // errores: todos (o menos si el volumen es enorme)
  tracesSampleRate: 0.1,                       // trazas de rendimiento: muestra
  tracePropagationTargets: [/^https:\/\/api\.miapp\.com/],   // solo tu API recibe traceparent
  sendDefaultPii: false,
  ignoreErrors: [
    'ResizeObserver loop completed with undelivered notifications',
    'AbortError',
    /^Non-Error promise rejection captured/,
  ],
  denyUrls: [/extensions\//i, /^chrome-extension:\/\//i, /^moz-extension:\/\//i],
  beforeSend(event) {
    return scrubPii(event)                     // quita emails, tokens, query strings sensibles
  },
})

Sentry.setUser({ id: user.id })                // ID, no email ni nombre
```

- Inicializa lo antes posible (antes de montar la app) para capturar errores de arranque.
- **Source maps:** súbelos en el pipeline con el mismo `release` y no los publiques en el servidor (o elimínalos del artefacto tras subirlos). Plugins: `@sentry/vite-plugin`, `@sentry/webpack-plugin`, integración de Next/Nuxt/Angular.
- **Breadcrumbs:** navegación, clics y peticiones dan el contexto previo al error; revisa que no incluyan datos sensibles (URLs con tokens, cuerpos de peticiones).
- **Tags útiles:** ruta, feature, rol de usuario (no identidad), flags activos.

## RUM y rendimiento real

- Core Web Vitals de campo (`web-vitals` o el SDK de RUM) etiquetados por ruta, dispositivo y release.
- Tiempo de navegación entre rutas en SPA (desde el clic hasta que la vista está lista).
- Marcas propias para operaciones de negocio: `performance.mark('checkout:start')` / `performance.measure(...)`.
- Compara releases: una regresión de LCP o de tasa de error tras un despliegue es la alerta más valiosa.

## Logging

```ts
// shared/lib/logger.ts
type Level = 'debug' | 'info' | 'warn' | 'error'

export const logger = {
  log(level: Level, message: string, context: Record<string, unknown> = {}) {
    if (import.meta.env.DEV) console[level === 'debug' ? 'log' : level](message, context)
    if (level === 'error') Sentry.captureMessage(message, { level: 'error', extra: context })
    else Sentry.addBreadcrumb({ level, message, data: context })
  },
}
```

- Un logger propio en lugar de `console.*` disperso: controla qué sale en producción y a dónde.
- Sin datos personales ni tokens en los mensajes ni en el contexto.
- Lint: `no-console` (permitiendo `warn`/`error` si se quiere) para evitar logs olvidados.

## Correlación con el backend

- El SDK (o OpenTelemetry para navegador) añade `traceparent`/`baggage` a las peticiones de los orígenes configurados; el backend continúa la traza.
- Configura **solo tus orígenes** (`tracePropagationTargets`): enviar cabeceras de traza a terceros puede romper CORS y filtrar información.
- El backend debe aceptar esas cabeceras en CORS (`Access-Control-Allow-Headers: traceparent, baggage`).
- Resultado: desde un error del frontend se llega a la traza del backend y viceversa.

## Desfase de versión tras despliegues

Tras desplegar, un usuario con la pestaña abierta sigue con la versión anterior; al navegar, pide chunks que ya no existen.

- Captura el error de carga de módulos dinámicos y recarga la página **una vez** (con una marca en `sessionStorage` para no entrar en bucle).
- Opcional: publica `version.json` en cada despliegue y compruébalo periódicamente o al cambiar de ruta; muestra "Hay una nueva versión disponible. [Actualizar]".
- Mantén los assets de la versión anterior disponibles un tiempo tras el despliegue (si la plataforma lo permite) para reducir el problema.

## Privacidad y consentimiento

- Herramientas que guardan identificadores o perfilan (analítica de producto, session replay, publicidad) pueden requerir **consentimiento previo** (RGPD/ePrivacy en la UE). El tracking de errores suele justificarse por interés legítimo si no incluye datos personales innecesarios; confírmalo con el equipo legal.
- **Session replay:** enmascara todos los inputs y texto por defecto (`maskAllText`, `maskAllInputs`), bloquea zonas sensibles (pagos, datos de salud), y muestrea.
- Respeta la decisión del usuario: sin consentimiento, los scripts no se cargan (no basta con "no enviar").

## Alertas

- Nuevo tipo de error en producción tras un release.
- Aumento de la tasa de error (o caída de sesiones sin error) por release.
- Regresión de Core Web Vitals en páginas clave.
- Errores de pago, login o registro (flujos críticos) con umbral bajo.
- Evita alertar por cada evento: genera fatiga y se acaban ignorando.

## Anti-patrones

| Anti-patrón | Consecuencia | Corrección |
| :--- | :--- | :--- |
| Sin handler ni boundaries | Pantalla en blanco ante cualquier error | Capas de captura + fallback |
| Errores sin source maps | Stacks ilegibles | Subir source maps con el release |
| Source maps públicos | Código legible por cualquiera | Subir y no servir |
| Sin `release` | Imposible saber si un error es nuevo | Versión en cada evento |
| Enviar 422 y cancelaciones como excepciones | Ruido que oculta lo importante | Solo inesperados |
| Email o nombre como usuario en eventos | Datos personales innecesarios | ID |
| Session replay sin enmascarar | Datos sensibles grabados | Enmascarar por defecto |
| `traceparent` a todos los orígenes | Errores CORS, fuga a terceros | Solo orígenes propios |
| `console.log` como sistema de logs | Nada llega al equipo; datos en la consola del usuario | Logger con destino |
