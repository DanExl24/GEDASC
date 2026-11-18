# Testing — notas Python

- **Runner:** pytest con fixtures; `pytest-xdist` para paralelizar; `pytest-randomly` para detectar dependencias de orden.
- **Django:** `pytest-django` (`@pytest.mark.django_db` envuelve cada test en una transacción; `transaction=True` para código que gestiona transacciones o `on_commit`); `django_assert_num_queries` para vigilar N+1; `captureOnCommitCallbacks` (o `django_capture_on_commit_callbacks`) para probar efectos tras el commit; `APIClient` de DRF con `force_authenticate`.
- **FastAPI:** `TestClient` o `httpx.AsyncClient` con `ASGITransport`; `app.dependency_overrides` para sustituir puertos; base de datos real con `testcontainers[postgres]` y migraciones de Alembic aplicadas en una fixture de sesión.
- **Factorías:** `factory_boy` (con `DjangoModelFactory`/`SQLAlchemyModelFactory`), `faker` con semilla.
- **HTTP externo:** `respx` (httpx), `responses` (requests); `pytest-socket` (`--disable-socket`, permitiendo localhost) para bloquear la red real.
- **Tiempo:** reloj inyectado, o `time-machine`/`freezegun`.
- **Propiedades:** `hypothesis` para reglas con muchos casos (cálculos de importes, parsers).
- **Celery:** probar las tareas como funciones; `CELERY_TASK_ALWAYS_EAGER` solo en tests acotados (oculta problemas de serialización y transacciones).
- **Mutación:** `mutmut` o `cosmic-ray` en módulos críticos.
