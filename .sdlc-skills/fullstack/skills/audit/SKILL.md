---
name: audit
description: Orquesta una auditoría de una aplicación completa (frontend + backend) combinando frontend:audit, backend:audit y las skills de este plugin (contracts, flow-diagnosis, topology). Hace el triage, elige una ruta conjunta (integral, seguridad de punta a punta, contrato e integración, rendimiento de punta a punta, pre-release, estructura), presenta un único aviso de coste con los modos completa, enfocada y rápida, ejecuta las auditorías de cada capa con el alcance ya fijado, deduplica hallazgos entre capas, calcula una puntuación por capa y conjunta (0–100) y entrega un dictamen único con plan de remediación coordinado entre capas. Úsala para revisar una aplicación de punta a punta o decidir si está lista para producción. No la uses para una sola capa (frontend:audit, backend:audit).
---

# Auditoría orquestada fullstack

Esta skill no audita código por sí misma: **coordina las auditorías de cada capa y lo que solo se ve entre ellas.** Un token en `localStorage` es un hallazgo de frontend; una API sin protección CSRF, uno de backend; los dos juntos son **un único riesgo** con una corrección coordinada en ambas capas. Ese cruce es lo que aporta esta skill.

## Cuándo usarla

- Revisar una aplicación completa (frontend y backend) o un módulo de negocio de punta a punta.
- Decidir si una aplicación está lista para producción o un release está listo para publicarse.
- Síntoma difuso que puede estar en cualquier capa.
- Línea base con puntuación conjunta para comparar en el tiempo.

**No es para:** una sola capa → `frontend:audit` o `backend:audit` · un flujo concreto que falla → `flow-diagnosis` · solo el contrato → `contracts`.

**Requiere** los plugins `frontend` y `backend`. Si falta uno, avísalo al empezar: la auditoría cubre la capa disponible más `contracts` (con lectura directa del código de la otra capa) y el informe lo declara en sus límites.

## Paso 0: triage

1. **Alcance:** carpetas de cada capa (p. ej. `apps/web` + `apps/api`), módulos o flujos; entorno accesible si existe.
2. **Objetivo:** completa, preocupación concreta, producción o pre-release.
3. **Contexto:** stack de cada capa, tipo de producto (B2C, B2B multi-tenant, interno), datos sensibles, escala.
4. **Ruta:** elige una de [routes.md](references/routes.md) y **explica en una línea por qué**. La ruta fija qué ruta de `frontend:audit` y de `backend:audit` se aplica y qué skills de este plugin entran.
5. Si existe `.sdlc/context.md`, léelo y respeta sus convenciones y decisiones ([context.md](../../standards/context.md)).

## Paso 1: elegir modo y confirmar el coste (una sola vez)

Una auditoría fullstack suma las de ambas capas: es la operación más cara del kit. **Antes de empezar, presenta la ruta, las skills concretas que entrarían por capa en cada modo y espera la elección del usuario:**

| Modo | Frontend | Backend | Entre capas | Coste orientativo |
| :--- | :--- | :--- | :--- | :--- |
| **Completa** | `frontend:audit` completa en su ruta | `backend:audit` completa en su ruta | `contracts` + `flow-diagnosis` (flujos críticos) + `topology` si aplica | Muy alto: ≈ 4–5 k tokens por skill (hasta ~35 skills) + lectura del código de ambas capas |
| **Enfocada** (por defecto) | 3–4 skills de mayor riesgo | 3–4 skills de mayor riesgo | `contracts` + `flow-diagnosis` sobre 1–3 flujos críticos | Medio–alto |
| **Rápida** | 1–2 skills, solo CRITICAL/HIGH | 1–2 skills, solo CRITICAL/HIGH | `contracts` sobre el flujo principal | Medio; sin puntuación conjunta |

- Si el código es grande, dilo y propón acotar a un módulo de negocio de punta a punta.
- **No preguntes** si el usuario ya fijó el alcance o si la ejecución no es interactiva: aplica lo pedido (o el modo enfocado) y decláralo.
- **Esta es la única confirmación.** Al invocar `frontend:audit` y `backend:audit`, pásales la ruta, el modo y la lista de skills ya decididos: con el alcance fijado, sus propios Pasos 1 no vuelven a preguntar.

## Modo Auditar (por defecto)

1. **Inventario único** de ambas capas (estructura, manifiestos, rutas del backend, consumidores del frontend, configuración de sesión, CORS y entornos) y comprobaciones baratas (type-check, auditoría de dependencias, `git ls-files` para secretos versionados). Las auditorías de capa reutilizan este inventario.
2. **Auditoría de cada capa:** ejecuta `frontend:audit` y `backend:audit` (con herramienta de skills, `frontend:audit` / `backend:audit`; si no, lee sus `SKILL.md` y referencias) con la ruta, el modo y las skills decididos. Pide sus hallazgos en su formato (`FE-*`, `BE-*`) **sin** su dictamen final: la consolidación se hace aquí.
3. **Entre capas:** aplica `contracts` (tabla de cruce de los endpoints en alcance), `flow-diagnosis` en modo Auditar sobre los flujos críticos y, si la ruta lo pide, `topology`. Códigos `FS-*`.
4. **Paralelización opcional:** con alcance grande y subagentes disponibles, un subagente por capa más uno para lo cruzado, si el usuario está de acuerdo; revisa que cada informe cite archivo y líneas.
5. **Control de calidad:** sin evidencia, sin severidad o sin corrección aplicable, se rehace o se descarta. Cada CRITICAL indica cómo se verificó.
6. **Consolida** con [report-template.md](references/report-template.md):
   - **Deduplica entre capas** con [report-template.md § Deduplicación](references/report-template.md#deduplicación-entre-capas): un riesgo que necesita las dos capas para existir es **un hallazgo `FS-*`** con corrección en ambas y orden de despliegue; los hallazgos de capa que lo componen se referencian, no se repiten.
   - Ordena por severidad ([severity.md](../../standards/severity.md)) y, a igual severidad, por esfuerzo.
   - Puntúa con la [rúbrica](references/report-template.md#rúbrica-de-puntuación).
   - Completa el anexo obligatorio «Referencias cargadas» con lo cargado de cada plugin.
7. **Entrega** en el chat y, si es largo o se pide, en `audit-fullstack-<fecha>.md`. Actualiza `.sdlc/context.md` con los hallazgos abiertos y los handoffs pendientes.

## Modo Remediar

1. Agrupa en **lotes** por prioridad; un lote que cruza capas lleva el orden de despliegue (servidor amplía → cliente migra → servidor retira, ver `contracts`).
2. Aplica cada lote con la skill de capa correspondiente en modo **Construir** (`frontend:<skill>`, `backend:<skill>`, `contracts`).
3. Tras cada lote: tests, lint y tipos **en ambas capas** y, si cambia el contrato, regeneración de tipos y tests de contrato. Informa de lo hecho y lo no verificado.
4. Cambios incompatibles de contrato, migraciones con riesgo o rotación de secretos se presentan para aprobación antes de aplicarlos.
5. Al terminar, actualiza la puntuación.

## Principios

1. **Lo cruzado es el valor añadido:** cada capa ya tiene su auditoría; aquí se buscan los riesgos que solo existen entre ellas.
2. **Una confirmación de coste,** no tres.
3. **Un riesgo, un hallazgo,** con la corrección en todas las capas que lo necesitan y su orden de despliegue.
4. **Evidencia en ambas capas** para todo hallazgo `FS-*`.
5. **Profundidad sobre amplitud:** mejor un módulo de punta a punta bien auditado que todo a medias.
6. **Declara los límites:** plugins ausentes, entornos no accesibles, skills omitidas por coste.

## Handoffs

Como orquestador, no dispara handoffs por separado ([handoffs.md](../../standards/handoffs.md) regla 6): las skills se planifican en el Paso 1. Además:

| Disparador (observable) | Skill | Alcance y contexto que se pasa |
| :--- | :--- | :--- |
| Las auditorías de capa informan de handoffs pendientes | Se consolidan en «Escalado sugerido» del dictamen | Origen, destino y evidencia |
| Un flujo crítico falla durante la auditoría | `flow-diagnosis` (modo Diagnosticar) | Flujo y evidencia; se propone, no se ejecuta sin confirmación |
| La remediación pedida reconstruye una funcionalidad entera (varios lotes en ambas capas) | `feature` | Hallazgos del lote y criterios de aceptación; se propone con su coste |

## Referencias

| Archivo | Cuándo cargarlo |
| :--- | :--- |
| [routes.md](references/routes.md) | Siempre: rutas conjuntas y su correspondencia con las rutas de cada capa. |
| [report-template.md](references/report-template.md) | Al consolidar: deduplicación entre capas, rúbrica y plantilla. |

## Skills que orquesta

`frontend:audit` · `backend:audit` · `contracts` · `flow-diagnosis` · `topology`
