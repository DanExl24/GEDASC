# TypeScript — notas React

## Props

```tsx
type OrderRowProps = {
  order: Order
  onSelect: (id: OrderId) => void
  variant?: 'compact' | 'full'
  children?: React.ReactNode
}

export function OrderRow({ order, onSelect, variant = 'full', children }: OrderRowProps) { … }
```

- Tipa las props en el parámetro de la función. `React.FC` no es necesario.
- Extender props nativas: `type ButtonProps = React.ComponentPropsWithoutRef<'button'> & { variant?: Variant }`.
- Reutilizar props de otro componente: `React.ComponentProps<typeof OrderRow>`.
- React 19: `ref` es una prop normal en componentes de función; `forwardRef` ya no hace falta en código nuevo.

## Props mutuamente excluyentes

```tsx
type LinkOrButton =
  | ({ as: 'link'; href: string } & React.ComponentPropsWithoutRef<'a'>)
  | ({ as: 'button'; onClick: () => void } & React.ComponentPropsWithoutRef<'button'>)
```

## Eventos

```tsx
const onChange = (e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)
const onSubmit = (e: React.FormEvent<HTMLFormElement>) => { e.preventDefault(); … }
```

## Hooks

- `useState<User | null>(null)` cuando el valor inicial no permite inferir el tipo.
- `useRef<HTMLInputElement>(null)` para refs del DOM.
- Hooks personalizados: devuelve un objeto (o una tupla `as const`) con tipos explícitos en el retorno si es API pública.
- `useReducer` con acciones como unión discriminada:
  ```ts
  type Action = { type: 'add'; item: Item } | { type: 'remove'; id: string } | { type: 'reset' }
  ```

## Contexto

```tsx
const SessionContext = createContext<Session | null>(null)

export function useSession() {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession debe usarse dentro de <SessionProvider>')
  return ctx   // Session, sin null
}
```

## Componentes genéricos

```tsx
type SelectProps<T> = {
  options: T[]
  getLabel: (o: T) => string
  value: T | null
  onChange: (o: T) => void
}
export function Select<T>({ options, getLabel, value, onChange }: SelectProps<T>) { … }
```

## Next.js

- Tipos de rutas: `PageProps`/`LayoutProps` generados por Next (o `params: Promise<{ id: string }>` en Next 15+, donde `params` es asíncrono).
- Server Actions: valida los argumentos con un schema; llegan desde el cliente y no son de fiar aunque estén tipados.

## Errores comunes

- `useState([])` sin genérico: infiere `never[]`.
- `any` en handlers por no conocer el tipo del evento.
- Context con valor por defecto `{} as Session`, que oculta el error de usar el hook fuera del provider.
