# Checklist de auditoría — autorización

Severidad orientativa entre corchetes ([severity.md](../../../standards/severity.md)). CWE habituales: CWE-639 (IDOR), CWE-862 (autorización ausente), CWE-863 (autorización incorrecta), CWE-285, CWE-915 (asignación de propiedades).

## 1. Estructura

- [ ] Deny by default: las rutas requieren autenticación y una decisión de autorización explícita; las públicas están declaradas. **[HIGH]**
- [ ] Las decisiones se toman en un punto central (políticas, guards, permission classes), no con comprobaciones dispersas. **[MEDIUM]**
- [ ] El código comprueba permisos, no nombres de roles. **[LOW–MEDIUM]**
- [ ] Hay un test o comprobación que detecta rutas sin decisión de autorización. **[LOW]**

## 2. Por objeto (BOLA / IDOR)

- [ ] Todo endpoint que recibe un ID acota la consulta por propietario/tenant o comprueba la relación antes de actuar. **[CRITICAL]**
- [ ] Recursos anidados verifican toda la cadena de pertenencia. **[CRITICAL]**
- [ ] Las referencias en el body (`projectId`, `accountId`) se validan contra los recursos accesibles del actor. **[HIGH]**
- [ ] Recursos ajenos responden 404 cuando su existencia es sensible. **[LOW–MEDIUM]**
- [ ] Listados, búsquedas, exportaciones, agregados, autocompletados y URLs firmadas respetan el mismo alcance. **[CRITICAL]**

## 3. Por función (BFLA)

- [ ] Endpoints de administración comprueban permisos en el servidor. **[CRITICAL]**
- [ ] Todos los métodos de un recurso están protegidos (no solo `GET`). **[HIGH]**
- [ ] Endpoints internos, de depuración o de soporte no son accesibles a usuarios normales. **[HIGH]**

## 4. Por propiedad (BOPLA)

- [ ] Los campos sensibles (`role`, `tenantId`, `ownerId`, `status`, precios, flags) no se pueden escribir sin el permiso correspondiente. **[CRITICAL]** si permite escalada de privilegios.
- [ ] Las respuestas no incluyen campos que el rol del actor no debe ver. **[HIGH]**

## 5. Multi-tenant

- [ ] El tenant activo proviene de la identidad y se valida contra las membresías del usuario. **[CRITICAL]**
- [ ] Todas las consultas a tablas de tenant filtran por `tenant_id` (preferiblemente de forma automática). **[CRITICAL]**
- [ ] Defensa en profundidad (RLS o scopes automáticos) en sistemas con datos sensibles. **[MEDIUM]**
- [ ] Cachés, colas, jobs, índices de búsqueda y almacenamiento de archivos separados o etiquetados por tenant. **[HIGH]**
- [ ] El acceso de soporte entre tenants está controlado y auditado. **[MEDIUM]**

## 6. Ciclo de vida de permisos

- [ ] Retirar un rol, desactivar un usuario o expulsarlo de una organización tiene efecto inmediato en acciones críticas (sesiones revocadas o permisos consultados en vivo). **[HIGH]**
- [ ] Las acciones privilegiadas y los cambios de permisos se auditan. **[MEDIUM]**

## 7. Tests

- [ ] Matriz de permisos probada (rol × acción × estado/propiedad). **[MEDIUM]**
- [ ] Tests de acceso cruzado entre dos tenants en endpoints principales, listados y exportaciones. **[HIGH]** si no existen en un SaaS multi-tenant.

## Cómo inspeccionar rápido

- IDOR: `findById(`, `findUnique({ where: { id`, `get_object_or_404(Model, pk=`, `objects.get(id=`, `repository.findById(` usados con un ID de la petición sin otra condición.
- DRF: `has_object_permission` sin filtrado en `get_queryset()` (no se aplica en listados).
- Tenant desde la petición: `req.headers['x-tenant-id']`, `body.tenantId`, `request.GET['org']` usados sin validar membresía.
- Roles dispersos: `role === 'admin'`, `user.is_staff` en lógica de negocio, `hasRole(` repartido.
- Rutas sin protección: inventario de rutas comparado con guards/decoradores (`@Public`, `permitAll`, `AllowAny`).
- Exportaciones y búsquedas: endpoints `export`, `report`, `search`, `autocomplete` y consultas a motores de búsqueda sin filtro de tenant.
