# Checklist de auditoría — design system

Severidad orientativa entre corchetes; ajústala según impacto real ([severity.md](../../../standards/severity.md)).

## 1. Tokens

- [ ] Existe una fuente única de tokens (config de Tailwind, `@theme`, variables CSS o archivo de tema). **[MEDIUM]** si no existe.
- [ ] Los tokens están organizados en primitivos y semánticos; los componentes usan semánticos. **[LOW–MEDIUM]**
- [ ] No hay colores hex/rgb/hsl en componentes, plantillas ni `style` inline. **[MEDIUM]**
- [ ] No hay valores arbitrarios de Tailwind para color, espacio o tipografía (`text-[#333]`, `p-[13px]`) salvo excepciones justificadas. **[LOW–MEDIUM]**
- [ ] Tipografía (familias, tamaños, pesos) definida en tokens, no suelta por componentes. **[LOW]**
- [ ] Escala de z-index definida; sin valores mágicos dispersos. **[LOW]**

## 2. Temas

- [ ] El modo oscuro se implementa cambiando valores de tokens, no con `dark:` repetidos en cada componente. **[LOW–MEDIUM]**
- [ ] En modo oscuro todos los textos, iconos, bordes y estados siguen siendo legibles. **[HIGH]** si hay texto invisible o ilegible en flujos principales.
- [ ] No hay fondos o textos fijos que ignoren el tema. **[MEDIUM]**
- [ ] El tema inicial respeta `prefers-color-scheme` y la elección del usuario se recuerda. **[LOW]**
- [ ] No hay parpadeo del tema equivocado al cargar. **[LOW]**

## 3. Componentes base

- [ ] Existen componentes base para los elementos recurrentes (botón, input, select, checkbox, modal, badge, card, tabla, toast). **[MEDIUM]**
- [ ] Las vistas usan los componentes base; no hay botones, inputs o modales recreados a mano. **[MEDIUM]**
- [ ] Los componentes base no contienen lógica de negocio, HTTP ni acceso a stores. **[MEDIUM]**
- [ ] Variantes y tamaños centralizados (CVA, tailwind-variants o equivalente) con nombres consistentes entre componentes. **[LOW–MEDIUM]**
- [ ] Reenvían atributos nativos, clases y `ref` al elemento real. **[LOW–MEDIUM]** (si no, se rompen `aria-*`, `id`, formularios y foco programático).

## 4. Estados interactivos

- [ ] Botones y enlaces: hover, active, focus-visible, disabled y loading definidos. **[MEDIUM]**; **[HIGH]** si falta focus-visible (→ también `accessibility`).
- [ ] Ningún `outline: none` / `outline-none` sin un indicador de foco alternativo. **[HIGH]**
- [ ] El estado loading no cambia el tamaño del componente y bloquea la interacción. **[LOW–MEDIUM]**
- [ ] Inputs: default, focus, error (con icono o texto, no solo color), disabled y read-only. **[MEDIUM]**
- [ ] Estados seleccionado/activo en tabs, toggles, chips y navegación. **[LOW–MEDIUM]**

## 5. Resiliencia de layout

- [ ] Textos dinámicos largos (nombres, emails, títulos) no rompen cards, celdas ni botones. **[MEDIUM]**
- [ ] El truncado ofrece forma de ver el texto completo cuando es información relevante. **[LOW–MEDIUM]**
- [ ] Imágenes, avatares y medios tienen dimensiones o `aspect-ratio` reservados (sin CLS). **[MEDIUM]**
- [ ] Contenedores con ancho máximo en pantallas anchas; texto corrido con longitud de línea legible. **[LOW]**
- [ ] No hay scroll horizontal accidental por anchos fijos o `100vw`. **[HIGH]** si aparece en la página completa (→ también `responsive-layout`).

## 6. Iconos y movimiento

- [ ] Sistema de iconos único; sin SVG grandes duplicados inline en bucles. **[LOW]**
- [ ] Iconos con `currentColor` y tamaño ligado a la escala. **[LOW]**
- [ ] Animaciones sobre `transform`/`opacity`, no sobre propiedades de layout. **[LOW–MEDIUM]**
- [ ] `prefers-reduced-motion` respetado. **[MEDIUM]** (→ también `accessibility`).

## 7. Documentación

- [ ] Catálogo visible de componentes y variantes (Storybook, Histoire, página interna). **[INFO]**

## Cómo inspeccionar rápido

- Colores hardcodeados: buscar `#[0-9a-fA-F]{3,8}\b`, `rgb(`, `rgba(`, `hsl(` en `.vue`, `.tsx`, `.ts`, `.html`, `.scss`, `.css` fuera de los archivos de tokens.
- Valores arbitrarios de Tailwind: buscar `-\[` en clases (`p-[`, `text-[`, `bg-[`, `w-[`).
- Estilos inline: `style="` y `:style=` / `style={{`.
- Componentes recreados: `<button` en vistas/páginas fuera de `shared/ui`; muchas clases repetidas.
- Foco eliminado: `outline-none`, `outline: none`, `outline: 0`.
- Clases `dark:` en componentes: muchas indican tokens no semánticos.
