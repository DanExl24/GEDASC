# Checklist de auditoría — observabilidad

Severidad orientativa entre corchetes ([severity.md](../../../standards/severity.md)).

## 1. Captura de errores

- [ ] Hay handler global del framework y de `error`/`unhandledrejection` (o los instala el SDK). **[HIGH]** si los errores de producción no llegan a ningún sitio.
- [ ] Error boundaries por ruta o sección; un fallo no tumba toda la app. **[HIGH]** si un error deja la pantalla en blanco.
- [ ] Los handlers asíncronos de acciones del usuario manejan el error con UX específica. **[MEDIUM]**
- [ ] Los errores esperados (validación, permisos, cancelaciones) no se reportan como excepciones. **[LOW–MEDIUM]**

## 2. UX de error

- [ ] Fallback con mensaje humano y reintento. **[MEDIUM]**
- [ ] Los datos del usuario se conservan ante errores. **[HIGH]**
- [ ] Hay una página mínima si la app no puede arrancar. **[LOW–MEDIUM]**

## 3. Herramienta de errores

- [ ] SDK inicializado antes de montar la app. **[MEDIUM]**
- [ ] `release` y `environment` en cada evento. **[MEDIUM]**
- [ ] Source maps subidos con el release; stacks legibles. **[MEDIUM]**
- [ ] Source maps no servidos públicamente (o decisión consciente). **[LOW]** (→ `security`).
- [ ] Usuario identificado por ID, sin email ni nombre; `sendDefaultPii` desactivado. **[MEDIUM]**
- [ ] `beforeSend` (o equivalente) filtra datos personales, tokens y query strings sensibles. **[MEDIUM–HIGH]**
- [ ] Ruido filtrado (extensiones, `ResizeObserver`, aborts); lo que queda es accionable. **[LOW–MEDIUM]**
- [ ] Muestreo configurado de forma consciente (errores y trazas). **[LOW]**

## 4. RUM y logging

- [ ] Core Web Vitals de campo por ruta y release. **[LOW–MEDIUM]** (→ `performance`).
- [ ] Logger centralizado; sin `console.log` disperso en producción. **[LOW]**
- [ ] Sin datos personales en logs ni breadcrumbs. **[MEDIUM]**

## 5. Correlación y despliegues

- [ ] `traceparent` se propaga solo a la API propia y el backend continúa la traza. **[LOW–MEDIUM]**
- [ ] Errores de carga de chunks tras un despliegue se manejan (recarga única o aviso de nueva versión). **[MEDIUM]**

## 6. Privacidad

- [ ] Analítica, session replay y herramientas de perfilado respetan el consentimiento cuando la ley lo exige (los scripts no se cargan sin él). **[HIGH]** en la UE si no se respeta.
- [ ] Session replay enmascara inputs y texto por defecto y bloquea zonas sensibles. **[HIGH]** si graba datos de pago o salud.

## 7. Alertas

- [ ] Alertas por errores nuevos en un release y por aumento de la tasa de error. **[LOW–MEDIUM]**
- [ ] Umbral bajo en flujos críticos (login, pago). **[MEDIUM]**
- [ ] Sin alertas por evento individual que generen fatiga. **[LOW]**

## Cómo inspeccionar rápido

- SDK: buscar `Sentry.init`, `datadogRum.init`, `Bugsnag.start` y revisar `release`, `environment`, `beforeSend`, `sendDefaultPii`, `tracePropagationTargets`.
- Handlers: `errorHandler`, `ErrorBoundary`, `ErrorHandler`, `addEventListener('unhandledrejection'`.
- Source maps: configuración de build (`sourcemap: true|'hidden'`) y si los `.map` acaban en el directorio publicado.
- Logs: `console.log(` en `src/` fuera de desarrollo.
- Prueba: lanzar un error en un componente de una ruta secundaria y en una promesa sin `catch`; comprobar la UI y el evento recibido.
