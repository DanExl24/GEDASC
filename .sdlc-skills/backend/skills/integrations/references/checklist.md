# Checklist de auditoría — integraciones

Severidad orientativa entre corchetes ([severity.md](../../../standards/severity.md)).

## 1. Llamadas salientes

- [ ] Toda llamada a un servicio externo tiene timeout de conexión y de respuesta. **[HIGH]**
- [ ] Reintentos solo en errores transitorios, con backoff, jitter, límite y respeto a `Retry-After`. **[MEDIUM]**
- [ ] Las escrituras que se reintentan usan clave de idempotencia del proveedor. **[CRITICAL]** en pagos; **[HIGH]** en otros efectos visibles (emails, pedidos a terceros).
- [ ] Reintentos en una sola capa (SDK o envoltorio, no ambos). **[LOW–MEDIUM]**
- [ ] Circuit breaker y límite de concurrencia en dependencias críticas o lentas. **[MEDIUM]**
- [ ] Degradación definida cuando la dependencia no está disponible. **[MEDIUM]**
- [ ] Rate limiting del lado cliente acorde a los límites del proveedor, compartido entre instancias. **[MEDIUM]**
- [ ] Sin llamadas externas dentro de transacciones de base de datos. **[HIGH]** (→ `data-access`).

## 2. Diseño

- [ ] Cada proveedor está detrás de un adaptador; el dominio no usa el SDK ni sus tipos. **[MEDIUM]**
- [ ] Errores del proveedor traducidos a errores del dominio. **[LOW–MEDIUM]**
- [ ] Respuestas validadas antes de usarlas o persistirlas. **[MEDIUM]**
- [ ] TLS verificado; sin `rejectUnauthorized: false`, `verify=False` ni equivalentes. **[HIGH]**
- [ ] Credenciales del proveedor desde el gestor de secretos, separadas por entorno (sandbox/producción). **[HIGH]** si hay credenciales de producción en el repositorio o en entornos de prueba.
- [ ] La readiness del servicio no depende de terceros. **[MEDIUM]**

## 3. Webhooks entrantes

- [ ] Firma verificada sobre el cuerpo crudo con comparación en tiempo constante. **[CRITICAL]** si no se verifica y el evento tiene efectos (pagos, estados).
- [ ] Ventana temporal contra replay. **[MEDIUM]**
- [ ] Deduplicación por id de evento. **[HIGH]**
- [ ] Respuesta rápida y procesamiento en background. **[MEDIUM]**
- [ ] Tolerancia al desorden (versiones o consulta del estado real). **[MEDIUM–HIGH]**
- [ ] Secretos rotables. **[LOW]**

## 4. Webhooks salientes

- [ ] Envíos firmados con secreto por suscriptor, marca de tiempo e id único. **[HIGH]**
- [ ] URLs de suscriptores validadas contra SSRF. **[HIGH]** (→ `api-security`).
- [ ] Envío en background con reintentos, límite y desactivación de suscripciones que fallan siempre. **[MEDIUM]**
- [ ] Registro de entregas consultable. **[LOW]**

## 5. Sincronizaciones y tests

- [ ] Sincronizaciones incrementales, idempotentes y reanudables. **[MEDIUM]**
- [ ] Tests con proveedor simulado que cubren errores, timeouts y respuestas mal formadas. **[MEDIUM]**

## Cómo inspeccionar rápido

- Timeouts: llamadas `fetch(`, `axios`, `got`, `requests.get(`, `httpx`, `RestTemplate`, `WebClient`, `RestClient` sin configuración de timeout (en `requests`, el timeout por defecto es infinito).
- Reintentos: `retry`, `tenacity`, `@Retryable`, `axios-retry` y opciones de reintento de los SDKs; comprobar si se aplican a POST sin clave de idempotencia.
- TLS: `rejectUnauthorized: false`, `NODE_TLS_REJECT_UNAUTHORIZED=0`, `verify=False`, `TrustAllStrategy`.
- Webhooks: rutas `/webhooks`, `/callback`, `/hooks`; verificar que leen el cuerpo crudo y comprueban firma antes de cualquier efecto.
- Llamadas dentro de transacciones: clientes HTTP dentro de `transaction`/`atomic`/`@Transactional`.
