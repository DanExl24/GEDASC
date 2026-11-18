---
name: tooling
description: Configura y audita el tooling y la experiencia de desarrollo del frontend (Vite, Next.js, Nuxt, Angular CLI). Cubre gestor de paquetes, lockfile y versión de Node fijada, scripts estándar, variables de entorno validadas y configuración en tiempo de ejecución, ESLint (flat config) y Prettier o Biome, git hooks rápidos, type-check, pipeline de CI (instalación reproducible, lint, tipos, tests, build, tamaño del bundle, previews), source maps, actualizaciones de dependencias, configuración del editor y despliegue estático (fallback de SPA y cabeceras de caché). Úsala al arrancar un proyecto, al estandarizar repos de varios equipos, o cuando el CI es lento o inestable, los builds no son reproducibles o la configuración de entornos es caótica. No la uses para la estructura del código (architecture) ni para escribir tests (testing).
---

# Tooling y experiencia de desarrollo

El tooling es lo que hace que **cualquier persona pueda clonar el repo, arrancarlo en minutos y que el CI detecte los problemas antes que producción**. Un buen setup es aburrido: versiones fijadas, scripts con los mismos nombres en todos los proyectos, una sola herramienta por tarea y un pipeline que falla rápido y por motivos claros.

## Cuándo usarla

- Arrancar un proyecto frontend o un monorepo.
- Estandarizar varios repositorios (mismos scripts, lint, CI).
- "En mi máquina funciona": builds no reproducibles, versiones de Node distintas, lockfile ignorado.
- CI lento, inestable o que no bloquea errores de tipos o lint.
- Variables de entorno caóticas o un build distinto por entorno.

**No es para:** organización de carpetas y reglas de dependencia entre módulos (aunque se hagan cumplir con lint) → `architecture` · escribir tests → `testing` · presupuestos y análisis del bundle → `performance` · seguridad de dependencias en detalle → `security`.

## Paso 0: contexto (ambos modos)

1. Lee `package.json` (scripts, `engines`, `packageManager`), lockfile, `.nvmrc`/`.node-version`, configuración del bundler, ESLint, Prettier/Biome, `tsconfig`, hooks de git, y el pipeline (`.github/workflows`, `.gitlab-ci.yml`…). Carga [vue.md](references/vue.md), [react.md](references/react.md) o [angular.md](references/angular.md).
2. Si es posible, mide: tiempo de instalación, de arranque en desarrollo, de build y de cada paso del CI.

## Modo Construir

1. **Base reproducible:** un gestor de paquetes (`packageManager` + Corepack), lockfile versionado, versión de Node fijada (`.nvmrc` + `engines`). Ver [patterns.md § Base](references/patterns.md#base-reproducible).
2. **Scripts estándar:** `dev`, `build`, `preview`, `lint`, `format`, `typecheck`, `test`, `test:e2e`.
3. **Entorno:** variables validadas con un schema al arrancar, separación pública/secreta, y configuración en tiempo de ejecución si un mismo build debe desplegarse en varios entornos.
4. **Calidad:** ESLint flat config (TypeScript, framework, hooks/accesibilidad, límites de módulos) y formateo con Prettier o Biome, sin solaparse.
5. **Hooks de git** rápidos (solo archivos cambiados); lo exhaustivo, en CI.
6. **CI:** instalación con lockfile congelado y caché → lint → type-check → tests → build → tamaño del bundle → (E2E y preview). Ver [patterns.md § CI](references/patterns.md#pipeline-de-ci).
7. **Despliegue:** fallback de SPA, cabeceras de caché correctas, source maps no públicos, versión de release inyectada.
8. **Editor:** `.editorconfig`, extensiones y ajustes recomendados.
9. Entrega según [output-formats.md § Construir](../../standards/output-formats.md#modo-construir).

## Modo Auditar

1. Clona o simula una instalación limpia: ¿funciona siguiendo el README?, ¿con qué versión de Node?
2. Revisa scripts, configuración de lint/formato, entorno y pipeline.
3. Recorre [checklist.md](references/checklist.md).
4. Clasifica con [severity.md](../../standards/severity.md) y entrega según [output-formats.md § Auditar](../../standards/output-formats.md#modo-auditar) con código `FE-TOOL`.

## Principios

1. **Reproducible por defecto:** misma versión de Node, mismo gestor, mismo lockfile en todas partes.
2. **Una herramienta por tarea:** el linter no formatea; el formateador no hace lint.
3. **El CI es la fuente de verdad:** lo que no bloquea el merge, no está garantizado.
4. **Rápido en local, exhaustivo en CI.**
5. **Fallar pronto:** variables de entorno inválidas rompen el arranque, no una pantalla en producción.
6. **Mismos scripts en todos los proyectos:** nadie debería tener que leer el `package.json` para saber cómo arrancar.
7. **Un build, varios entornos** cuando sea posible: la configuración por entorno no debería requerir recompilar.

## Referencias

| Archivo | Cuándo cargarlo |
| :--- | :--- |
| [patterns.md](references/patterns.md) | Siempre en modo Construir; en Auditar para las correcciones. |
| [checklist.md](references/checklist.md) | Modo Auditar. |
| [vue.md](references/vue.md) · [react.md](references/react.md) · [angular.md](references/angular.md) | Según el stack. |

## Skills relacionadas

- `architecture`: reglas de límites entre módulos aplicadas con ESLint o dependency-cruiser.
- `typescript`: configuración estricta y type-check en CI.
- `testing`: ejecución de tests en CI y su estabilidad.
- `performance`: presupuestos de tamaño y Lighthouse CI en el pipeline.
- `security`: secretos fuera del bundle, auditoría y actualización de dependencias.
- `observability`: subida de source maps y versión de release en el build.
