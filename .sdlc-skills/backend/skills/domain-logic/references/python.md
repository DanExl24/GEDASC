# Lógica de dominio — notas Python

- **Dinero:** `decimal.Decimal` (construido desde string, nunca desde float: `Decimal("19.99")`), con contexto y redondeo explícitos (`quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)`); o `py-moneyed` para moneda incluida. En la base de datos, `Numeric`/`DecimalField`.
- **Value objects:** `@dataclass(frozen=True)` o modelos Pydantic inmutables (`model_config = ConfigDict(frozen=True)`) con validación en `__post_init__`/validadores.
- **Estados:** `enum.StrEnum` (o `TextChoices` en Django) y un diccionario de transiciones; `django-fsm-2`/`transitions` si hace falta más.
- **Django:** el debate "fat models vs services". Pragmático: reglas que pertenecen a una entidad como métodos del modelo (`order.cancel()`), operaciones que coordinan varias entidades en un módulo `services.py` por app. Evita lógica en `save()` sobrescrito, en señales (`post_save`) y en `perform_create` de las vistas.
- **FastAPI:** el dominio en módulos propios, sin importar `fastapi`; las dependencias (`Depends`) construyen los casos de uso con sus repositorios.
- **Reloj:** función o protocolo inyectado (`Clock`); `freezegun`/`time-machine` en tests si el código usa `datetime.now()` directamente.
- **Tipos:** anota el dominio con tipos y ejecuta `mypy`/`pyright` en CI; los errores de dominio como jerarquía de excepciones propias.
