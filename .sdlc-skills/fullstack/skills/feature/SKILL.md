---
name: feature
description: Orquesta la construcción de una funcionalidad completa encadenando las skills de los plugins frontend, backend y fullstack en modo Construir hacia un objetivo ("añadir pagos con Stripe", "CRUD de proyectos con permisos por equipo", "subida de archivos", "notificaciones por email"). Descompone el objetivo en un plan por capas con recetas para los casos habituales, avisa del coste y pide confirmación, define primero el contrato, construye backend y frontend en orden, verifica cada paso con los checklists de las skills aplicadas, registra el avance en .sdlc/context.md y entrega lo hecho, lo verificado y lo pendiente. Úsala cuando el objetivo toca varias skills o ambas capas. No para un cambio de una sola área (invoca esa skill directamente) ni para auditar (audit).
---

# Construir una funcionalidad de punta a punta

Una funcionalidad real rara vez cabe en una sola skill: "añadir pagos" necesita diseño de API, reglas de dominio, idempotencia, integración con el proveedor, webhooks, formulario, estados de carga y tests en ambos lados. Esta skill **no construye por sí misma**: decide qué skills aplicar, en qué orden y con qué contrato común, y se asegura de que el resultado encaja entre capas.

## Cuándo usarla

- Un objetivo de producto que toca varias áreas o las dos capas.
- Rehacer una funcionalidad existente de forma coordinada.
- Cuando no está claro qué skills intervienen en lo que se quiere construir.

**No es para:** un cambio de una sola área → invoca esa skill (`/backend:data-access`, `/frontend:forms`…) · revisar código existente → `audit` · un fallo concreto → `flow-diagnosis`.

## Paso 0: contexto

1. **Objetivo y criterios de aceptación:** qué debe poder hacer el usuario y cómo se sabe que está hecho. Si es ambiguo, pregunta lo imprescindible (una vez, todo junto).
2. **Contexto compartido:** si existe `.sdlc/context.md`, léelo y respeta sus convenciones y decisiones ([context.md](../../standards/context.md)).
3. **Proyecto:** stack de cada capa (manifiestos), estructura, contrato existente (OpenAPI, `shared/`), patrones ya usados en funcionalidades parecidas: **la nueva se construye como las existentes** salvo que sean dañinas.
4. **Plugins disponibles:** `frontend` y `backend`. Si falta uno, el plan cubre la capa disponible y deja la otra como pendiente explícito.

## Paso 1: plan

1. Busca la receta más cercana en [recipes.md](references/recipes.md); si no encaja ninguna, compón el plan con el orden por defecto de [recipes.md § Orden](references/recipes.md#orden-por-defecto).
2. Ajusta la receta al proyecto: quita lo que ya existe, añade lo que el objetivo exige (multi-tenant, datos personales, alto tráfico).
3. Redacta el plan con [plan-template.md](references/plan-template.md): pasos, skill de cada paso, capa, entregable, dependencias y riesgos que requieren aprobación (migraciones sobre tablas grandes, cambios incompatibles de contrato, dependencias nuevas, secretos).

## Paso 2: elegir modo y confirmar el coste

Cada paso carga la skill (`SKILL.md` + `patterns.md` + nota de stack: del orden de 4.000–6.000 tokens) y escribe código en ambas capas. **Presenta el plan con estos modos y espera la elección:**

| Modo | Qué incluye | Coste orientativo |
| :--- | :--- | :--- |
| **Completa** | Todos los pasos de la receta ajustada, tests en ambas capas y verificación final con los checklists de cada skill aplicada | Alto: ≈ 5 k tokens por skill + el código |
| **Enfocada** (por defecto) | Los pasos imprescindibles para los criterios de aceptación con tests de los caminos críticos; el resto queda como pendiente | Medio |
| **Mínima** | Contrato, backend y frontend esenciales con verificación de tipos y tests básicos | Bajo |

- **No preguntes** si el usuario ya fijó el alcance o la ejecución no es interactiva: aplica lo pedido (o el modo enfocado) y decláralo.
- Tras la confirmación, no vuelvas a preguntar entre pasos salvo en los **riesgos marcados para aprobación**.

## Paso 3: construir

Para cada paso del plan, en orden:

1. **Carga la skill del paso** en modo Construir: con herramienta de skills, `<plugin>:<skill>`; si no, lee su `SKILL.md`, `references/patterns.md` y la nota de stack. Pásale el alcance, el contrato acordado y las decisiones previas.
2. **Construye** siguiendo la skill y las convenciones del proyecto.
3. **Verifica** antes de pasar al siguiente: type-check, lint y tests de lo tocado; en los pasos de contrato, regeneración de tipos.
4. **Registra** el avance en `.sdlc/context.md` (crea el archivo al empezar este paso si no existe y dilo).

Puntos de control (resumen breve al usuario, sin esperar respuesta salvo riesgo):
- tras el **contrato** (la pieza que une las capas);
- tras el **backend**;
- al terminar.

Los disparadores de handoff que aparezcan durante un paso se tratan según [handoffs.md](../../standards/handoffs.md) regla 6: si la skill ya está en el plan, se atiende en su paso; si no, se añade como paso opcional y se avisa.

## Paso 4: verificación y entrega

1. **Verificación cruzada:** aplica el modo rápido de los checklists de las skills usadas (solo puntos CRITICAL/HIGH) sobre lo construido, y `fullstack:contracts` sobre los endpoints nuevos (servidor ↔ cliente).
2. **Entrega** según [output-formats.md § Construir](../../standards/output-formats.md#modo-construir):
   - qué se construyó por capa (archivos);
   - cómo se verificó y qué no se pudo verificar;
   - orden de despliegue si hay migraciones o cambios de contrato;
   - pendientes (pasos omitidos por el modo, handoffs no ejecutados);
   - anexo «Skills aplicadas» con lo cargado de cada una.
3. Actualiza `.sdlc/context.md`: objetivo completado, decisiones tomadas, pendientes.

## Principios

1. **Contrato primero:** las dos capas se construyen contra un contrato acordado, no se ajustan después.
2. **El servidor manda:** reglas de negocio, precios y permisos viven en el backend; el frontend los consume.
3. **Como el resto del proyecto:** reutiliza patrones y componentes existentes antes de introducir nuevos.
4. **Pasos verificados:** no se avanza sobre un paso que no compila o no pasa sus tests.
5. **Coste y riesgos a la vista:** el usuario aprueba el plan y los cambios con riesgo operativo.
6. **Lo no hecho se dice:** cada pendiente queda en la entrega y en el contexto.

## Referencias

| Archivo | Cuándo cargarlo |
| :--- | :--- |
| [recipes.md](references/recipes.md) | Paso 1: recetas por tipo de funcionalidad y orden por defecto. |
| [plan-template.md](references/plan-template.md) | Paso 1: formato del plan y del anexo de entrega. |
| [handoffs.md](../../standards/handoffs.md) · [context.md](../../standards/context.md) | Reglas de encadenamiento y contexto compartido. |

## Skills que orquesta

Todas las de `frontend` y `backend` en modo Construir, más `contracts`, `topology` (si la funcionalidad exige reorganizar módulos) y `flow-diagnosis` (si un paso falla entre capas).
