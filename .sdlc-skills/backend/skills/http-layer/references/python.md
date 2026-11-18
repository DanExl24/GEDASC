# Capa HTTP — notas Python

## FastAPI

```python
class CreateOrderIn(BaseModel):
    model_config = ConfigDict(extra="forbid")          # campos desconocidos → 422
    customer_id: UUID
    items: conlist(OrderItemIn, min_length=1, max_length=100)
    note: constr(strip_whitespace=True, max_length=500) | None = None

class OrderOut(BaseModel):
    id: UUID
    status: OrderStatus
    total: Decimal
    created_at: datetime

@router.post("/orders", status_code=201, response_model=OrderOut)   # response_model filtra la salida
async def create_order(body: CreateOrderIn, user: User = Depends(current_user)):
    return await create_order_use_case(body, actor_id=user.id)
```

- `response_model` (o el tipo de retorno anotado) filtra los campos: aunque se devuelva el objeto del ORM, solo sale lo declarado.
- Query y paths con `Query(..., ge=1, le=100)` y tipos (`UUID`, `int`).
- `@app.exception_handler(AppError)` y un handler para `RequestValidationError` con el formato único; sin `debug=True` en producción.
- **Endpoints `async def` con llamadas bloqueantes** (driver síncrono, `requests`, `time.sleep`) bloquean el event loop de todo el worker: usa librerías asíncronas o declara el endpoint con `def` (se ejecuta en un threadpool).
- `lifespan` para abrir y cerrar pools; Uvicorn/Gunicorn gestionan `SIGTERM` con `--timeout-graceful-shutdown`/`graceful_timeout`.
- Límite de body: no lo trae FastAPI; configúralo en el proxy (nginx `client_max_body_size`) o con un middleware.
- `CORSMiddleware(allow_origins=[...], allow_credentials=True)` con lista explícita.

## Django / Django REST Framework

- Serializers con `fields` explícitos; **nunca `fields = "__all__"`** en serializers de escritura (mass assignment) ni de lectura (fugas).
- `serializer.is_valid(raise_exception=True)` y usar `serializer.validated_data`, no `request.data`.
- Campos de solo lectura (`read_only_fields`) para `id`, propietario, estados gestionados por el sistema.
- `EXCEPTION_HANDLER` personalizado en `REST_FRAMEWORK` para el formato único.
- `DEBUG = False`, `ALLOWED_HOSTS` explícito, `DATA_UPLOAD_MAX_MEMORY_SIZE` acorde.
- Paginación con `max_page_size` en la clase de paginación.
- `django-cors-headers` con `CORS_ALLOWED_ORIGINS` explícito.
- Vistas delgadas: la lógica en servicios o en el modelo, no en `perform_create` con 80 líneas.
