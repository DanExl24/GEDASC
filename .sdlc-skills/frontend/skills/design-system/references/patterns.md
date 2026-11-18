# Patrones de design system

## Tokens en tres niveles

```text
Primitivos   →  la paleta y escalas crudas         blue-600, gray-100, space-4, radius-md
Semánticos   →  el significado / uso               color-primary, color-surface, color-text-muted,
                                                    color-border-danger, space-inset-md
Componente   →  (opcional) decisiones de un        button-primary-bg, input-border-focus
                componente concreto
```

- Los componentes usan **semánticos** (o de componente). Los primitivos solo se referencian desde los semánticos.
- Los temas cambian los valores de los semánticos. `color-surface` es blanco en claro y `gray-900` en oscuro; el componente no cambia.
- Nombra por función, no por apariencia: `color-danger`, no `color-red`.

### Categorías mínimas

| Categoría | Tokens semánticos típicos |
| :--- | :--- |
| Color | `background`, `surface`, `surface-raised`, `text`, `text-muted`, `text-inverse`, `border`, `border-strong`, `primary` (+ `primary-foreground`, `primary-hover`), `secondary`, `danger`, `success`, `warning`, `info`, `focus-ring` |
| Espacio | escala base 4 px: `1`=4, `2`=8, `3`=12, `4`=16, `6`=24, `8`=32… |
| Tipografía | familias (`sans`, `mono`), escala de tamaños con interlineado, pesos |
| Radios | `sm`, `md`, `lg`, `full` |
| Sombras / elevación | `sm`, `md`, `lg` (y su equivalente en tema oscuro, donde las sombras se ven menos: usar también superficies más claras) |
| Movimiento | duraciones (`fast` 150 ms, `normal` 250 ms), curvas (`ease-out` para entradas) |
| Z-index | `dropdown`, `sticky`, `overlay`, `modal`, `toast` (evita `z-[9999]` sueltos) |

## Tokens con variables CSS

```css
/* tokens.css */
:root {
  --color-background: oklch(0.99 0 0);
  --color-surface: oklch(1 0 0);
  --color-text: oklch(0.21 0.02 260);
  --color-text-muted: oklch(0.45 0.02 260);
  --color-border: oklch(0.90 0.01 260);
  --color-primary: oklch(0.55 0.2 260);
  --color-primary-foreground: oklch(0.99 0 0);
  --color-danger: oklch(0.58 0.22 25);
  --color-focus-ring: oklch(0.65 0.2 260);
  --radius-md: 0.5rem;
}

[data-theme='dark'] {
  --color-background: oklch(0.16 0.01 260);
  --color-surface: oklch(0.21 0.02 260);
  --color-text: oklch(0.96 0.01 260);
  --color-text-muted: oklch(0.72 0.02 260);
  --color-border: oklch(0.32 0.02 260);
  --color-primary: oklch(0.70 0.17 260);
  --color-primary-foreground: oklch(0.16 0.01 260);
}
```

- `oklch` facilita escalas perceptualmente uniformes; `hsl` o hex también sirven. Lo importante es que vivan en un solo sitio.
- Tema por atributo (`data-theme`) o clase (`.dark`) en `<html>`, respetando `prefers-color-scheme` como valor inicial y guardando la elección del usuario.
- Evita el parpadeo del tema al cargar: aplica el atributo con un script inline en `<head>` antes de pintar.

### Tailwind v4 (configuración en CSS)

```css
@import "tailwindcss";

@theme {
  --color-*: initial;                 /* opcional: quita la paleta por defecto y obliga a usar tokens propios */
  --color-background: oklch(0.99 0 0);
  --color-surface: oklch(1 0 0);
  --color-text: oklch(0.21 0.02 260);
  --color-primary: oklch(0.55 0.2 260);
  --color-primary-foreground: oklch(0.99 0 0);
  --radius-md: 0.5rem;
}

[data-theme='dark'] {
  --color-background: oklch(0.16 0.01 260);
  --color-surface: oklch(0.21 0.02 260);
  --color-text: oklch(0.96 0.01 260);
  --color-primary: oklch(0.70 0.17 260);
  --color-primary-foreground: oklch(0.16 0.01 260);
}

/* solo si algún componente necesita estilos específicos de modo oscuro */
@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));
```

`@theme` genera `bg-surface`, `text-primary`, `rounded-md`… y declara las variables en `:root`. Como las utilidades leen `var(--color-surface)`, redefinir la variable en `[data-theme='dark']` cambia el tema sin tocar ningún componente.

### Tailwind v3

```js
// tailwind.config.js
theme: {
  extend: {
    colors: {
      surface: 'var(--color-surface)',
      primary: { DEFAULT: 'var(--color-primary)', foreground: 'var(--color-primary-foreground)' },
      danger: 'var(--color-danger)',
    },
  },
},
darkMode: ['selector', '[data-theme="dark"]'],
```

Con tokens semánticos en variables, casi no hacen falta clases `dark:` en los componentes.

## Variantes con CVA

```ts
// shared/ui/button/button.variants.ts
import { cva, type VariantProps } from 'class-variance-authority'

export const buttonVariants = cva(
  // base: layout, foco y estados comunes
  'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 ' +
  'disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80',
        secondary: 'bg-surface text-text border border-border hover:bg-background',
        ghost: 'text-text hover:bg-background',
        destructive: 'bg-danger text-white hover:bg-danger/90',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
)

export type ButtonVariants = VariantProps<typeof buttonVariants>
```

- Combina clases con `tailwind-merge` (`cn()` = `clsx` + `twMerge`) para que la `class` externa pueda sobrescribir sin conflictos.
- `tailwind-variants` es una alternativa con slots para componentes de varias partes.
- Sin Tailwind: el mismo patrón con clases de CSS Modules o atributos `data-variant` en CSS.

## Matriz de estados

| Estado | Botón | Input |
| :--- | :--- | :--- |
| Default | ✔ | ✔ |
| Hover | cambio de tono sutil | borde más marcado |
| Active / pressed | tono más oscuro o leve escala | — |
| Focus-visible | anillo de foco con contraste ≥ 3:1 | anillo o borde de foco |
| Disabled | opacidad reducida, sin interacción, `cursor-not-allowed` en el wrapper | fondo atenuado, texto legible |
| Loading | spinner **sin cambiar ancho ni alto**, interacción bloqueada, `aria-busy` | indicador en el campo si valida en servidor |
| Error | — | borde y mensaje en color de error + icono (no solo color) |
| Read-only | — | sin borde de edición, texto seleccionable |
| Selected / checked | para toggles, tabs, chips | — |

Loading sin saltos: mantener el texto con `invisible` y superponer el spinner, o reservar el espacio del icono.

## Resiliencia de layout

- **Textos largos:** `min-w-0` en hijos flex que contienen texto; `truncate` o `line-clamp-*` **con** forma de ver el texto completo (tooltip, detalle); `break-words` para nombres y emails largos.
- **CLS:** imágenes y avatares con `width`/`height` o `aspect-ratio`; skeletons del mismo tamaño que el contenido final; fuentes con `font-display: swap` y métricas ajustadas si el salto es notable.
- **Widescreen:** contenedor con `max-w-*` y márgenes automáticos; longitud de línea ≤ ~75 caracteres en texto corrido.
- **Sin scroll horizontal accidental:** nada de anchos fijos mayores que el viewport; `100vw` incluye la barra de scroll en escritorio (usa `100%`).
- Contenido vacío o nulo: los componentes no se colapsan ni muestran `undefined`.

## Iconografía

- Un sistema único: librería de iconos (Lucide, Heroicons, Phosphor, Material Symbols) o sprite SVG propio.
- Componente `Icon` con tamaño ligado a la escala tipográfica y `currentColor` para heredar color.
- Iconos decorativos con `aria-hidden="true"`; iconos que son la única etiqueta de un botón necesitan nombre accesible (→ `accessibility`).
- No incrustes SVG de cientos de líneas dentro de bucles.

## Movimiento

- Anima `transform` y `opacity` (compositor/GPU). Evita animar `width`, `height`, `top`, `left`, `margin` (provocan layout en cada frame).
- Duraciones cortas (150–300 ms) para interfaces de trabajo.
- Respeta `prefers-reduced-motion: reduce` desactivando o reduciendo animaciones no esenciales (`motion-safe:` / `motion-reduce:` en Tailwind).

## Anti-patrones

| Anti-patrón | Consecuencia | Corrección |
| :--- | :--- | :--- |
| Hex, rgb o valores arbitrarios en componentes | El tema y la marca no se pueden cambiar | Tokens semánticos |
| Componentes usando primitivos (`bg-blue-600`) | El modo oscuro necesita `dark:` en todas partes | Semánticos |
| Botones/modales hechos a mano en vistas | Inconsistencia y bugs repetidos | Componente base |
| Componente base con lógica de negocio | No reutilizable, acoplado | Props y eventos; la lógica en la feature |
| `outline-none` sin reemplazo | Usuarios de teclado perdidos (WCAG 2.4.7) | `focus-visible:ring-*` |
| Loading que cambia el tamaño del botón | Salto de layout, clics fallidos | Reservar espacio |
| `z-[9999]` dispersos | Guerras de z-index | Escala de z-index en tokens |
| Variantes con nombres distintos en cada componente | API impredecible | Convención única |
