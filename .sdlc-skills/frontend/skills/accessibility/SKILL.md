---
name: accessibility
description: Construye y audita accesibilidad web según WCAG 2.2 AA en Vue, React y Angular. Cubre navegación por teclado y trampas de foco, gestión de foco en modales y cambios de ruta, foco visible y no oculto, HTML semántico y ARIA (patrones APG de dialog, menu, tabs, combobox, disclosure), lectores de pantalla y regiones live, contraste de texto y de componentes, formularios accesibles, objetivos táctiles, reflow y zoom, movimiento reducido y pruebas automáticas (axe) y manuales. Úsala al crear componentes interactivos, antes de un release público o para certificar cumplimiento. No la uses para tokens y estilos (design-system) ni para crítica de UX general (ux-review).
---

# Accesibilidad (WCAG 2.2 AA)

Cualquier persona tiene que poder completar las tareas de la aplicación: con teclado, con lector de pantalla, con zoom al 200%, con poca visión de color o con temblor en las manos. Esta skill construye componentes que lo garantizan y audita el cumplimiento citando el criterio WCAG exacto.

## Cuándo usarla

- Crear componentes interactivos compuestos: modal, drawer, menú desplegable, tabs, acordeón, combobox/autocompletado, tooltip, toast, tabla con ordenación.
- Antes de un release público o cuando hay requisitos legales de accesibilidad.
- Modales que pierden el foco, contenido inoperable con teclado, mensajes dinámicos que el lector de pantalla no anuncia.
- Certificar un flujo crítico (registro, login, checkout) con lector de pantalla.

**No es para:** definir tokens, temas y variantes (aunque el contraste se corrija allí) → `design-system` · crítica general de usabilidad → `ux-review` · lógica de formularios → `forms` (esta skill audita su parte accesible).

## Paso 0: contexto (ambos modos)

1. Detecta framework y librerías de componentes (las headless como Radix, Reka UI, React Aria o Angular CDK ya resuelven gran parte del teclado y ARIA). Carga [vue.md](references/vue.md), [react.md](references/react.md) o [angular.md](references/angular.md).
2. Comprueba qué herramientas hay: plugin de lint de accesibilidad, axe en tests, Storybook con addon a11y.
3. Si la app se puede ejecutar y hay herramienta de navegador, úsala: la accesibilidad se verifica en el DOM renderizado, no solo leyendo plantillas.
4. Pregunta el nivel objetivo si no es evidente (por defecto **WCAG 2.2 AA**) y si hay un marco legal concreto.

## Modo Construir

1. **HTML nativo primero.** `<button>`, `<a href>`, `<input>`, `<dialog>`, `<details>`, `<label>`, encabezados y landmarks. ARIA solo cuando no hay un elemento nativo para ese patrón.
2. **Componentes compuestos con el patrón APG correspondiente** (roles, estados y teclado). Ver [patterns.md](references/patterns.md). Si el proyecto tiene una librería headless, úsala en lugar de reimplementar.
3. **Gestión de foco:** al abrir un modal, foco dentro y confinado; `Escape` cierra; al cerrar, foco al elemento que lo abrió. Al cambiar de ruta en una SPA, foco y anuncio del nuevo contenido.
4. **Nombre accesible** para todo control (texto visible, `<label>`, `aria-label` en botones de solo icono). El nombre accesible contiene el texto visible (WCAG 2.5.3).
5. **Cambios dinámicos anunciados** con regiones live (`role="status"`, `role="alert"`).
6. **Visual:** foco visible con contraste ≥ 3:1, contraste de texto ≥ 4.5:1 (3:1 grande), objetivos ≥ 24×24 px, sin depender solo del color, `prefers-reduced-motion`. Los tokens se ajustan en `design-system`.
7. **Prueba** con teclado y con axe (ver [testing.md](references/testing.md)) antes de entregar. Entrega según [output-formats.md § Construir](../../standards/output-formats.md#modo-construir).

## Modo Auditar

1. Delimita el alcance: pantallas y flujos críticos primero (login, registro, checkout, formularios principales).
2. **Automático:** axe (DevTools, Playwright, Storybook) y lint. Detecta solo una parte de los problemas (en torno a un tercio); nunca es suficiente por sí solo.
3. **Manual con teclado:** recorre cada flujo solo con `Tab`, `Shift+Tab`, `Enter`, `Espacio`, flechas y `Escape`.
4. **Lector de pantalla:** prueba rápida de los flujos críticos (NVDA o VoiceOver).
5. **Visual:** contraste, zoom al 200% y reflow a 320 px ([viewports.md](../../standards/viewports.md)), espaciado de texto, modo oscuro.
6. Recorre [checklist.md](references/checklist.md); cada hallazgo cita el **criterio WCAG y su nivel** (p. ej. `WCAG 2.2 · 2.4.7 Foco visible · AA`).
7. Clasifica con [severity.md](../../standards/severity.md) y entrega según [output-formats.md § Auditar](../../standards/output-formats.md#modo-auditar) con código `FE-A11Y`. Indica qué se verificó manualmente y qué solo de forma automática.

## Principios

1. **No uses ARIA si puedes usar HTML nativo.** Un `<div role="button">` necesita `tabindex`, manejo de `Enter` y `Espacio` y estado; un `<button>` ya lo trae.
2. **Mal ARIA es peor que ningún ARIA.** Un rol o estado incorrecto engaña al lector de pantalla.
3. **Todo lo que se hace con ratón se hace con teclado**, en un orden lógico y sin trampas.
4. **El foco siempre es visible y siempre está en un sitio razonable**, sobre todo tras abrir/cerrar overlays y navegar.
5. **Lo que cambia sin recargar se anuncia.**
6. **El color nunca es el único medio** de transmitir información.
7. **Las herramientas automáticas son el suelo, no el techo.** La certificación requiere prueba manual.

## Coordinación con `design-system`

Esta skill detecta y cita la violación; si la causa raíz es un token (contraste de color) o un componente base (tamaño, foco visible), la corrección se hace en `design-system` para que se arregle en todas partes, no en la vista.

## Referencias

| Archivo | Cuándo cargarlo |
| :--- | :--- |
| [patterns.md](references/patterns.md) | Modo Construir y para escribir correcciones. |
| [checklist.md](references/checklist.md) | Modo Auditar. |
| [testing.md](references/testing.md) | Siempre que haya que verificar (ambos modos). |
| [vue.md](references/vue.md) · [react.md](references/react.md) · [angular.md](references/angular.md) | Según el stack. |

## Skills relacionadas

- `design-system`: tokens de color con contraste suficiente, foco visible, tamaños de componentes base.
- `forms`: estructura de formularios; esta skill verifica etiquetas, errores y anuncios.
- `responsive-layout`: reflow a 320 px sin scroll horizontal (WCAG 1.4.10).
- `ux-review`: barreras de usabilidad que no son estrictamente WCAG.
- `testing`: axe en tests de componentes y consultas por rol.
- `routing`: título, foco y anuncio en cada cambio de ruta.
