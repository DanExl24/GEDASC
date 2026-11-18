# Responsive con Tailwind

## Mobile-first

Las clases sin prefijo aplican a todos los tamaños; `md:` significa "desde 768 px hacia arriba". Escribe primero el móvil y añade variantes hacia arriba:

```html
<!-- ✅ -->
<div class="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
<!-- ❌ pensar en desktop y "deshacer" hacia abajo con max-*: -->
<div class="grid grid-cols-4 max-md:grid-cols-1">
```

Las variantes `max-*` (`max-md:`) existen y son útiles para excepciones puntuales, pero no como estrategia general.

## Breakpoints por defecto

`sm` 640 · `md` 768 · `lg` 1024 · `xl` 1280 · `2xl` 1536 (px). Compruébalos en el proyecto:
- v4: en el CSS, `@theme { --breakpoint-*: … }`.
- v3: `theme.screens` en `tailwind.config.*`.

Breakpoint propio (nivel 3 de la jerarquía), solo con justificación:
- v4: `@theme { --breakpoint-3xl: 1920px; }` → `3xl:`.
- Valor puntual: `min-[900px]:grid-cols-3` / `max-[400px]:text-sm`.

## Variantes útiles

| Necesidad | Clases |
| :--- | :--- |
| Ancho fluido con máximo | `w-full max-w-7xl mx-auto` |
| Permitir encoger texto en flex | `min-w-0` |
| No aplastar | `shrink-0` |
| Romper palabras largas | `break-words` / `wrap-anywhere` (v4) |
| Truncar | `truncate`, `line-clamp-2` |
| Altura de viewport dinámica | `h-dvh`, `max-h-[90dvh]`, `min-h-svh` |
| Scroll interno | `overflow-y-auto` + `min-h-0` en el hijo flex |
| Tabla contenida | `overflow-x-auto` en el wrapper |
| Columna fija | `sticky left-0 bg-surface` / `sticky right-0` |
| Container queries | v4: `@container` en el padre y `@sm:` / `@md:` / `@lg:` en hijos; v3: plugin `@tailwindcss/container-queries` |
| Fluido con clamp | `px-[clamp(1rem,3vw,2rem)]`, `text-[clamp(1rem,2.5vw,1.25rem)]` |
| Media query de altura | v4: `@custom-variant short (@media (max-height: 760px));` → `short:` |
| Movimiento reducido | `motion-safe:` / `motion-reduce:` |
| Puntero táctil | `pointer-coarse:` (v4) para aumentar áreas táctiles |

## Errores frecuentes

- **Valores arbitrarios para todo** (`w-[837px]`, `mt-[23px]`): suelen ser anchos fijos disfrazados.
- **`hidden md:block` sin alternativa en móvil:** el contenido desaparece. Si oculta información o acciones, es un cambio de diseño, no un arreglo.
- **`overflow-hidden` en el layout raíz** para "quitar" el scroll horizontal: tapa la causa y puede cortar contenido.
- **`h-screen`** en móvil: `100vh` ignora las barras del navegador; usa `h-dvh` o `min-h-dvh`.
- **Hijos flex con scroll que no hacen scroll:** falta `min-h-0` en el hijo con `flex-1` dentro de una columna flex.
- **Orden visual distinto del DOM** con `order-*` o `flex-row-reverse`: puede romper el orden de lectura y foco (WCAG 1.3.2 y 2.4.3).
