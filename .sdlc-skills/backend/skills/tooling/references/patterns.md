# Patrones de tooling del backend

## Base reproducible

| Ecosistema | Runtime fijado | Dependencias | Instalación en CI |
| :--- | :--- | :--- | :--- |
| Node | `.nvmrc` + `engines` + `packageManager` (Corepack) | pnpm/npm con lockfile | `pnpm install --frozen-lockfile` / `npm ci` |
| Python | `.python-version` + `requires-python` | **uv** (`uv.lock`) o Poetry (`poetry.lock`) | `uv sync --frozen` / `poetry install --no-root --sync` |
| Java | Toolchain de Maven/Gradle (`java.toolchain.languageVersion`), `.sdkmanrc` | Maven/Gradle con wrapper (`mvnw`, `gradlew`) versionado | `./mvnw -B verify` / `./gradlew build`, con verificación de dependencias si aplica |

- Un solo gestor por proyecto; lockfile versionado siempre.
- La misma versión del runtime en local, CI e imagen base de producción.

## Configuración 12-factor

```ts
// platform/config.ts
const ConfigSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  PORT: z.coerce.number().int().default(3000),
  DATABASE_URL: z.url(),
  DATABASE_POOL_MAX: z.coerce.number().int().min(1).max(100).default(10),
  REDIS_URL: z.url(),
  JWT_ISSUER: z.url(),
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
})

export const config = ConfigSchema.parse(process.env)    // falla al arrancar con un mensaje claro
```

- **Un único módulo** lee el entorno; el resto del código importa `config` tipado.
- **Validación al arrancar:** tipos, formatos, rangos y combinaciones (si `FEATURE_X` está activo, `X_API_KEY` es obligatorio).
- `.env.example` completo y versionado (sin valores secretos); `.env` en `.gitignore`.
- **Secretos** desde un gestor (Vault, AWS Secrets Manager, GCP Secret Manager, Azure Key Vault) o inyectados por la plataforma como variables o archivos montados (→ `api-security`).
- Sin `if (env === 'production')` repartido: el comportamiento depende de valores de configuración explícitos.
- No imprimas la configuración completa en los logs de arranque (contiene secretos).

## Calidad de código

| Ecosistema | Lint | Formato | Tipos / análisis |
| :--- | :--- | :--- | :--- |
| Node/TS | ESLint (typescript-eslint) o Biome | Prettier o Biome | `tsc --noEmit` |
| Python | Ruff | Ruff (`ruff format`) | mypy o pyright |
| Java | Checkstyle/PMD, Error Prone | Spotless (google-java-format/palantir) | Compilador + Error Prone, SpotBugs |

- Misma configuración en el editor, el hook y el CI.
- Reglas que detectan bugs (promesas sin `await`, excepciones tragadas, `==` con `None`) por encima de las estéticas.
- `.editorconfig` y `.gitattributes` (fin de línea).

## Entorno local

```yaml
# docker-compose.yml (solo dependencias; la app corre en local con recarga)
services:
  db:
    image: postgres:16
    environment: { POSTGRES_PASSWORD: dev, POSTGRES_DB: app }
    ports: ["5432:5432"]
    healthcheck: { test: ["CMD-SHELL", "pg_isready -U postgres"], interval: 5s }
  redis:
    image: redis:7
    ports: ["6379:6379"]
```

- Versiones de las imágenes iguales a producción (mismo major).
- Comando único para arrancar: dependencias + migraciones + seed (`make dev`, `just dev`, `pnpm dev:up`).
- **Seeds** con datos de desarrollo realistas y sin datos reales de clientes (→ `data-privacy`).
- Simulación de proveedores externos en local (servidor simulado o modo sandbox).

## Scripts estándar

```text
dev         levantar en local con recarga
test        tests unitarios + integración
lint        lint
format      formato (y format:check en CI)
typecheck   comprobación de tipos
migrate     aplicar migraciones
seed        datos de desarrollo
build       artefacto o imagen
```

Mismos nombres en todos los servicios (en `package.json`, `Makefile`, `justfile`, tareas de Gradle o `pyproject` con un task runner).

## Pipeline de CI

```text
1. Instalación con lockfile congelado y caché
2. Lint · formato · tipos                         (en paralelo; fallan rápido)
3. Tests unitarios
4. Tests de integración con servicios reales       (Testcontainers o services del CI)
5. Comprobación de migraciones                     (aplicar sobre BD vacía; sin migraciones pendientes de generar)
6. Escaneos: dependencias, secretos, análisis estático   (→ api-security)
7. Build de la imagen con la versión (commit SHA) y escaneo de la imagen
8. Publicación del artefacto → despliegue a staging con el mismo artefacto
```

- Ningún paso de calidad con "continue-on-error".
- Caché de dependencias y de capas de Docker.
- Paralelización de tests por workers o shards cuando la suite crece.
- Verificación de reglas de arquitectura (→ `architecture`) y de cambios incompatibles en la API (→ `api-design`).

## Dockerfile de build

```dockerfile
# Etapa de build
FROM node:22-slim AS build
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build && pnpm prune --prod

# Etapa final mínima
FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build --chown=node:node /app/dist ./dist
COPY --from=build --chown=node:node /app/node_modules ./node_modules
USER node
ARG APP_VERSION
ENV APP_VERSION=$APP_VERSION
CMD ["node", "dist/main.js"]
```

- **Multi-stage:** herramientas de build fuera de la imagen final.
- **Base mínima** fijada por versión (y digest si se exige), actualizada con regularidad.
- **Sin root** (`USER`), sistema de archivos de solo lectura cuando sea posible.
- `.dockerignore` (sin `.git`, `.env`, `node_modules` locales, tests).
- **Sin secretos** en `ARG`/`ENV` ni en capas (usa secretos de build de BuildKit si hacen falta en el build).
- Proceso principal que recibe las señales (`CMD` en forma exec; `tini` o `--init` si hace falta) para el graceful shutdown (→ `http-layer`).

## Anti-patrones

| Anti-patrón | Consecuencia | Corrección |
| :--- | :--- | :--- |
| Sin lockfile o `install` sin congelar en CI | Builds distintos cada día | Lockfile + instalación congelada |
| Runtime sin fijar | "En mi máquina funciona" | Versión declarada y usada en CI e imagen |
| `process.env`/`os.environ` disperso | Errores de configuración en producción | Módulo de configuración validado |
| Secretos en `.env` versionado o en la imagen | Compromiso de credenciales | Gestor de secretos |
| README de 15 pasos para arrancar | Onboarding de días | Compose + un comando |
| CI sin tests de integración | Bugs de BD en producción | Servicios reales en CI |
| Imagen distinta por entorno | Lo probado no es lo desplegado | Un artefacto promovido |
| Contenedor como root | Mayor impacto de una vulnerabilidad | `USER` sin privilegios |
| Herramientas de build en la imagen final | Imagen grande y con más superficie de ataque | Multi-stage |
