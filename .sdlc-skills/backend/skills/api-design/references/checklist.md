# Checklist de auditoría — diseño de la API

Severidad orientativa entre corchetes ([severity.md](../../../standards/severity.md)). En APIs públicas o consumidas por apps móviles, los problemas de contrato pesan más (los clientes no se actualizan a la vez).

## 1. Recursos y métodos

- [ ] Recursos con nombres consistentes (plural, sustantivos); acciones no CRUD como subrecursos claros. **[LOW]**
- [ ] `GET` nunca cambia estado. **[HIGH]**
- [ ] `PUT` y `DELETE` son idempotentes. **[MEDIUM]**
- [ ] Anidamiento de un nivel como máximo. **[LOW]**

## 2. Códigos de estado

- [ ] Los errores usan códigos 4xx/5xx reales, no `200` con un indicador de fallo. **[MEDIUM]**; **[HIGH]** en APIs públicas.
- [ ] `201` + `Location` al crear; `204` sin cuerpo; `202` en operaciones asíncronas. **[LOW]**
- [ ] 401 vs 403 vs 404 usados con su significado. **[LOW–MEDIUM]**
- [ ] Frontera 400/422 documentada y aplicada igual en todos los endpoints. **[LOW]**
- [ ] `429` con `Retry-After`; `503` en mantenimiento o dependencias caídas. **[LOW]**

## 3. Errores

- [ ] Formato único (Problem Details u otro documentado) en todos los endpoints. **[MEDIUM]**
- [ ] Códigos de error estables y documentados; los clientes no dependen de los mensajes. **[MEDIUM]**
- [ ] Errores de validación por campo con la ruta del campo. **[MEDIUM]**
- [ ] Identificador de petición en los errores. **[LOW]**

## 4. Convenciones

- [ ] Una sola convención de nombres de campos. **[MEDIUM]**
- [ ] Fechas ISO 8601 con zona (UTC); fechas de calendario sin hora. **[MEDIUM]**
- [ ] Dinero como decimal en string o entero en unidad mínima, con moneda. **[HIGH]** si se usa float.
- [ ] IDs como strings (o enteros seguros para JS). **[MEDIUM]** si hay IDs mayores de 2^53.
- [ ] Enumeraciones como strings estables. **[LOW]**
- [ ] Forma de colecciones consistente. **[LOW–MEDIUM]**

## 5. Colecciones

- [ ] Todas las colecciones paginadas con límite por defecto y máximo documentados. **[HIGH]** si alguna devuelve todo sin límite.
- [ ] Paginación por cursor en colecciones grandes o que cambian a menudo. **[MEDIUM]**
- [ ] Filtros y orden con lista blanca de campos. **[MEDIUM]**

## 6. Idempotencia y concurrencia

- [ ] Creaciones con efectos económicos u operativos aceptan `Idempotency-Key` y la implementan correctamente (misma respuesta, conflicto con cuerpo distinto, peticiones concurrentes). **[HIGH]** en pagos/pedidos.
- [ ] Recursos editados por varios actores usan `ETag`/`If-Match` (o versión). **[MEDIUM]**
- [ ] Operaciones largas con `202` y recurso de estado en lugar de peticiones que esperan minutos. **[MEDIUM]**
- [ ] Operaciones masivas con límite y resultado por elemento. **[LOW–MEDIUM]**

## 7. Evolución y documentación

- [ ] Especificación OpenAPI (u otra) en el repositorio, actualizada y verificada contra la implementación. **[MEDIUM]**
- [ ] Linter de la especificación en CI. **[LOW]**
- [ ] Detección de cambios incompatibles en CI (diff de especificaciones). **[MEDIUM]** en APIs con clientes externos.
- [ ] Los cambios incompatibles van a una versión nueva con plan de deprecación (`Deprecation`, `Sunset`, comunicación, métricas de uso). **[HIGH]** si se han roto clientes en producción.
- [ ] Catálogo de errores y límites documentado. **[LOW–MEDIUM]**

## Cómo inspeccionar rápido

- Especificación: buscar `openapi.yaml|json`, `@fastify/swagger`, `@nestjs/swagger`, `drf-spectacular`, `springdoc`; si se genera, descargarla (`/openapi.json`) y revisarla.
- Lint: `npx @stoplight/spectral-cli lint openapi.yaml`; cambios incompatibles: `oasdiff breaking old.yaml new.yaml`.
- Respuestas `200` con errores: buscar `success: false`, `res.status(200).json({ error`.
- `GET` con efectos: handlers `get(` que llaman a `create`/`update`/`delete`/`send`.
- Paginación: endpoints de lista sin `limit`/`cursor`/`page`.
- Mezcla de convenciones: campos `snake_case` y `camelCase` en los mismos DTOs o en distintos endpoints.
