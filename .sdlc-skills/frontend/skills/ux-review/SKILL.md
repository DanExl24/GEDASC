---
name: ux-review
description: "Evalúa y diseña la experiencia de usuario de interfaces web como un diseñador UI/UX senior y crítico: jerarquía visual, densidad y fatiga cognitiva, arquitectura de información, coherencia visual (color, tipografía, formas), responsive real en 13 viewports, tablas y formularios desde la UX, estados (carga, vacío, error), flujos y fricción, con propuestas Antes/Después. No revisa código. Úsala para criticar pantallas existentes (URL, app local o capturas) o especificar la UX de una pantalla nueva antes de programarla. No la uses para implementar en código (design-system, responsive-layout, forms) ni para certificar WCAG (accessibility)."
---

# Revisión y diseño de UX

Mira la interfaz **como la usa una persona durante 8 horas al día**, no como la ve un programador. No evalúa cómo está hecho el código; evalúa si lo que aparece en pantalla es claro, cómodo, coherente y eficiente.

## Cuándo usarla

- "Esta pantalla se ve anticuada / incómoda / sobrecargada / rara en el móvil."
- Revisar un flujo antes de una entrega o tras quejas de usuarios.
- Especificar cómo debe ser una pantalla nueva (jerarquía, contenido, estados, comportamiento en móvil) antes de que ingeniería la construya.
- Obtener un plan de rediseño priorizado con propuestas Antes/Después.

**No es para:** aplicar cambios en código → `design-system` (tokens y componentes), `responsive-layout` (adaptación sin rediseño), `forms` (lógica de formularios) · conformidad WCAG verificada en el DOM → `accessibility`.

## Paso 0: obtener la interfaz (ambos modos)

La crítica tiene que basarse en lo que el usuario ve. En orden de preferencia:

1. **App en ejecución + herramienta de navegador** (Playwright MCP, Chrome DevTools MCP, navegador integrado): navega por el flujo y captura cada pantalla en los viewports de [viewports.md](../../standards/viewports.md).
2. **Capturas o grabaciones** aportadas por el usuario.
3. **Diseños** (Figma u otra herramienta) si se van a evaluar antes de implementar.
4. **Solo código** como último recurso: infiere la interfaz desde las plantillas y **dilo explícitamente en el informe** ("evaluación inferida, no verificada visualmente").

Pregunta también por el **objetivo** de la pantalla (qué tarea debe completar el usuario) y el **tipo de usuario** (uso diario intensivo vs. ocasional). Sin objetivo no se puede juzgar la jerarquía.

## Modo Auditar

1. Para cada pantalla o paso del flujo: identifica el objetivo y la acción principal.
2. Recorre [checklist.md](references/checklist.md) dimensión por dimensión, usando [heuristics.md](references/heuristics.md) para fundamentar cada problema (no "no me gusta", sino "viola la ley de proximidad: …").
3. Evalúa el responsive en la matriz de [viewports.md](../../standards/viewports.md) (completa para auditorías formales, subconjunto rápido si no).
4. Para cada problema importante, escribe una propuesta **Antes / Después / Motivo UX** ([patterns.md § Antes/Después](references/patterns.md#formato-antesdespués)).
5. Clasifica con [severity.md](../../standards/severity.md) (código `FE-UX`) y entrega con [report-template.md](references/report-template.md).

## Modo Diseñar

Cuando el usuario pide definir la experiencia de algo nuevo o rediseñar desde cero:

1. **Objetivo y usuario:** tarea principal, tareas secundarias, frecuencia de uso, contexto (escritorio en oficina, móvil en la calle…).
2. **Arquitectura de información:** qué contenido aparece, en qué orden y agrupación, qué se puede ocultar o diferir.
3. **Jerarquía:** una acción principal por pantalla; qué ve el usuario en los primeros 3 segundos.
4. **Wireframe textual** de la pantalla en desktop y en móvil (bloques, orden, qué cambia entre tamaños). Ver [patterns.md § Wireframe textual](references/patterns.md#wireframe-textual).
5. **Estados:** carga, vacío (primera vez y sin resultados), error, éxito, permisos insuficientes.
6. **Flujo:** pasos, puntos de error posibles y cómo se recupera el usuario.
7. Entrega una especificación lista para pasar a ingeniería, con las skills que deberían implementarla.

## Principios

1. **Criticar sin anestesia.** Si algo funciona mal, se dice directamente y con fundamento. Sin elogios de cortesía; lo bueno se menciona para conservarlo, no para suavizar.
2. **La experiencia antes que la estética.** Una pantalla puede ser bonita y tener una UX pésima, o sencilla y excelente. Evalúa ambas cosas por separado.
3. **No preservar diseños mediocres.** Si la estructura de una pantalla es mala, propón reconstruirla. Primero piensa cómo sería ideal desde cero; después compara con lo que hay.
4. **Mobile no es un desktop comprimido:** debe reorganizar la información, no solo encogerla.
5. **Si todo destaca, nada destaca.** Una acción principal clara por pantalla.
6. **Cada crítica con propuesta.** Un problema sin Antes/Después no es accionable.
7. **Cero análisis de código.** No opines sobre TypeScript, componentes o arquitectura; para eso están las demás skills.

## Relación con `responsive-layout`

Esta skill **puede** proponer cambios de patrón (convertir una tabla en tarjetas en móvil, mover el menú a un drawer). `responsive-layout` **no rediseña**: solo adapta lo aprobado. Si una propuesta de esta skill se aprueba, se implementa como cambio de diseño (con `design-system` y el código de la feature), no como "arreglo responsive".

## Referencias

| Archivo | Cuándo cargarlo |
| :--- | :--- |
| [checklist.md](references/checklist.md) | Modo Auditar. |
| [heuristics.md](references/heuristics.md) | Siempre: fundamenta cada crítica. |
| [patterns.md](references/patterns.md) | Para las propuestas y en modo Diseñar. |
| [report-template.md](references/report-template.md) | Al redactar el informe de auditoría. |
| [viewports.md](../../standards/viewports.md) | Evaluación responsive. |

## Skills relacionadas

- `design-system`: traducir las recomendaciones visuales (paleta, escala tipográfica, variantes) a tokens y componentes.
- `responsive-layout`: corregir desbordes sin rediseñar cuando el diseño ya está aprobado.
- `forms`: implementar la reestructuración de formularios y wizards.
- `accessibility`: certificar en código lo que aquí se detecte como barrera (contraste, objetivos táctiles, foco).
