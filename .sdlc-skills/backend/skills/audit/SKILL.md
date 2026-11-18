---
name: audit
description: Orquesta una auditoría completa o parcial del backend combinando las skills del plugin backend. Hace el triage del objetivo, elige una ruta (integral, seguridad, rendimiento, integridad de datos, contrato, fiabilidad, producción, pre-release, cimientos, privacidad), aplica cada skill en modo Auditar, deduplica hallazgos, calcula una puntuación por área y global (0–100) y entrega un dictamen único con plan de remediación priorizado; opcionalmente ejecuta la remediación por lotes. Úsala para revisar un servicio de principio a fin, decidir si está listo para producción o cuando no está claro qué skill aplicar. No la uses si ya sabes qué área revisar.
---

# Auditoría orquestada del backend

Esta skill no audita código por sí misma: **decide qué skills del plugin `backend` aplicar, en qué orden y sobre qué alcance, y convierte sus resultados en un único dictamen** con prioridades claras. Es la puerta de entrada cuando la pregunta es amplia ("¿cómo está este servicio?", "¿está listo para producción?") o el síntoma es difuso.

## Cuándo usarla

- Revisar un servicio o módulo completo.
- Decidir si un servicio está listo para producción o un release está listo para publicarse.
- Síntoma difuso (incidentes recurrentes, lentitud general, "algo falla con los pagos").
- Obtener una línea base con puntuación para comparar en el tiempo.

**No es para:** un área concreta y conocida → invoca la skill directamente (`/backend:data-access`, `/backend:authorization`…) · frontend → `frontend:audit` · cargas, DAST y E2E → dominio QA (ver [routes.md § Escalado](references/routes.md#escalado-a-otros-dominios)).

## Paso 0: triage

1. **Alcance:** servicio, módulos o endpoints; repositorio y, si existe, entorno accesible (staging) y acceso a métricas.
2. **Objetivo:** auditoría completa, preocupación concreta, preparación para producción o pre-release.
3. **Contexto:** stack (manifiestos), tipo de sistema (API pública, interna, multi-tenant, financiero, datos sensibles), escala y requisitos (cumplimiento, SLOs).
4. **Ruta:** elige una de [routes.md](references/routes.md) y **explica en una línea por qué**; si no encaja ninguna, compón una secuencia y justifícala.

Si el alcance es enorme, empieza por los flujos críticos (autenticación, pagos, escritura de datos principales) y amplía después.

## Paso 1: elegir modo y confirmar el coste

Una auditoría orquestada carga varias skills (cada una con su checklist y su nota de stack: del orden de 4.000–5.000 tokens por skill) y recorre buena parte del código, así que puede consumir mucho contexto y cuota de uso. **Antes de empezar, presenta al usuario la ruta elegida y estos modos, con las skills concretas que entrarían en cada uno para este proyecto, y espera su elección:**

| Modo | Qué incluye | Skills | Coste orientativo |
| :--- | :--- | :---: | :--- |
| **Completa** | Todas las skills aplicables de la ruta, checklists completos, puntuación por área y global | las de la ruta (hasta 17) | Alto: ≈ 4–5 k tokens por skill + lectura del código |
| **Enfocada** (por defecto) | Las 4–6 skills de mayor riesgo para el contexto (p. ej. `authentication`, `authorization`, `api-security`, `data-access` en un sistema multi-tenant con datos personales) | 4–6 | Medio |
| **Rápida** | Las 2–3 skills más críticas, solo los puntos CRITICAL/HIGH de sus checklists, sin puntuación global | 2–3 | Bajo |

- El coste real depende sobre todo del tamaño del código: si el alcance es grande, dilo y propón acotarlo (un módulo, los flujos críticos).
- **No preguntes** si el usuario ya fijó el alcance (pidió un modo, una ruta o una lista de skills) o si la ejecución no es interactiva: aplica lo pedido (o el modo enfocado) y decláralo en el informe.
- Tras la confirmación, no vuelvas a preguntar entre una skill y otra.

## Modo Auditar (por defecto)

1. **Carga las skills del modo elegido.** De cada una: `SKILL.md`, `references/checklist.md` y la nota del stack detectado (`references/node.md`, `python.md` o `java.md`). Con herramienta de skills, `backend:<skill>`; si no, lee los archivos (`../<skill>/…`). Deja `references/patterns.md` para escribir las correcciones de los hallazgos CRITICAL y HIGH. Registra lo que cargaste de cada skill en el anexo obligatorio «Referencias cargadas» del informe; si omites algo (por coste o porque no aplica), dilo allí.
2. **Inventaria el código una sola vez** (rutas, controladores, servicios, consultas, middlewares, configuración, manifiestos) y ejecuta las comprobaciones baratas disponibles (type-check, auditoría de dependencias, `git ls-files` para secretos versionados). Después **aplica cada checklist completo** sobre ese inventario, en lugar de releer el código por cada skill.
3. **Paralelización opcional:** con alcance grande, si el entorno permite subagentes y el usuario está de acuerdo, un subagente por área con el mismo alcance y el formato de [output-formats.md](../../standards/output-formats.md); revisa que cada informe cite archivo y líneas antes de consolidar.
4. **Control de calidad:** hallazgos sin evidencia, sin severidad o sin corrección aplicable se rehacen o se descartan. Cada CRITICAL indica cómo se verificó (archivo, comando o petición).
5. **Consolida** con [report-template.md](references/report-template.md):
   - **Deduplica:** el mismo problema visto por varias skills (p. ej. N+1 en `data-access` y en `performance`; IDOR en `authorization` y en `api-security`; secretos en `tooling` y en `api-security`) es un hallazgo, con la corrección en la causa raíz.
   - Ordena por severidad ([severity.md](../../standards/severity.md)) y, a igual severidad, por esfuerzo.
   - Puntúa con la [rúbrica](references/report-template.md#rúbrica-de-puntuación).
   - Escala lo que no es del backend.
6. **Entrega** en el chat y, si es largo o se pide, en `audit-backend-<fecha>.md`.

## Modo Remediar

1. Agrupa los hallazgos en **lotes** por prioridad y área (primero CRITICAL/HIGH; cada lote coherente con una skill).
2. Aplica cada lote con la skill correspondiente en modo **Construir**.
3. Tras cada lote: tests, lint, tipos y, si hay cambios de esquema, revisión de la migración (→ `schema-and-migrations`). Informa de lo hecho y de lo no verificado antes de seguir.
4. Cambios con riesgo operativo (migraciones sobre tablas grandes, cambios incompatibles de API, rotación de secretos) se presentan para aprobación antes de aplicarlos.
5. Al terminar, actualiza la puntuación.

## Principios

1. **Ruta justificada** por el objetivo; cada skill aplicada tiene un motivo.
2. **Profundidad sobre amplitud:** mejor pocas áreas bien auditadas que todas a medias; dilo si no se cubre todo.
3. **Un problema, un hallazgo,** corregido en su causa raíz.
4. **Evidencia o nada:** archivo y líneas, consulta, endpoint o escenario reproducible.
5. **Datos, dinero y seguridad primero** al priorizar.
6. **La puntuación orienta;** se compara solo con auditorías hechas con la misma rúbrica.
7. **Declara los límites:** qué no se pudo verificar (sin entorno, sin métricas, sin acceso a producción).
8. **Coste a la vista:** el usuario conoce y acepta el alcance y el coste aproximado antes de una auditoría extensa.

## Referencias

| Archivo | Cuándo cargarlo |
| :--- | :--- |
| [routes.md](references/routes.md) | Siempre: rutas, selección y escalado. |
| [report-template.md](references/report-template.md) | Al consolidar: plantilla del dictamen y rúbrica. |

## Skills que orquesta

`architecture` · `api-design` · `http-layer` · `domain-logic` · `data-access` · `schema-and-migrations` · `authentication` · `authorization` · `api-security` · `async-messaging` · `integrations` · `caching` · `observability` · `performance` · `testing` · `tooling` · `data-privacy`
