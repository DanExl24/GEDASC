# Patrones de TypeScript para frontend

## tsconfig recomendado

```jsonc
{
  "compilerOptions": {
    "strict": true,                         // incluye noImplicitAny, strictNullChecks, etc.
    "noUncheckedIndexedAccess": true,       // arr[i] y record[key] devuelven T | undefined
    "exactOptionalPropertyTypes": true,     // { a?: string } no acepta a: undefined explícito (opcional, exigente)
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "useUnknownInCatchVariables": true,     // ya incluido en strict; catch (e) es unknown
    "verbatimModuleSyntax": true,           // obliga a `import type` para tipos
    "isolatedModules": true,                // necesario con Vite/esbuild/SWC
    "moduleResolution": "bundler",
    "skipLibCheck": true,
    "paths": { "@/*": ["./src/*"] }
  }
}
```

**Activación gradual en proyectos existentes:** `strict` primero (o sus sub-flags una a una: `noImplicitAny` → `strictNullChecks` → resto), después `noUncheckedIndexedAccess`. `exactOptionalPropertyTypes` es la más ruidosa; actívala solo si el equipo la quiere.

El type-check **debe correr en CI**: Vite y esbuild no comprueban tipos al compilar.

## `any` → alternativas

| En vez de | Usa |
| :--- | :--- |
| `any` para datos externos | `unknown` + validación/narrowing |
| `any` en un parámetro genérico | un genérico `<T>` |
| `Function` | firma concreta `(id: string) => void` |
| `object` / `{}` | `Record<string, unknown>` o un tipo concreto |
| `as any` para "que compile" | arreglar el tipo; si es un fallo de una librería, `@ts-expect-error` con comentario |
| `catch (e: any)` | `catch (e) { if (e instanceof HttpError) … }` |

## Validación en runtime

Los tipos de TypeScript desaparecen al compilar. Para datos que vienen de fuera hace falta validar:

```ts
// shared/api/schemas/user.ts
import { z } from 'zod'   // Zod 4; Valibot y ArkType son equivalentes

export const UserSchema = z.object({
  id: z.string(),
  email: z.email(),
  role: z.enum(['admin', 'editor', 'viewer']),
  createdAt: z.iso.datetime().transform((s) => new Date(s)),
})

export type User = z.infer<typeof UserSchema>   // el tipo sale del schema: una sola fuente
```

```ts
// en la capa de API (ver skill data-fetching)
export async function getUser(id: string): Promise<User> {
  const res = await http.get(`/users/${id}`)
  return UserSchema.parse(res.data)   // falla aquí, con un error claro, si el backend cambió
}
```

- Valida en la **frontera** (capa API), no en cada componente.
- Si el coste de validar listas enormes preocupa, valida en desarrollo/staging y usa `safeParse` + log en producción.
- Con **tipos generados desde OpenAPI** (`openapi-typescript` + `openapi-fetch`, u `orval`) obtienes tipado de URL, params y respuesta sin escribirlos; combínalo con validación en runtime en los endpoints críticos.

## Uniones discriminadas para estados

```ts
// ❌ estados imposibles representables: isLoading && error && data a la vez
type State = { isLoading: boolean; error?: string; data?: Order[] }

// ✅ un estado cada vez
type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: Order[] }
  | { status: 'error'; error: AppError }

function render(state: State) {
  switch (state.status) {
    case 'idle': return …
    case 'loading': return …
    case 'success': return state.data.map(…)   // data existe aquí, sin `?`
    case 'error': return state.error.message
    default: {
      const _exhaustive: never = state          // error de compilación si se añade un estado sin manejar
      return _exhaustive
    }
  }
}
```

## Type guards y narrowing

```ts
function isApiError(e: unknown): e is ApiError {
  return typeof e === 'object' && e !== null && 'code' in e && 'message' in e
}

// assertion function
function assertDefined<T>(v: T, msg: string): asserts v is NonNullable<T> {
  if (v == null) throw new Error(msg)
}
```

Prefiere un guard reutilizable antes que repetir `as` en cada uso.

## `satisfies` para configuración

```ts
const routes = {
  home: '/',
  orderDetail: '/orders/:id',
} satisfies Record<string, `/${string}`>
// valida la forma sin perder los literales: routes.orderDetail es '/orders/:id', no string
```

## Tipos de marca (branded) para IDs

```ts
type Brand<T, B extends string> = T & { readonly __brand: B }
type UserId = Brand<string, 'UserId'>
type OrderId = Brand<string, 'OrderId'>

declare function getOrder(id: OrderId): Promise<Order>
getOrder(userId)   // ❌ error: evita pasar el ID equivocado
```

Úsalos cuando confundir IDs ya ha causado bugs; no por defecto.

## Errores tipados

```ts
export class AppError extends Error {
  constructor(
    public readonly code:
      | 'NETWORK' | 'CANCELLED' | 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND'
      | 'CONFLICT' | 'VALIDATION' | 'SERVER' | 'UNKNOWN',
    message: string,
    public readonly status?: number,
    public readonly fieldErrors?: Record<string, string[]>,
  ) {
    super(message)
    this.name = 'AppError'
  }
}
```

El cliente HTTP normaliza cualquier error a `AppError` (ver skill `data-fetching`); la UI solo maneja un tipo.

## Utilidades útiles

- `Pick`, `Omit`, `Partial`, `Required`, `Readonly`, `Record`, `NonNullable`, `ReturnType`, `Parameters`, `Awaited`.
- DTO de creación a partir del modelo: `type CreateOrderDto = Omit<Order, 'id' | 'createdAt'>`.
- Evita tipos "inteligentes" ilegibles (condicionales anidados de 10 niveles) en código de aplicación; son para librerías.

## Migración JS → TS

1. `allowJs: true`, `checkJs: false`; renombra archivo a archivo empezando por las hojas (utils, tipos de API).
2. Tipa primero las fronteras (API, stores); los componentes heredan los tipos.
3. Usa `// @ts-expect-error TODO(migración): …` temporales con un ticket, nunca `any` silenciosos.
4. Activa `strict` cuando el grueso esté migrado.
