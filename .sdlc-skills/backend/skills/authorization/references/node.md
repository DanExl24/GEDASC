# Autorización — notas Node.js / TypeScript

- **CASL** (`@casl/ability`): habilidades declarativas por rol con condiciones sobre el recurso (`can('update', 'Invoice', { tenantId: user.tenantId, status: 'draft' })`); `@casl/prisma` convierte las reglas en filtros `where` (acota consultas, incluidos listados).
- **Casbin**, **Cerbos** u **Oso** para políticas más complejas o compartidas entre servicios; OpenFGA para ReBAC.
- **NestJS:** guard global de autorización + decoradores (`@RequirePermission('invoice:approve')`); comprobaciones por objeto en el caso de uso (los guards no tienen el recurso cargado). Un guard global con `@Public()` explícito implementa deny by default.
- **Express/Fastify:** middleware de permisos por ruta y política por objeto en el servicio; registra en un test las rutas sin middleware de autorización (el router expone su pila de rutas).
- **Prisma y multi-tenant:** una extensión de cliente (`$extends` con `query`) que añade `tenantId` a `where`/`data` de los modelos de tenant; o RLS con `set_config('app.tenant_id', $1, true)` al inicio de cada transacción interactiva.
- **TypeORM/Drizzle:** repositorios de tenant que siempre aplican el filtro; prohíbe (con lint o revisión) el acceso directo a las tablas sin pasar por ellos.
- Contexto de tenant en jobs: incluye `tenantId` en el payload del job y restablécelo (por ejemplo con `AsyncLocalStorage`) al procesarlo.
