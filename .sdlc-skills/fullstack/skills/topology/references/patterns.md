# Patrones de topología

## Síntomas

| Síntoma | Por qué duele | Severidad orientativa |
| :--- | :--- | :--- |
| `utils/` o `helpers/` con cientos de líneas de cosas sin relación | Todo depende de él; cualquier cambio rompe en sitios inesperados | MEDIUM |
| El frontend importa código del servidor (modelos del ORM, servicios, `process.env` del backend) | Filtra secretos o dependencias de servidor al bundle; acopla despliegues | HIGH (CRITICAL si expone secretos) |
| Tipos o validaciones duplicados en espejo en ambas capas | Divergen y causan desajustes de contrato (→ `contracts`) | MEDIUM |
| Vistas que hacen de todo: llaman a la API, calculan reglas de negocio, formatean y pintan | Lógica de negocio en la UI que el servidor no valida | HIGH si la regla afecta a dinero o permisos |
| Monolito sin límites: cualquier archivo importa cualquier otro | No se puede cambiar ni extraer nada sin tocar todo | MEDIUM |
| Ciclos de dependencias entre módulos o paquetes | Builds frágiles, imposible razonar sobre el orden | MEDIUM |
| Un paquete `shared` con lógica, acceso a datos o dependencias de un framework concreto | El "compartido" se convierte en el nuevo monolito | MEDIUM |

## Arquetipos

### A. Monolito modular (un repositorio, una o dos apps)

```text
shared/                 # contratos del cable (esquemas, tipos, constantes)
backend/
  core/                 # infraestructura transversal (config, logger, db, auth)
  modules/
    orders/             # API pública en index.ts; tablas propias
    billing/
frontend/
  core/                 # cliente HTTP, router, layout, design system local
  modules/
    orders/             # páginas, componentes y estado del módulo
    billing/
```

**Cuándo:** equipo pequeño o mediano, un solo producto, frontend y backend que se despliegan juntos o casi. Es el punto de partida recomendado.

### B. Monorepo con paquetes (workspaces)

```text
apps/
  web/                  # frontend
  api/                  # backend
  admin/                # otro frontend, si existe
packages/
  contracts/            # esquemas y tipos del cable (o OpenAPI + tipos generados)
  ui-kit/               # componentes y tokens compartidos entre frontends
  config/               # tsconfig, eslint, prettier compartidos
```

**Cuándo:** varias apps que comparten contratos o UI, necesidad de builds y tests incrementales, o equipos que trabajan en paralelo. Herramientas: workspaces de pnpm, npm o Yarn más Turborepo o Nx para caché y tareas por grafo; en stacks mixtos (Python o Java en el backend), el paquete de contratos suele ser la especificación OpenAPI con generación de tipos para el frontend.

**Coste:** configuración y mantenimiento de herramientas, versionado interno de paquetes. No compensa con una sola app y un solo desarrollador.

### C. Hexagonal (puertos y adaptadores) aplicado al conjunto

El núcleo de dominio en el backend no conoce HTTP ni la base de datos; el frontend es un adaptador más que consume la API. **Cuándo:** dominio complejo con varias entradas (HTTP, colas, CLI) o salidas intercambiables. Se combina con A o B; la estructura interna la detalla `backend:architecture`.

### Elección rápida

| Contexto | Arquetipo |
| :--- | :--- |
| Un frontend, un backend, equipo pequeño | A |
| Varios frontends o apps que comparten contratos o UI | B |
| Backend en otro lenguaje que el frontend | A o B con OpenAPI como contrato (sin paquete TS compartido de lógica) |
| Dominio complejo con muchas entradas y salidas | C dentro de A o B |
| Microservicios independientes con equipos propios | Un repositorio por servicio o monorepo con límites estrictos; solo si la organización lo exige (→ `backend:architecture`) |

## Módulos verticales

- Un módulo de negocio tiene el **mismo nombre en ambas capas** (`backend/modules/orders`, `frontend/modules/orders`): un cambio de negocio se localiza enseguida.
- Cada módulo expone una **API pública** (`index.ts`, paquete o interfaz) y oculta el resto. Otros módulos importan solo de ahí.
- En el backend, cada módulo es dueño de sus tablas; otros módulos acceden a través de su API, no de su repositorio.
- En el frontend, un módulo no importa componentes internos de otro; lo reutilizable sube a `core/` o al `ui-kit`.

## Qué se comparte

| Sí | No |
| :--- | :--- |
| Esquemas y tipos del cable (request, response, errores) | Entidades del ORM, repositorios, servicios del servidor |
| Constantes del contrato (códigos de error, enums del cable) | Reglas de negocio (cálculo de precios, permisos) |
| Componentes y tokens de UI entre frontends | Variables de entorno o configuración con secretos |
| Configuración de herramientas (tsconfig, eslint) | Utilidades genéricas "por si acaso" |

Una validación puede compartirse (el mismo esquema Zod en cliente y servidor), pero **el servidor la ejecuta siempre**; en el cliente es solo para dar feedback rápido.

## Reglas de dependencias

Dirección permitida: `apps/*` → `packages/*`; `modules/*` → `core/` y `shared/`; nunca al revés ni entre módulos por sus internos.

Verificación con herramientas, en lint y CI:

- **ESLint:** `no-restricted-imports` o `import/no-restricted-paths` (prohibir `frontend/**` → `backend/**`, imports a internos de otros módulos); `eslint-plugin-boundaries`.
- **Nx:** `@nx/enforce-module-boundaries` con etiquetas (`scope:web`, `scope:api`, `type:contracts`).
- **dependency-cruiser:** reglas de prohibición y detección de ciclos.
- **Backend Python o Java:** `import-linter` (contratos de capas) o ArchUnit (→ `backend:architecture`).
- Los `package.json` de cada app declaran explícitamente sus dependencias internas (`"@acme/contracts": "workspace:*"`); nada de rutas relativas que salen de la app (`../../../api/src`).

## Migración strangler

Partiendo de un repositorio enredado, cuatro fases, cada una desplegable por separado:

1. **Aislar contratos:** extrae los tipos y esquemas del cable a `shared/` o `packages/contracts`; ambos lados los importan; elimina las copias en espejo. Añade la regla que prohíbe al frontend importar del backend.
2. **Encapsular el backend:** agrupa por módulo de negocio con API pública; mueve lo transversal a `core/`; reparte `utils/` entre los módulos que lo usan (lo que nadie usa, fuera).
3. **Modularizar el frontend:** mismas fronteras de negocio; las vistas delegan en servicios o composables del módulo y dejan de contener reglas de negocio (que pasan al backend si afectan a datos, dinero o permisos).
4. **Limpiar huérfanos:** código muerto (`knip`, `ts-prune`, cobertura), dependencias sin uso, ciclos restantes; activa las reglas de dependencias en modo error.

Cada fase termina con las reglas de dependencias de esa fase activas en CI para que no haya regresiones.
