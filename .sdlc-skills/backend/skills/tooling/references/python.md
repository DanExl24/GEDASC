# Tooling — notas Python

- **uv** (recomendado en proyectos nuevos): `pyproject.toml` + `uv.lock`, `uv sync --frozen` en CI, `uv run` para ejecutar; gestiona también la versión de Python (`.python-version`). Poetry es una alternativa extendida (`poetry.lock`).
- **Ruff** para lint y formato (sustituye a flake8, isort y black), con reglas de bugs (`B`, `BLE`, `S` para seguridad básica) además de las de estilo.
- **Tipos:** mypy (con `--strict` progresivo) o pyright; `django-stubs` y `djangorestframework-stubs` en Django.
- **Configuración:** `pydantic-settings` (`BaseSettings` validada al arrancar) en FastAPI y servicios; en Django, `django-environ` o settings que leen y validan el entorno en un solo módulo; `manage.py check --deploy` en CI.
- **Task runner:** `Makefile`, `just`, `poe` (poethepoet) o `nox` para los scripts estándar.
- **Hooks:** `pre-commit` con Ruff (rápido) y escáner de secretos.
- **Imagen:** `python:<versión>-slim` multi-stage instalando con `uv sync --frozen --no-dev` en la etapa de build y copiando el entorno virtual; `PYTHONDONTWRITEBYTECODE=1`, `PYTHONUNBUFFERED=1`; usuario sin privilegios; Gunicorn/Uvicorn como proceso principal en forma exec.
