# Checklist de auditoría — capa HTTP

Severidad orientativa entre corchetes ([severity.md](../../../standards/severity.md)).

## 1. Validación de entrada

- [ ] Todo endpoint con body (POST, PUT, PATCH) lo valida con un schema antes del controlador. **[HIGH]** en endpoints públicos o que escriben datos.
- [ ] Params de ruta validados (UUID, entero positivo). **[MEDIUM]**
- [ ] Query params validados y con coerción explícita. **[MEDIUM]**
- [ ] Paginación con tope máximo forzado (`limit`, `pageSize`). **[HIGH]** si un cliente puede pedir todas las filas de una tabla grande.
- [ ] Longitudes máximas en strings y tamaños máximos en arrays. **[MEDIUM]**
- [ ] Campos desconocidos rechazados o descartados; el body nunca se pasa completo al ORM. **[CRITICAL]** si permite modificar roles, saldos, propietarios o estados; **[HIGH]** en otros casos.
- [ ] La identidad del actor sale de la autenticación, nunca del body o la query. **[CRITICAL]**

## 2. Controladores

- [ ] Sin lógica de negocio ni consultas en controladores. **[MEDIUM]** (→ `domain-logic`, `data-access`).
- [ ] Respuestas con DTOs explícitos; ninguna entidad del ORM serializada directamente. **[CRITICAL]** si se exponen hashes, tokens o datos de otros; **[MEDIUM]** si solo hay campos internos.
- [ ] Códigos HTTP correctos (201 al crear, 204 sin contenido, 404/409/422 según el caso). **[LOW–MEDIUM]** (detalle en `api-design`).

## 3. Errores

- [ ] Error handler global registrado al final del pipeline. **[HIGH]** si no existe.
- [ ] Un solo formato de error en todos los endpoints. **[MEDIUM]**
- [ ] Sin stack traces, mensajes de base de datos ni rutas internas en producción. **[HIGH]**
- [ ] Errores de validación con detalle por campo. **[MEDIUM]**
- [ ] Errores conocidos del ORM (unicidad, no encontrado) mapeados a 409/404. **[LOW–MEDIUM]**
- [ ] Identificador de petición en respuestas de error y logs. **[LOW]**

## 4. Pipeline y robustez

- [ ] Todos los middlewares terminan la petición o llaman a `next()` exactamente una vez en cada rama. **[HIGH]** si hay ramas que cuelgan peticiones.
- [ ] Los errores asíncronos llegan al error handler. **[HIGH]**
- [ ] Límite de tamaño del body (y más estricto donde no hace falta más). **[MEDIUM]**
- [ ] Timeouts de servidor configurados y coherentes con el balanceador. **[MEDIUM]**
- [ ] Ruta 404 para endpoints inexistentes con el formato de error estándar. **[LOW]**
- [ ] Graceful shutdown ante `SIGTERM`, cerrando conexiones a base de datos, caché y colas. **[MEDIUM]**; **[HIGH]** si los despliegues cortan operaciones a medias.

## 5. CORS y cabeceras

- [ ] CORS con lista blanca explícita; sin reflejar `Origin` ni `*` con credenciales. **[HIGH]**
- [ ] `X-Content-Type-Options: nosniff`; sin `X-Powered-By`/`Server` detallados. **[LOW]**
- [ ] `Cache-Control: no-store` en respuestas con datos personales. **[MEDIUM]**
- [ ] `Content-Type` correcto en respuestas; se rechazan tipos de body inesperados. **[LOW]**

## Cómo inspeccionar rápido

- Mass assignment: buscar `create(req.body`, `update(req.body`, `.save(req.body`, `**request.data`, `Model(**payload.dict())` sin filtrado, `@RequestBody Entity`.
- Serialización de entidades: `res.json(user)`, `return entity` en controladores, modelos del ORM como tipo de respuesta.
- Paginación: parámetros `limit`/`size` usados sin `Math.min`/`max` o sin validación.
- Errores: `catch (e) { res.status(500).json({ error: e.message })`, `e.stack` en respuestas, `DEBUG=True`, `include-stacktrace`.
- CORS: `origin: true`, `origin: '*'` junto a `credentials: true`, `allow_origins=["*"]` con `allow_credentials=True`.
- Shutdown: ausencia de manejadores de `SIGTERM` o de cierre de pools.
