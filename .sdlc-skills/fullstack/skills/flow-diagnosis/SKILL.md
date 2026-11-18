---
name: flow-diagnosis
description: Diagnostica y audita flujos de usuario que atraviesan frontend y backend (UI → estado → petición HTTP → middlewares → validación → dominio → base de datos → respuesta → render) para localizar con evidencia la capa donde se rompe un dato o una acción, y corregir en la causa raíz. Cubre datos que se pierden o transforman, fechas desplazadas, dobles envíos, errores tragados, estados desincronizados tras guardar, carreras entre peticiones y flujos que funcionan en local pero no en producción. Úsala cuando "algo falla" en un flujo y no está claro en qué capa, o para revisar de punta a punta los flujos críticos. No para auditar un área completa de una capa (frontend:audit, backend:audit).
---

# Diagnóstico de flujos entre capas

Un flujo roto se ve en la pantalla, pero la causa puede estar en cualquiera de las ocho o diez etapas que recorre el dato. Adivinar la capa culpable cuesta horas y suele "arreglar" el síntoma en el sitio equivocado (un `|| 0` en el cliente para tapar un `null` que envía el servidor). Esta skill **sigue el dato de punta a punta, con evidencia en cada salto**, hasta encontrar la primera etapa donde deja de ser correcto.

## Cuándo usarla

- "Al guardar X, se guarda mal / no se guarda / aparece duplicado."
- Datos que se ven bien en la base de datos y mal en pantalla, o al revés.
- Errores que el usuario no ve, o que ve sin saber qué hacer.
- La pantalla no refleja el cambio tras guardar hasta recargar.
- Funciona en local y falla en staging o producción (CORS, cookies, proxies, zonas horarias, variables de entorno).
- Revisar de punta a punta los flujos críticos antes de un release.

**No es para:** auditar un área completa → `frontend:audit` o `backend:audit` · desajustes sistemáticos entre todos los endpoints → `contracts` · rendimiento de un flujo lento → `frontend:performance` o `backend:performance` (esta skill sí localiza en qué etapa se va el tiempo).

## Paso 0: contexto

1. **Reproduce:** pasos exactos, datos de entrada, entorno, usuario o rol, frecuencia (siempre, a veces, solo en producción).
2. **Delimita el flujo:** pantalla y acción de inicio, endpoint(s) implicados, tablas o servicios externos tocados.
3. **Fuentes de evidencia disponibles:** código de ambas capas, pestaña Network o HAR, logs con ID de correlación, trazas, consultas a la base de datos, tests existentes.
4. Si vas a corregir en una capa, carga la skill y la nota de stack de esa capa (ver [patterns.md § Escalado](references/patterns.md#escalado-a-skills-de-capa)); si falta el plugin, avísalo.
5. Si existe `.sdlc/context.md`, léelo y respeta sus convenciones y decisiones ([context.md](../../standards/context.md)).

## Modo Diagnosticar (por defecto)

1. **Dibuja el recorrido** etapa a etapa con [patterns.md § Mapa del flujo](references/patterns.md#mapa-del-flujo).
2. **Busca la primera etapa incorrecta** comparando el valor esperado y el real en cada frontera, empezando por **el cable** (petición y respuesta reales): divide el flujo en dos y descarta la mitad sana. Ver [patterns.md § Método](references/patterns.md#método-de-bisección).
3. **Contrasta con el catálogo** de [patterns.md § Fallos frecuentes](references/patterns.md#fallos-frecuentes-por-etapa).
4. **Confirma la causa** con una prueba que falla antes de corregir (test, petición reproducible o consulta).
5. **Corrige en la causa raíz,** no en la etapa donde se ve el síntoma; si la corrección cruza capas, indica el orden de despliegue (→ `contracts`).
6. **Blinda:** test de regresión en la capa corregida y, si el flujo es crítico, un test E2E o de contrato.
7. Entrega: recorrido con la etapa culpable marcada, evidencia, corrección y test, según [output-formats.md](../../standards/output-formats.md) con código `FS-FLOW`.

## Modo Construir

Para un flujo nuevo o rehecho, diseña cada etapa para que falle de forma visible y diagnosticable. Ver [patterns.md § Flujos robustos](references/patterns.md#flujos-robustos): validación en las dos capas (la del servidor manda), errores tipados de punta a punta, envío único (botón deshabilitado + idempotencia en el servidor), actualización de la caché del cliente tras guardar, y un ID de correlación del clic al log.

## Modo Auditar

1. Selecciona los flujos críticos (login, alta, pago, guardado de los datos principales) o los que pida el usuario.
2. Recorre cada uno con el mapa del flujo y [checklist.md](references/checklist.md), etapa por etapa, sin necesidad de un fallo reportado.
3. Clasifica con [severity.md](../../standards/severity.md) y entrega según [output-formats.md § Auditar](../../standards/output-formats.md#modo-auditar) con código `FS-FLOW`.

## Principios

1. **Seguir el dato, no la intuición:** evidencia en cada frontera.
2. **El cable primero:** la petición y la respuesta reales dividen el problema en dos.
3. **La primera etapa incorrecta es la culpable;** las siguientes solo propagan el error.
4. **Reproducir antes de corregir,** y dejar un test que lo impida volver.
5. **Corregir en la causa raíz,** aunque esté en la otra capa.
6. **Diferencias de entorno son sospechosas por defecto** cuando "en local funciona".

## Handoffs

Según [handoffs.md](../../standards/handoffs.md): profundidad máxima de 2, alcance acotado, sin reinvocar skills ya aplicadas y registro de pendientes.

| Disparador (observable) | Skill | Alcance y contexto que se pasa |
| :--- | :--- | :--- |
| Se identifica la etapa culpable | Skill de esa etapa ([patterns.md § Escalado](references/patterns.md#escalado-a-skills-de-capa)) | Etapa, evidencia (petición, respuesta, consulta) y test que falla |
| El mismo desajuste aparece en otros endpoints | `contracts` | Endpoint de origen y patrón del desajuste |
| Registros duplicados por reintento o doble envío | `backend:api-design` · `backend:data-access` | Endpoint (idempotencia) y tabla (constraint único) |
| No hay evidencia suficiente: sin ID de correlación, logs ni trazas del flujo | `backend:observability` · `frontend:observability` | Flujo y etapas sin visibilidad |
| Solo falla en producción por configuración (variables, cookies, CORS, zona horaria) | `backend:tooling` | Diferencias de configuración detectadas |

## Referencias

| Archivo | Cuándo cargarlo |
| :--- | :--- |
| [patterns.md](references/patterns.md) | Siempre: mapa del flujo, método, fallos frecuentes, flujos robustos y escalado. |
| [checklist.md](references/checklist.md) | Modo Auditar. |

## Skills relacionadas

- `contracts`: si el fallo es un desajuste de contrato que se repite en otros endpoints.
- `frontend:data-fetching`, `frontend:state-management`, `frontend:forms`: etapas del cliente.
- `backend:http-layer`, `backend:domain-logic`, `backend:data-access`: etapas del servidor.
- `backend:observability` y `frontend:observability`: ID de correlación y trazas que hacen el diagnóstico rápido.
