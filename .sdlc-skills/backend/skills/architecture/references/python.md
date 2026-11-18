# Arquitectura — notas Python

## Django

- Las **apps** son los módulos: una por contexto de negocio (`orders`, `billing`), cada una dueña de sus modelos y migraciones.
- Las FK entre apps acoplan esquemas; son aceptables dentro de un monolito modular, pero el acceso a los datos de otra app debería pasar por sus servicios o selectores (`orders/services.py`, `orders/selectors.py`), no por `OtherModel.objects` disperso.
- Estructura habitual por app: `models.py`, `services.py` (escrituras/casos de uso), `selectors.py` (lecturas), `api/` (vistas DRF/Ninja), `tasks.py` (Celery), `tests/`.
- Señales (`post_save`) entre apps crean dependencias ocultas: prefiere llamadas explícitas o eventos de dominio publicados tras el commit.

## FastAPI

- Un paquete por módulo con su `APIRouter`, servicios, repositorios y schemas; `main.py` incluye los routers (composition root).
- `Depends` para inyectar repositorios y casos de uso; en tests, `app.dependency_overrides[...]`.
- Contenedores opcionales: `dependency-injector`, `svcs`, `lagom`; la inyección explícita con `Depends` y fábricas suele bastar.

## Verificación

**import-linter** (`.importlinter`):

```ini
[importlinter:contract:layers]
name = Capas del módulo orders
type = layers
layers =
    app.modules.orders.http
    app.modules.orders.application
    app.modules.orders.domain

[importlinter:contract:independence]
name = Módulos independientes
type = independence
modules =
    app.modules.orders
    app.modules.billing
    app.modules.inventory
```

(Para permitir el uso de la API pública entre módulos, ajusta el contrato con `ignore_imports` o modela la API pública como paquete aparte.)
