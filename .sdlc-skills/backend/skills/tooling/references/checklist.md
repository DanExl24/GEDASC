# Checklist de auditoría — tooling del backend

Severidad orientativa entre corchetes ([severity.md](../../../standards/severity.md)).

## 1. Reproducibilidad

- [ ] Versión del runtime fijada y la misma en local, CI e imagen. **[MEDIUM]**
- [ ] Un gestor de dependencias con lockfile versionado; instalación congelada en CI. **[MEDIUM]**
- [ ] Wrapper de build versionado (Maven/Gradle). **[LOW]**
- [ ] Instalación limpia funciona siguiendo el README. **[MEDIUM]**

## 2. Configuración y secretos

- [ ] Configuración leída en un único módulo y validada al arrancar. **[MEDIUM]**
- [ ] `.env.example` completo; `.env` con secretos fuera del repositorio. **[CRITICAL]** si hay secretos de producción versionados.
- [ ] Secretos desde un gestor o inyectados por la plataforma; ninguno en la imagen. **[HIGH]**
- [ ] Sin lógica condicional por nombre de entorno repartida por el código. **[LOW]**
- [ ] La configuración completa no se imprime en logs. **[HIGH]** si incluye secretos.

## 3. Calidad

- [ ] Lint, formato y comprobación de tipos configurados y ejecutados en CI. **[MEDIUM]**
- [ ] Reglas orientadas a bugs activas (promesas sin esperar, excepciones tragadas). **[LOW–MEDIUM]**
- [ ] Misma configuración en local y CI; hooks rápidos si existen. **[LOW]**

## 4. Entorno local

- [ ] Dependencias levantables con Docker Compose (u otra herramienta) con versiones como las de producción. **[LOW–MEDIUM]**
- [ ] Migraciones y seed con un comando; seeds sin datos reales de clientes. **[LOW]**; **[HIGH]** si los seeds contienen datos personales reales.
- [ ] Scripts estándar con nombres consistentes. **[LOW]**

## 5. CI

- [ ] El pipeline corre en cada PR y bloquea el merge. **[HIGH]** si no existe o no bloquea.
- [ ] Incluye lint, tipos, tests unitarios y de integración con servicios reales. **[HIGH]** si faltan los tests de integración en un servicio con base de datos.
- [ ] Comprueba migraciones (aplicación sobre BD vacía, sin cambios pendientes de generar). **[MEDIUM]**
- [ ] Escaneos de dependencias, secretos e imagen. **[MEDIUM]**
- [ ] Sin pasos de calidad que se ignoran al fallar. **[MEDIUM]**
- [ ] Un artefacto construido una vez y promovido entre entornos. **[MEDIUM]**

## 6. Imagen

- [ ] Multi-stage con base mínima fijada. **[LOW–MEDIUM]**
- [ ] Ejecución sin root. **[MEDIUM]**
- [ ] Sin secretos en capas, `ARG` o `ENV`. **[CRITICAL]**
- [ ] `.dockerignore` excluye `.git`, `.env` y artefactos locales. **[MEDIUM]**
- [ ] El proceso recibe las señales para el apagado limpio. **[MEDIUM]**

## Cómo inspeccionar rápido

- Lockfiles y versiones: presencia de lockfile, `.nvmrc`/`.python-version`/toolchains, versión del runtime en el workflow de CI y en el `FROM` del Dockerfile.
- Configuración: `process.env.`, `os.environ[`/`os.getenv(`, `@Value("${` dispersos fuera del módulo de configuración.
- Secretos: `.env` versionado (`git ls-files | grep -E '\.env$'`), `ENV …KEY=`/`ARG …SECRET` en Dockerfile, `gitleaks detect`.
- CI: workflows sin pasos de tests de integración, con `continue-on-error: true`, o con `npm install`/`pip install` sin lockfile.
- Imagen: ausencia de `USER`, una sola etapa con herramientas de build, `CMD` en forma shell (`CMD node dist/main.js`).
