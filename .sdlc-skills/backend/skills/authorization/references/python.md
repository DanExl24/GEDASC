# Autorización — notas Python

## Django / DRF

- **`has_object_permission` no se ejecuta en listados:** filtra siempre en `get_queryset()`:
  ```python
  class InvoiceViewSet(viewsets.ModelViewSet):
      permission_classes = [IsAuthenticated, InvoicePermission]
      def get_queryset(self):
          return Invoice.objects.filter(tenant=self.request.user.active_tenant)   # acota detalle, listados, updates y deletes
  ```
  Con `get_queryset` acotado, `get_object()` devuelve 404 para objetos de otros tenants.
- `DEFAULT_PERMISSION_CLASSES = ["rest_framework.permissions.IsAuthenticated"]` (deny by default para anónimos) y `AllowAny` explícito en lo público.
- Permisos de Django (`user.has_perm("billing.approve_invoice")`) para funciones; `django-guardian` para permisos por objeto; `django-rules` para predicados declarativos.
- Serializers distintos por rol (o campos `read_only` según el usuario en `get_fields()`) para la autorización por propiedad.
- Multi-tenant: managers por defecto que filtran por tenant (con cuidado: el admin y los `select_related` pueden saltárselos), o `django-tenants` (esquema por tenant), o RLS de PostgreSQL con `SET LOCAL` en un middleware dentro de una transacción.

## FastAPI

- Dependencias de autorización (`Depends(require_permission("invoice:approve"))`) por ruta o por router; dependencia global en el router para deny by default.
- Comprobaciones por objeto en el servicio, con consultas acotadas (`select(Invoice).where(Invoice.id == id, Invoice.tenant_id == actor.tenant_id)`).
- SQLAlchemy: `with_loader_criteria` en un evento `do_orm_execute` para aplicar el filtro de tenant automáticamente a todas las consultas de las entidades de tenant.
- Políticas: Casbin (`pycasbin`), Oso, Cerbos, OPA (vía API).
