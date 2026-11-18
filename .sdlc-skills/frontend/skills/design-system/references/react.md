# Design system — notas React

## Componente base con variantes

```tsx
// shared/ui/button/Button.tsx
import { buttonVariants, type ButtonVariants } from './button.variants'
import { cn } from '@/shared/lib/cn'

type ButtonProps = React.ComponentPropsWithRef<'button'> & ButtonVariants & { loading?: boolean }

export function Button({ className, variant, size, loading, disabled, type = 'button', children, ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(buttonVariants({ variant, size }), 'relative', className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      <span className={cn('inline-flex items-center gap-2', loading && 'invisible')}>{children}</span>
      {loading && <Spinner className="absolute" aria-hidden />}
    </button>
  )
}
```

- React 19: `ref` llega como prop y se reenvía con `...props`. En React 18 hace falta `forwardRef`.
- `type="button"` por defecto para no enviar formularios por accidente.
- `cn()` con `tailwind-merge` para que `className` externo sobrescriba correctamente.

## Polimorfismo: `asChild`

```tsx
import { Slot } from '@radix-ui/react-slot'

function Button({ asChild, ...props }: ButtonProps & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'button'
  return <Comp className={…} {...props} />
}

<Button asChild><Link to="/orders">Ver pedidos</Link></Button>   // enlace con estilo de botón
```

## Librerías

- **shadcn/ui**: copia los componentes al proyecto (Radix + Tailwind + CVA). Son código tuyo: aplícales los tokens del proyecto y no los dejes divergir de él.
- **Radix UI / React Aria / Ark UI**: primitivas headless accesibles para componentes compuestos.
- Con MUI, Chakra o Mantine: define los tokens en el tema de la librería (`createTheme`, etc.) y no mezcles un segundo sistema paralelo de tokens.

## Estilos

- Tailwind + CVA, CSS Modules o CSS-in-JS de cero runtime (vanilla-extract, Panda). Evita CSS-in-JS con runtime en apps grandes o con Server Components (incompatibilidades y coste en render).
- Next.js App Router: los componentes base que no usan estado pueden ser Server Components; los interactivos con estado llevan `'use client'`.

## Catálogo

Storybook con `@storybook/react-vite` (o `nextjs`), una historia por variante y estado, y el addon de accesibilidad activado.
