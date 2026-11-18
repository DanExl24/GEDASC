# Patrones de autorización

## Modelos

| Modelo | Decisión basada en | Úsalo cuando |
| :--- | :--- | :--- |
| **RBAC** con permisos | Rol → conjunto de permisos (`invoice:read`, `invoice:approve`) | Roles estables (admin, editor, lector); la mayoría de apps |
| **ABAC / políticas** | Atributos del actor, recurso, acción y contexto (propietario, tenant, estado, importe, horario) | "Un editor puede editar sus borradores", "un aprobador solo hasta 10.000 €" |
| **ReBAC** | Relaciones entre sujetos y objetos (miembro de, propietario de, compartido con) | Documentos/carpetas compartidos, jerarquías de equipos (modelo Zanzibar: OpenFGA, SpiceDB, Permify) |

Combinación habitual: **RBAC para las funciones + políticas por atributos para el objeto**. Asigna permisos a roles y comprueba permisos en el código (no roles), para poder cambiar los roles sin tocar el código.

## Punto de decisión central

```ts
// modules/auth/policies.ts
type Action = 'read' | 'update' | 'delete' | 'approve'

export function can(actor: Actor, action: Action, invoice: Invoice): boolean {
  if (invoice.tenantId !== actor.tenantId) return false                      // aislamiento siempre primero
  switch (action) {
    case 'read':    return actor.permissions.has('invoice:read')
    case 'update':  return actor.permissions.has('invoice:update') && invoice.status === 'draft'
    case 'delete':  return actor.permissions.has('invoice:delete') && invoice.status === 'draft' && invoice.createdBy === actor.userId
    case 'approve': return actor.permissions.has('invoice:approve') && invoice.total.lte(actor.approvalLimit)
  }
}

export function authorize(actor: Actor, action: Action, invoice: Invoice) {
  if (!can(actor, action, invoice)) throw new ForbiddenError()
}
```

- Funciones puras y probables; el caso de uso las invoca antes de actuar.
- Para muchas entidades y reglas, una librería de políticas (CASL, Casbin, Oso, Cerbos) o motores de políticas (OPA, Cedar) mantienen las reglas declarativas y auditables.

## Autorización por objeto (BOLA / IDOR)

```ts
// ❌ cualquiera autenticado lee cualquier factura cambiando el ID
const invoice = await db.invoice.findUnique({ where: { id: params.id } })

// ✅ la consulta ya está acotada al tenant del actor
const invoice = await db.invoice.findFirst({ where: { id: params.id, tenantId: actor.tenantId } })
if (!invoice) throw new NotFoundError()           // 404: no confirma que exista en otro tenant
authorize(actor, 'read', invoice)                 // reglas finas (estado, propietario…)
```

- **Acotar en la consulta** evita fugas incluso si alguien olvida la comprobación posterior.
- **404 en lugar de 403** para recursos de otro tenant u otro usuario cuando la existencia es información sensible.
- **IDs no secuenciales** (UUID) reducen la enumeración, pero **no sustituyen** a la comprobación.
- **Recursos anidados:** en `/orders/:orderId/items/:itemId`, verifica que el item pertenece al pedido **y** que el pedido pertenece al actor; no solo el último ID.
- **Referencias en el body:** `{ "projectId": "…" }` al crear algo también es un acceso a un recurso: comprueba que el actor puede usar ese proyecto.

### Listados, búsquedas, exportaciones y agregados

Las fugas más habituales no están en `GET /items/:id`, sino en:
- `GET /items?…` sin filtro de tenant.
- Búsqueda (índices de Elasticsearch/OpenSearch sin campo de tenant en la consulta).
- Exportaciones CSV/Excel y generación de informes en background.
- Agregados y estadísticas (`COUNT` de todo el sistema).
- Autocompletados y endpoints "auxiliares".
- Archivos: URLs firmadas generadas sin comprobar el acceso al recurso padre.

## Autorización por función (BFLA)

- **Deny by default** a nivel de framework: toda ruta autenticada salvo lista explícita de públicas; toda ruta con una política o permiso declarado.
- Endpoints de administración separados (prefijo, router o servicio propios) con su comprobación de permiso, **además** de no aparecer en la interfaz.
- Métodos HTTP: que `GET /users/:id` esté protegido no implica que `DELETE /users/:id` lo esté.
- Test automático que recorre las rutas registradas y falla si alguna no tiene una decisión de autorización declarada.

## Autorización por propiedad (BOPLA)

- **Escritura:** cada rol tiene su schema de entrada; un usuario normal no puede enviar `role`, `tenantId`, `ownerId`, `status`, `price`, `isVerified` (complementa el mass assignment de `http-layer`).
- **Lectura:** el DTO de salida depende del rol (un cliente no ve el coste interno ni las notas de otros).

```ts
const UpdateUserSelf = z.object({ name: z.string().max(100), avatarUrl: z.url().optional() }).strict()
const UpdateUserByAdmin = UpdateUserSelf.extend({ role: z.enum(['member', 'admin']), active: z.boolean() }).strict()
```

## Multi-tenant

- **El tenant viene de la identidad** (claim del token o sesión), nunca de un header o parámetro sin verificar que el usuario pertenece a él (si un usuario pertenece a varias organizaciones, la organización activa se valida contra sus membresías en cada petición).
- `tenant_id` en todas las consultas: idealmente aplicado automáticamente (scope global del repositorio, extensión del ORM, filtros de Hibernate) para que olvidarlo sea difícil.
- **Row-Level Security** (PostgreSQL) como defensa en profundidad:
  ```sql
  ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
  CREATE POLICY tenant_isolation ON invoices
    USING (tenant_id = current_setting('app.tenant_id')::bigint);
  -- por petición/transacción: SET LOCAL app.tenant_id = '42';
  ```
  El rol de la aplicación no debe ser propietario de la tabla ni tener `BYPASSRLS` (o la política no se aplica). Con poolers en modo transacción, usa `SET LOCAL` dentro de la transacción.
- **Cachés** con el tenant en la clave; **jobs y eventos** llevan el tenant y lo restablecen al procesarse; **logs** con tenant para investigar.
- Acceso de soporte o "impersonación" entre tenants: permiso explícito, motivo, auditoría y aviso.

## Permisos desactualizados

- Roles o permisos dentro de un JWT siguen siendo válidos hasta que el token caduca, aunque se hayan retirado.
- Para permisos críticos (administración, pagos), consulta el estado actual (con caché corta) o invalida tokens al cambiar permisos.
- Al desactivar un usuario o expulsarlo de una organización, revoca sus sesiones/tokens.

## Auditoría

Registra las acciones privilegiadas y los cambios de permisos: quién, qué, sobre qué recurso, cuándo y desde dónde (→ `data-privacy` para retención).

## Tests

```ts
describe.each([
  ['owner',    'draft',    'update', true],
  ['member',   'draft',    'update', true],
  ['viewer',   'draft',    'update', false],
  ['member',   'approved', 'update', false],
  ['otherOrg', 'draft',    'read',   false],   // acceso cruzado entre tenants → 404
])('%s sobre factura %s → %s', (actor, status, action, allowed) => { … })
```

- Una matriz por recurso: rol × acción × estado/propiedad.
- Tests de API con dos tenants reales: el usuario del tenant A nunca obtiene datos del B por ningún endpoint (incluidos listados y exportaciones).

## Anti-patrones

| Anti-patrón | Consecuencia | Corrección |
| :--- | :--- | :--- |
| `findById(params.id)` sin acotar | IDOR: datos de otros clientes | Consulta acotada por tenant/propietario |
| Solo se comprueba el último ID en rutas anidadas | Acceso a recursos ajenos vía un padre propio | Verificar toda la cadena |
| `if (user.role === 'admin')` repartido | Reglas inconsistentes y olvidadas | Políticas centrales |
| Rutas autorizadas por defecto | Endpoints nuevos expuestos | Deny by default |
| Tenant tomado de un header o del body | Acceso a otros tenants | Tenant de la identidad |
| Listados/exportaciones sin filtro de tenant | Fuga masiva | Scope obligatorio |
| Rol en el body aceptado | Escalada de privilegios | Schema por rol |
| Admin "protegido" solo ocultando el menú | Escalada por llamada directa | Comprobación en servidor |
| 403 para recursos de otros tenants | Confirma la existencia | 404 |
| Roles en JWT de larga duración | Permisos retirados que siguen activos | Vida corta o comprobación en BD |
