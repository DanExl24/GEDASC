---
name: api-design
description: "Diseña y audita el contrato de APIs REST (y notas de GraphQL y gRPC): modelado de recursos, semántica de métodos, códigos de estado, errores con RFC 9457 y códigos estables, paginación por cursor, filtros y orden, convenciones de nombres y formatos (fechas, dinero, IDs), idempotencia con Idempotency-Key, concurrencia con ETag/If-Match, operaciones largas, versionado y deprecación sin romper clientes, y diseño contract-first con OpenAPI. Úsala al diseñar endpoints nuevos, publicar una API o revisar su consistencia. No para implementar validación y error handler (http-layer)."
---

# Diseño de la API

El contrato de una API es una promesa: los clientes (frontend, apps móviles, integraciones de terceros) se construyen sobre él y no se actualizan a la vez que el servidor. Un buen diseño es **predecible** (los mismos patrones en todos los endpoints), **explícito** (errores y límites documentados) y **evolucionable** (se puede ampliar sin romper a nadie).

## Cuándo usarla

- Diseñar endpoints o una API nueva.
- Publicar una API para terceros o para otros equipos.
- Revisar la consistencia de una API existente (nombres, códigos, errores, paginación).
- Introducir versionado, deprecación o un flujo contract-first con OpenAPI.
- Operaciones que no son CRUD: acciones, procesos largos, operaciones masivas.

**No es para:** la implementación de validación, error handler y DTOs → `http-layer` · autenticación del cliente → `authentication` · desajustes concretos entre el frontend y la API → `fullstack:contracts` o `frontend:data-fetching`.

## Paso 0: contexto (ambos modos)

1. Detecta framework y si existe una especificación OpenAPI (generada desde el código o escrita a mano). Carga [node.md](references/node.md), [python.md](references/python.md) o [java.md](references/java.md).
2. Identifica los consumidores (frontend propio, móviles con versiones antiguas en circulación, terceros) y las convenciones ya establecidas en la API.
3. Si la API ya existe, respeta sus convenciones salvo que sean dañinas; la consistencia vale más que la perfección.

## Modo Construir

1. **Recursos y operaciones** con la semántica HTTP correcta. Ver [patterns.md § Recursos](references/patterns.md#recursos-y-métodos).
2. **Convenciones globales** decididas una vez: nombres, formatos de fecha, dinero e IDs, forma de las colecciones, formato de error. Ver [patterns.md § Convenciones](references/patterns.md#convenciones).
3. **Errores** con Problem Details (RFC 9457), un `type` y un código estable por tipo de error, y errores por campo.
4. **Colecciones** con paginación por cursor, filtros y orden de lista blanca, y límites documentados.
5. **Idempotencia** en las creaciones con efectos (pagos, pedidos) y **concurrencia optimista** donde se editan recursos compartidos.
6. **Contract-first:** escribe o genera la especificación OpenAPI, revísala con un linter y úsala para documentación, tipos de cliente y tests de contrato.
7. **Evolución:** solo cambios compatibles; los incompatibles, con versión nueva y plan de deprecación.
8. Entrega según [output-formats.md § Construir](../../standards/output-formats.md#modo-construir).

## Modo Auditar

1. Inventaria los endpoints (OpenAPI o rutas registradas) y compara sus convenciones entre sí.
2. Revisa códigos de estado, formato de errores, paginación, idempotencia y documentación.
3. Si se va a cambiar algo, comprueba si el cambio es incompatible con la [lista de cambios incompatibles](references/patterns.md#cambios-compatibles-e-incompatibles).
4. Recorre [checklist.md](references/checklist.md).
5. Clasifica con [severity.md](../../standards/severity.md) y entrega según [output-formats.md § Auditar](../../standards/output-formats.md#modo-auditar) con código `BE-API`.

## Principios

1. **Consistencia por encima de preferencias:** el mismo patrón en todos los endpoints.
2. **La semántica HTTP importa:** `GET` no cambia estado, `PUT` y `DELETE` son idempotentes, los códigos de estado significan lo que dicen.
3. **Los errores son parte del contrato:** formato único, códigos estables y documentados.
4. **Toda colección está paginada** y tiene límites.
5. **Las operaciones con efectos se pueden reintentar sin duplicar** (idempotencia).
6. **Nunca romper a los clientes existentes:** ampliar sí, cambiar o quitar con versión y deprecación.
7. **El contrato está escrito** (OpenAPI) y verificado contra la implementación.

## Referencias

| Archivo | Cuándo cargarlo |
| :--- | :--- |
| [patterns.md](references/patterns.md) | Siempre: recursos, convenciones, errores, paginación, idempotencia, versionado, GraphQL y gRPC. |
| [checklist.md](references/checklist.md) | Modo Auditar. |
| [node.md](references/node.md) · [python.md](references/python.md) · [java.md](references/java.md) | Según el stack. |

## Skills relacionadas

- `http-layer`: implementación del contrato (validación, DTOs, error handler).
- `data-access`: paginación por cursor y bloqueo optimista detrás de `ETag`.
- `async-messaging`: operaciones largas (202 + recurso de estado) y webhooks.
- `api-security`: límites de recursos e inventario de endpoints.
- `frontend:data-fetching` y `frontend:typescript`: el consumo del contrato y la generación de tipos.
