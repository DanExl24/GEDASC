---
name: responsive-layout
description: Implementa y corrige en código el comportamiento responsive de interfaces web (CSS moderno, Tailwind, cualquier framework) sin rediseñar. Verifica 13 viewports (de 320×568 a 1920×1080) con atención a alturas reducidas como 1366×768 y 1280×720, y aplica una jerarquía de intervención de 5 niveles (cajas, breakpoints, valores fluidos y container queries, estructura mínima, cambio de patrón como último recurso). Cubre contenedores, tablas, modales, formularios, dashboards, textos largos y shell de la aplicación. Úsala cuando un diseño aprobado se desborda, aparece scroll horizontal, modales se cortan o hay que hacer responsive un componente nuevo. No la uses para cambiar la estética o la UX (ux-review) ni para tokens y temas (design-system).
---

# Responsive layout (sin rediseñar)

El diseño ya está aprobado. El trabajo es que **la misma interfaz**, con su identidad, jerarquía y proporciones, funcione en cualquier tamaño de pantalla. No se cambia cómo se ve; se cambia cómo se adapta.

## Cuándo usarla

- El diseño está aprobado pero se rompe en ciertos tamaños: desbordes, elementos cortados, solapamientos.
- Scroll horizontal en la página completa al estrechar la ventana.
- Modales o drawers que no caben en laptops de `1366 × 768` o `1280 × 720`.
- Tablas anchas que rompen el layout en tablet o móvil.
- Formularios que deben pasar de 4 a 2 y a 1 columna.
- Hacer responsive un componente o pantalla nueva siguiendo un diseño dado.

**No es para:** decidir que una pantalla debería reorganizarse de otra forma (tabla → tarjetas, menú → barra inferior) → `ux-review` · tokens, temas y componentes base → `design-system` · accesibilidad completa → `accessibility` (esta skill garantiza el reflow de WCAG 1.4.10 y los objetivos táctiles).

## La regla: no rediseñar

**Prohibido** (salvo que el usuario lo pida explícitamente):
- Cambiar colores, fondos, tipografías, radios, sombras o iconografía.
- Cambiar textos, títulos, etiquetas o copys.
- Reemplazar componentes, crear nuevos patrones de navegación (bottom nav, tabs, acordeones, drawers) o eliminar bloques de información "porque ocupan mucho".
- Alterar la jerarquía o el orden lógico del contenido.
- Convertir todo en tarjetas apiladas al llegar a móvil.
- Introducir librerías de UI nuevas.

**Sobre-optimización prohibida:** no se reportan ni se tocan diferencias de 1–2 px sin impacto, elementos mínimamente descentrados, cambios naturales de distribución entre tamaños ni espacios vacíos razonables en pantallas anchas.

> Pregunta de control: *"¿Esto rompe la adaptación o es una preferencia estética?"* Si es preferencia, no se toca (y si parece un problema de UX real, se anota para `ux-review`).

## Jerarquía de intervención (en orden estricto)

```text
1. Cajas         width/max-width/min-width, gap, padding, margin, flex-wrap, min-w-0, grid-cols
2. Breakpoints   variantes responsive (sm/md/lg/xl/2xl o media queries) sobre las mismas propiedades
3. Fluido        clamp(), min(), max(), container queries, unidades dvh/svh, breakpoint propio justificado
4. Estructura    reorganizar wrappers del template sin cambiar datos, orden ni componentes
5. Patrón        cambiar el patrón de interacción. ÚLTIMO RECURSO, solo si 1–4 son imposibles, y avisando
```

Saltar directamente al nivel 5 está prohibido. Cada cambio del informe indica el nivel aplicado.

## Paso 0: contexto (ambos modos)

1. Detecta la tecnología de estilos (Tailwind v3/v4, CSS Modules, Sass, CSS-in-JS) y sus breakpoints reales (pueden estar personalizados). Carga [tailwind.md](references/tailwind.md) si aplica, y siempre [patterns.md](references/patterns.md).
2. Localiza el shell de la app (layout, header, sidebar) además de la vista concreta: muchos desbordes nacen ahí.
3. Consigue ver la interfaz en los viewports de [viewports.md](../../standards/viewports.md): herramienta de navegador de la sesión, script de Playwright o capturas del usuario. Si no es posible, trabaja sobre el código y marca la matriz como "inferida, no verificada".

## Modo Construir

Para hacer responsive un componente o pantalla nueva a partir de un diseño:

1. **Mobile-first:** estilos base para el móvil y variantes hacia arriba.
2. Layout con flex/grid y anchos relativos; nada de anchos fijos en contenedores.
3. Define en qué viewports cambia la estructura (columnas, sidebar) y verifica las transiciones intermedias.
4. Reserva alturas máximas y scroll interno en modales y paneles desde el inicio.
5. Verifica en la matriz completa y entrega según [output-formats.md § Construir](../../standards/output-formats.md#modo-construir).

## Modo Auditar y corregir

Por defecto se aplican las correcciones en el código; si el usuario solo quiere el diagnóstico, se entrega el informe sin modificar archivos.

1. Recorre la matriz de viewports y [checklist.md](references/checklist.md); registra el estado inicial de cada viewport.
2. Para cada problema, encuentra la **causa raíz** (el elemento que desborda, no el síntoma). `overflow-x: hidden` en el `body` oculta el problema; no lo resuelve.
3. Corrige con el nivel más bajo posible de la jerarquía.
4. Re-verifica en la matriz (estado posterior) y comprueba que no has roto otros tamaños.
5. Ejecuta la verificación de no-rediseño del checklist.
6. Clasifica con [severity.md](../../standards/severity.md) (código `FE-RESP`) y entrega con [report-template.md](references/report-template.md), incluyendo la sección de **problemas deliberadamente no modificados**.

## Principios

1. **Misma identidad en todos los tamaños.**
2. **El scroll horizontal de la página es un defecto; el de una tabla dentro de su contenedor, no.**
3. **El alto importa:** `1366 × 768` deja unos 650 px útiles. Modales, sidebars y CTAs se verifican por altura, no solo por ancho.
4. **Causa raíz, no parches:** sin `overflow: hidden` globales ni `!important` para tapar desbordes.
5. **El nivel más bajo que resuelva el problema.**
6. **No extrapolar:** cada viewport se verifica; también las transiciones entre ellos.
7. **Lo que no se toca se documenta**, con el motivo.

## Referencias

| Archivo | Cuándo cargarlo |
| :--- | :--- |
| [patterns.md](references/patterns.md) | Siempre: técnicas por tipo de problema. |
| [checklist.md](references/checklist.md) | Modo Auditar y corregir; también para verificar en Construir. |
| [tailwind.md](references/tailwind.md) | Si el proyecto usa Tailwind. |
| [report-template.md](references/report-template.md) | Informe final. |
| [viewports.md](../../standards/viewports.md) | Matriz de verificación. |

## Skills relacionadas

- `ux-review`: si un problema solo se resuelve cambiando el diseño, se documenta como "no modificado" y se recomienda esta skill.
- `design-system`: si el desborde viene de un componente base (anchos fijos en `Button`, `Modal`), se corrige allí.
- `accessibility`: reflow a 320 px (1.4.10), zoom 200%, objetivos táctiles (2.5.8) y foco no oculto por headers fijos (2.4.11).
