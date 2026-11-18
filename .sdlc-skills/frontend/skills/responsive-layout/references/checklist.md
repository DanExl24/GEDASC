# Checklist responsive

Matriz de viewports en [viewports.md](../../../standards/viewports.md). Severidad orientativa entre corchetes ([severity.md](../../../standards/severity.md)).

## 0. Matriz por viewport

Para cada viewport registra: sin scroll horizontal global · texto legible · acciones alcanzables · estado (🟢 / 🟡 / 🔴 / ⚪ no verificado). Comprueba también las transiciones entre viewports redimensionando poco a poco.

## 1. Contenedores y cajas

- [ ] Ningún contenedor con ancho fijo mayor que el viewport (`w-[900px]`, `width: 850px`) sin `max-width: 100%`. **[HIGH]** si provoca scroll global.
- [ ] Contenedores principales con ancho fluido, máximo y márgenes automáticos.
- [ ] Sin `100vw` en contenedores de contenido. **[MEDIUM]**
- [ ] Contenedores flex con varios hijos usan `flex-wrap` o cambian de dirección al estrechar. **[MEDIUM]**
- [ ] Hijos con texto en flex tienen `min-width: 0`; los que no deben aplastarse, `flex-shrink: 0`. **[MEDIUM]**
- [ ] Paddings y gaps escalan con el tamaño (no `px-12` en móvil). **[LOW]**
- [ ] **No aparece nunca scroll horizontal en la página completa**, y no se ha tapado con `overflow-x: hidden` global sin resolver la causa. **[HIGH]**; **[CRITICAL]** si oculta acciones necesarias.

## 2. Tablas

- [ ] Cada tabla ancha está dentro de un contenedor con `overflow-x: auto`. **[HIGH]** si desborda la página.
- [ ] Al desplazar la tabla, header y sidebar de la app permanecen estáticos.
- [ ] Encabezados legibles (sin deformarse).
- [ ] La columna de acciones es alcanzable sin scroll excesivo (fija o al inicio). **[MEDIUM]**
- [ ] El formato tabular se ha conservado (no se ha convertido en tarjetas sin aprobación).

## 3. Modales, drawers y overlays

- [ ] Ningún modal con altura fija; `max-height` en `dvh`/`vh` que quepa en `1280 × 720` y `1366 × 768`. **[HIGH]**; **[CRITICAL]** si las acciones quedan inaccesibles.
- [ ] Estructura flex en columna: header y footer fijos, cuerpo con scroll interno.
- [ ] Botones de acción siempre visibles, sin quedar bajo el pliegue.
- [ ] En móvil el modal ocupa casi todo el ancho con margen mínimo.

## 4. Formularios y filtros

- [ ] Columnado progresivo (1 → 2 → 3/4 columnas) sin saltos bruscos. **[MEDIUM]**
- [ ] Campos relacionados no quedan separados de forma extraña en tablet.
- [ ] Botones primarios accesibles y sin solaparse en móvil.
- [ ] Barras de filtros se ajustan (`flex-wrap`/grid) sin desbordar. **[MEDIUM]**

## 5. Dashboards y gráficos

- [ ] Grids de KPIs sin scroll horizontal y con transición fluida.
- [ ] Gráficos con ancho fluido, alto definido y redimensionado al cambiar el tamaño (sin desbordar su tarjeta). **[MEDIUM]**
- [ ] Los gráficos no colapsan a 0 px ni crecen sin límite.

## 6. Textos y botones

- [ ] Datos dinámicos largos (nombres, emails, organizaciones) no rompen cajas. **[MEDIUM]**
- [ ] `truncate` solo donde el texto completo es accesible de otra forma. **[LOW–MEDIUM]**
- [ ] Objetivos táctiles ≥ 24×24 px (recomendado 44) en viewports táctiles. **[MEDIUM]**
- [ ] Headers con título y botones: el botón no aplasta el título en móvil.

## 7. Shell de la aplicación

- [ ] Por debajo de `lg` el sidebar no consume una parte desproporcionada del ancho. **[HIGH]** en tablet si deja el contenido inutilizable.
- [ ] El área principal tiene espacio cómodo en tablet.
- [ ] Nombres largos en el header no ocultan notificaciones, menú ni avatar.
- [ ] Headers fijos no tapan el contenido enfocado ni los anclajes (`scroll-padding-top`).

## 8. Alturas

- [ ] En `1366 × 768` y `1280 × 720` lo esencial de cada vista es accesible; paneles con scroll interno donde haga falta. **[HIGH]**
- [ ] En móvil con teclado virtual abierto, el campo activo y el botón de enviar siguen accesibles. **[MEDIUM]**

## 9. Verificación de no-rediseño

- [ ] Colores, tokens y clases de color intactos.
- [ ] Tipografía (familias, tamaños base) intacta.
- [ ] Radios, sombras e iconos intactos.
- [ ] Textos y copys intactos.
- [ ] Jerarquía y orden del contenido idénticos.
- [ ] Sin componentes, patrones de navegación ni librerías nuevos (o, si se aplicó nivel 5, está justificado y aprobado).
- [ ] Sin ajustes microscópicos irrelevantes.
