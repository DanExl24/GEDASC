---
name: tooling
description: "Configura y audita el tooling de un backend: versión del runtime y gestor de dependencias fijados (lockfile, uv/Poetry, pnpm, Maven/Gradle wrapper), configuración 12-factor validada al arrancar, secretos desde un gestor, lint, formato y tipos (ESLint/Biome, Ruff/mypy, Spotless/Error Prone), entorno local con Docker Compose y seeds, scripts estándar, pipeline de CI (instalación reproducible, lint, tipos, tests con servicios, build de imagen, escaneos, migraciones) y Dockerfile de build (multi-stage, sin root). Úsala al arrancar un servicio, estandarizar repos o ante builds no reproducibles, CI lento o configuración caótica. No para escribir tests (testing) ni para infraestructura de despliegue."
---

# Tooling del backend

Un buen tooling hace que **cualquiera pueda clonar el servicio, levantarlo con sus dependencias en minutos, y que el pipeline detecte los problemas antes que producción**, con el mismo artefacto promovido de un entorno a otro.

## Cuándo usarla

- Arrancar un servicio backend o estandarizar varios.
- Builds no reproducibles, versiones de runtime distintas entre máquinas y CI.
- Configuración repartida por el código, variables de entorno sin validar, secretos en archivos.
- CI lento, que no bloquea errores o que no ejecuta tests de integración.
- Entorno local difícil de levantar.

**No es para:** escribir tests → `testing` · infraestructura de despliegue (Kubernetes, Terraform, redes, pipelines de CD complejos) → futuro dominio DevOps · tooling del frontend → `frontend:tooling` · seguridad de dependencias en detalle → `api-security`.

## Paso 0: contexto (ambos modos)

1. Lee los manifiestos (`package.json`, `pyproject.toml`, `pom.xml`/`build.gradle`), lockfiles, versión del runtime, configuración de lint/formato/tipos, `Dockerfile`, `docker-compose.yml` y el pipeline. Carga [node.md](references/node.md), [python.md](references/python.md) o [java.md](references/java.md).
2. Si es posible, prueba una instalación limpia siguiendo el README y mide los pasos del CI.

## Modo Construir

1. **Base reproducible:** runtime fijado, un gestor de dependencias con lockfile, instalación congelada en CI. Ver [patterns.md § Base](references/patterns.md#base-reproducible).
2. **Configuración 12-factor:** un módulo de configuración que lee el entorno, lo **valida al arrancar** y falla rápido; `.env.example` completo; secretos desde el gestor o el entorno de ejecución.
3. **Calidad:** lint, formato y comprobación de tipos con una herramienta por tarea, iguales en local y CI.
4. **Entorno local:** Docker Compose con las dependencias (BD, Redis, broker), migraciones y seeds con un comando.
5. **Scripts estándar** (`dev`, `test`, `lint`, `typecheck`, `migrate`, `seed`, `build`) con los mismos nombres en todos los servicios.
6. **CI** que falla pronto e incluye tests de integración con servicios reales, build de la imagen, escaneos y comprobación de migraciones. Ver [patterns.md § CI](references/patterns.md#pipeline-de-ci).
7. **Imagen** multi-stage, mínima, sin root y con la versión inyectada; el mismo artefacto para todos los entornos.
8. Entrega según [output-formats.md § Construir](../../standards/output-formats.md#modo-construir).

## Modo Auditar

1. Instalación limpia: ¿funciona con lo que dice el README?, ¿qué versión del runtime asume?
2. Revisa configuración, secretos, lint/tipos, compose, Dockerfile y pipeline.
3. Recorre [checklist.md](references/checklist.md).
4. Clasifica con [severity.md](../../standards/severity.md) y entrega según [output-formats.md § Auditar](../../standards/output-formats.md#modo-auditar) con código `BE-TOOL`.

## Principios

1. **Reproducible:** mismas versiones de runtime y dependencias en local, CI y producción.
2. **La configuración se valida al arrancar;** un servicio mal configurado no arranca.
3. **Los secretos no viven en el repositorio** ni en la imagen.
4. **Una herramienta por tarea,** misma configuración en local y CI.
5. **Levantar el entorno local es un comando.**
6. **El CI es la fuente de verdad** y falla rápido; incluye integración con servicios reales.
7. **Un artefacto, varios entornos:** se construye una vez y se promueve.

## Referencias

| Archivo | Cuándo cargarlo |
| :--- | :--- |
| [patterns.md](references/patterns.md) | Siempre en modo Construir; en Auditar para las correcciones. |
| [checklist.md](references/checklist.md) | Modo Auditar. |
| [node.md](references/node.md) · [python.md](references/python.md) · [java.md](references/java.md) | Según el stack. |

## Skills relacionadas

- `testing`: la suite que el pipeline ejecuta (con Testcontainers).
- `schema-and-migrations`: migraciones como paso del pipeline.
- `api-security`: secretos, auditoría de dependencias y de imágenes.
- `architecture`: verificación de reglas de dependencia en CI.
- `observability`: versión de release inyectada en el build.
