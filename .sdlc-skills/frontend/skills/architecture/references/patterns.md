# Patrones de arquitectura frontend

## Elegir estructura

| Situación | Estructura recomendada |
| :--- | :--- |
| Prototipo o app pequeña (< ~10 pantallas, 1–2 devs) | Por tipo, plana. Reorganizar cuando duela. |
| App mediana o grande, la mayoría de proyectos | **Por features** (abajo). |
| App grande con muchas features que se cruzan y varios equipos | **Feature-Sliced Design** (FSD) o features + capas explícitas. |
| Varias apps que comparten código (web + admin, design system propio) | **Monorepo** (pnpm workspaces + Turborepo, o Nx). |
| Equipos autónomos que despliegan por separado partes de una misma UI | Micro-frontends. Último recurso: coste alto en rendimiento, consistencia y tooling. |

## Estructura por features

```text
src/
├── app/                  # arranque: router, providers, layout raíz, config global
├── features/
│   ├── auth/
│   │   ├── components/   # componentes propios de la feature
│   │   ├── api/          # llamadas y queries de esta feature (ver skill data-fetching)
│   │   ├── model/        # stores, tipos, schemas, lógica de dominio de la feature
│   │   ├── pages/        # vistas/rutas (si el router no impone otra ubicación)
│   │   └── index.ts      # API pública: lo único que otras partes pueden importar
│   ├── catalog/
│   └── checkout/
├── shared/
│   ├── ui/               # componentes genéricos sin lógica de negocio (Button, Modal…)
│   ├── lib/              # utilidades puras (formatDate, debounce…)
│   ├── api/              # cliente HTTP base, interceptores
│   └── config/           # env, constantes globales
└── main.ts
```

### Reglas de dependencia

```text
app ──▶ features ──▶ shared
          │
          └─ feature A ──✗──▶ internos de feature B
             feature A ──✓──▶ features/B/index.ts  (solo si es inevitable; preferir composición en app/pages)
shared ──✗──▶ features
```

- Si dos features necesitan comunicarse con frecuencia, probablemente: (a) comparten un concepto que debe bajar a `shared`/`entities`, o (b) son la misma feature.
- La composición entre features se hace en la capa superior (página o `app/`), no importando una dentro de otra.

## Feature-Sliced Design (resumen)

Capas de arriba abajo; cada capa solo importa de capas inferiores:

```text
app → pages → widgets → features → entities → shared
```

- `entities`: conceptos de negocio (User, Product) con su modelo y UI mínima.
- `features`: acciones del usuario (add-to-cart, login).
- `widgets`: bloques compuestos de UI (Header, ProductCard con acciones).
- Dentro de cada slice: `ui/`, `model/`, `api/`, `lib/`, y un `index.ts` público.

Usar solo si el equipo se compromete con las reglas; FSD a medias es peor que features simples.

## Hacer cumplir los límites

**eslint-plugin-boundaries** (flat config, esquema mínimo):

```js
// eslint.config.js
import boundaries from 'eslint-plugin-boundaries'

export default [
  {
    plugins: { boundaries },
    settings: {
      'boundaries/elements': [
        { type: 'app', pattern: 'src/app/*' },
        { type: 'feature', pattern: 'src/features/*', capture: ['feature'] },
        { type: 'shared', pattern: 'src/shared/*' },
      ],
    },
    rules: {
      'boundaries/element-types': ['error', {
        default: 'disallow',
        rules: [
          { from: 'app', allow: ['feature', 'shared'] },
          { from: 'feature', allow: ['shared', ['feature', { feature: '${from.feature}' }]] },
          { from: 'shared', allow: ['shared'] },
        ],
      }],
      'boundaries/entry-point': ['error', {
        default: 'disallow',
        rules: [{ target: ['feature'], allow: 'index.ts' }],
      }],
    },
  },
]
```

Alternativas: `import/no-restricted-paths` (eslint-plugin-import), **dependency-cruiser** (también detecta ciclos y genera grafos), reglas `@nx/enforce-module-boundaries` en Nx.

Detección de ciclos rápida: `npx madge --circular --extensions ts,tsx,vue src`.

## API pública y barrel files

- Un `index.ts` por feature que exporte **solo** lo que otros necesitan.
- **No** crees barrels en cada carpeta interna (`components/index.ts`, `utils/index.ts`): ocultan ciclos, empeoran el tree-shaking en algunos bundlers y ralentizan el type-check y los tests.
- Exporta explícitamente (`export { LoginForm } from './components/LoginForm'`), evita `export *` en la API pública para que sea revisable.

## Alias de rutas

```jsonc
// tsconfig.json
{ "compilerOptions": { "paths": { "@/*": ["./src/*"] } } }
```

Importa `@/features/auth` en vez de `../../../features/auth`. Configura el mismo alias en el bundler (Vite: `resolve.alias`, o `vite-tsconfig-paths`).

## Anti-patrones frecuentes

| Anti-patrón | Síntoma | Corrección |
| :--- | :--- | :--- |
| Carpetas por tipo en una app grande | `components/` con 80+ archivos sin relación entre sí | Agrupar por feature; dejar en `shared/ui` solo lo genérico. |
| `utils/` o `helpers/` cajón de sastre | Archivo `utils.ts` de 1.000 líneas importado en todas partes | Partir por dominio; las utilidades de una feature viven en ella. |
| `shared` contaminado | `shared/` importa stores o tipos de una feature | Invertir: la feature pasa los datos por props/parámetros. |
| Feature que importa internos de otra | `import { x } from '@/features/cart/model/store'` desde `checkout` | Exponer en `features/cart/index.ts` o subir el concepto común. |
| Lógica de negocio en páginas | La vista calcula precios, permisos o reglas | Mover a `model/` de la feature (o al backend si es una regla de negocio real). |
| HTTP en componentes | `axios.get` dentro del componente | Capa `api/` de la feature; ver skill `data-fetching`. |
| Componente "dios" | Un `.vue`/`.tsx` de 800+ líneas | Extraer subcomponentes y lógica (composables/hooks/servicios). |
| Arquitectura sobredimensionada | FSD + monorepo + micro-frontends para una app pequeña | Simplificar a features; añadir capas cuando el dolor sea real. |

## Migración incremental (de plano a features)

1. Configura alias (`@/`) y la regla de límites en modo `warn`.
2. Crea `features/` y `shared/` vacíos.
3. Mueve primero lo claramente genérico a `shared/ui` y `shared/lib`.
4. Migra **una feature por PR**: crea la carpeta, mueve sus archivos, crea `index.ts`, actualiza imports.
5. Cuando no queden imports prohibidos, sube la regla a `error`.
6. Borra las carpetas antiguas vacías.

## Plantilla ADR

```markdown
# ADR-<nnn>: <título de la decisión>

- Estado: propuesta | aceptada | reemplazada por ADR-<nnn>
- Fecha: YYYY-MM-DD

## Contexto
Qué problema o fuerza obliga a decidir.

## Decisión
Qué se decide, en una o dos frases.

## Alternativas consideradas
- Opción A: por qué no.
- Opción B: por qué no.

## Consecuencias
Qué se gana, qué se pierde, qué hay que hacer a partir de ahora.
```

Guarda los ADR en `docs/adr/`. Uno por decisión; no se editan, se reemplazan.
