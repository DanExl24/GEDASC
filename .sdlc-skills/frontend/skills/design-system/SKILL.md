---
name: design-system
description: Construye y audita el design system en código (Vue, React, Angular; Tailwind, CSS variables, CSS Modules). Cubre tokens de diseño en tres niveles (primitivos, semánticos, de componente), temas claro/oscuro, componentes base desacoplados del negocio, variantes y tamaños (CVA, tailwind-variants), matriz completa de estados interactivos, resiliencia de layout (textos largos, CLS, widescreen), iconografía y animaciones eficientes. Úsala al crear o refactorizar componentes base, definir tokens o temas, eliminar colores hardcodeados o revisar la consistencia visual del código. No la uses para criticar la UX sin código (ux-review), certificar WCAG (accessibility) ni corregir desbordes por viewport (responsive-layout).
---

# Design system en código

El design system es el contrato visual del producto escrito en código: **tokens** que definen las decisiones (color, espacio, tipografía, radios, sombras, movimiento) y **componentes base** que las aplican de forma consistente. Si un desarrollador puede escribir `#3b82f6` o crear su propio botón en una vista, el sistema tiene fugas.

## Cuándo usarla

- Crear o refactorizar componentes base (`Button`, `Input`, `Select`, `Modal`, `Badge`, `Card`, `Table`…).
- Definir o reorganizar tokens y temas (claro/oscuro, marcas).
- Eliminar colores, tamaños y fuentes hardcodeados.
- Modo oscuro que rompe la legibilidad, estados interactivos incompletos, componentes duplicados.
- Traducir a código las recomendaciones visuales de `ux-review`.

**No es para:** crítica de la experiencia sin código → `ux-review` · conformidad WCAG, ARIA y foco → `accessibility` · desbordes en tamaños concretos sin cambiar el diseño → `responsive-layout`.

## Paso 0: contexto (ambos modos)

1. Detecta en `package.json` el framework y la tecnología de estilos: Tailwind (v3 con `tailwind.config.*` o v4 con `@theme` en CSS), CSS Modules, Sass, CSS-in-JS, librería de componentes (shadcn/ui, Radix, Reka UI, PrimeVue, Vuetify, Angular Material, MUI…).
2. Carga [vue.md](references/vue.md), [react.md](references/react.md) o [angular.md](references/angular.md).
3. Localiza dónde viven hoy los tokens (config de Tailwind, `:root` con variables, archivo de tema) y los componentes base (`shared/ui`, `components/base`…).
4. Si existe Storybook o una página de catálogo, úsala como inventario.

## Modo Construir

1. **Tokens en tres niveles** (ver [patterns.md § Tokens](references/patterns.md#tokens-en-tres-niveles)): primitivos (la paleta), semánticos (el significado: `bg-surface`, `text-muted`, `border-danger`) y, solo si hace falta, de componente. Los componentes usan **semánticos**, nunca primitivos.
2. **Temas** cambiando los valores de los tokens semánticos (variables CSS), no duplicando clases `dark:` en cada componente.
3. **Componentes base** sin lógica de negocio, con API de variantes y tamaños explícita (CVA o equivalente), que reenvían atributos nativos y `ref`.
4. **Matriz de estados completa** en cada elemento interactivo: default, hover, active, focus-visible, disabled, loading, y en inputs también error, read-only. Ver [patterns.md § Estados](references/patterns.md#matriz-de-estados).
5. **Resiliencia:** textos largos, contenido vacío, dimensiones reservadas para imágenes, sin anchos fijos frágiles.
6. **Coordina con `accessibility`** en componentes compuestos (modal, menú, tabs, combobox): la parte visual es de esta skill; teclado, foco y ARIA, de aquella.
7. Si hay Storybook, añade historias con todas las variantes y estados. Entrega según [output-formats.md § Construir](../../standards/output-formats.md#modo-construir).

## Modo Auditar

1. Inventaria tokens y componentes base; busca duplicados (varios botones o modales hechos a mano en vistas).
2. Busca valores hardcodeados: colores hex/rgb/hsl, valores arbitrarios de Tailwind (`p-[13px]`, `text-[#333]`), `style=""` inline, fuentes sueltas.
3. Comprueba los temas: cambia a modo oscuro y revisa textos, bordes, iconos, sombras y estados.
4. Recorre [checklist.md](references/checklist.md).
5. Clasifica con [severity.md](../../standards/severity.md) y entrega según [output-formats.md § Auditar](../../standards/output-formats.md#modo-auditar) con código `FE-DS`.

## Principios

1. **Los componentes consumen tokens semánticos**, no valores ni primitivos. `bg-primary`, no `bg-blue-600`; `var(--color-text-muted)`, no `#6b7280`.
2. **Un tema es un conjunto de valores para los mismos tokens.** Añadir un tema no debería tocar ningún componente.
3. **Un componente base por concepto.** Si existe `Button`, nadie escribe un `<button class="…15 clases…">` en una vista.
4. **Componentes base tontos:** no conocen el dominio, no hacen HTTP, no leen stores. Reciben props y emiten eventos.
5. **Todos los estados diseñados.** Un botón sin `focus-visible` o un input sin estado de error no están terminados.
6. **API predecible:** variantes y tamaños con nombres consistentes en todos los componentes (`variant`, `size`; `primary | secondary | ghost | destructive`; `sm | md | lg`).
7. **Rendimiento visual:** animaciones con `transform` y `opacity`; iconos de un sistema único, no SVG gigantes duplicados.

## Referencias

| Archivo | Cuándo cargarlo |
| :--- | :--- |
| [patterns.md](references/patterns.md) | Modo Construir; en Auditar para escribir las correcciones. |
| [checklist.md](references/checklist.md) | Modo Auditar. |
| [vue.md](references/vue.md) · [react.md](references/react.md) · [angular.md](references/angular.md) | Según el stack. |

## Skills relacionadas

- `accessibility`: contraste de los tokens de color, foco visible, objetivos táctiles, ARIA de componentes compuestos. Si accesibilidad detecta un contraste insuficiente, la corrección se hace aquí, en el token.
- `ux-review`: origen de las recomendaciones de paleta, escala y variantes.
- `responsive-layout`: adaptación de layouts concretos sin cambiar el diseño.
- `architecture`: ubicación de `shared/ui`.
- `performance`: CLS en componentes, animaciones y peso de iconos y fuentes.
- `testing`: historias de Storybook por variante y estado, y regresión visual.
