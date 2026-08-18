# Reglas de Negocio — Módulo 01: Autenticación, Sesión y Control de Acceso

---

## 1. Permisos y Control de Roles

### RN-AUTH-001: Restricción de Roles Válidos del Sistema
- **Descripción**: El acceso al sistema GEDASC está estrictamente restringido a dos perfiles autorizados: `CELADOR` y `ADMIN`. No se permiten usuarios sin un rol asignado en la tabla `roles`.
- **Motivo**: Garantizar el principio de menor privilegio, separando las tareas netamente operativas de portería de las funciones administrativas y auditoras.
- **Módulos afectados**: Todos los módulos de GEDASC.
- **Archivos donde se implementa**: [`database/src/controllers/auth.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/controllers/auth.controller.ts#L51-L70), [`database/src/middlewares/admin.middleware.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/middlewares/admin.middleware.ts), [`src/router/index.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/router/index.ts).
- **Endpoints relacionados**: `POST /api/auth/login`.
- **Historias de usuario relacionadas**: `HU-AUTH-001`, `HU-AUTH-003`.

---

### RN-AUTH-002: Exclusividad de Acceso Administrativo
- **Descripción**: Las vistas y rutas de la API bajo el namespace `/admin/*` (gestión de programas, horarios, corrección de registros, monitores, alertas) solo pueden ser ejecutadas por usuarios con el rol `ADMIN`.
- **Motivo**: Evitar modificaciones o eliminaciones indebidas de la información histórica, configuraciones curriculares y auditorías por parte de operadores de turno.
- **Módulos afectados**: `06_administracion_monitoreo`, `07_gestion_academica`.
- **Archivos donde se implementa**: [`database/src/middlewares/admin.middleware.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/middlewares/admin.middleware.ts), [`src/router/index.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/router/index.ts).
- **Endpoints relacionados**: `/api/admin/*`.
- **Historias de usuario relacionadas**: `HU-AUTH-003`.

---

## 2. Validaciones de Seguridad

### RN-AUTH-003: Almacenamiento Seguro y Hashing de Contraseñas
- **Descripción**: Las contraseñas nunca deben almacenarse en texto plano. La autenticación debe comparar la clave ingresada contra el hash generado por `bcrypt` almacenado en la tabla `usuarios`.
- **Motivo**: Cumplir con los estándares de seguridad de la información y prevenir la filtración de credenciales en caso de accesos no autorizados a la base de datos.
- **Módulos afectados**: `01_autenticacion_acceso`.
- **Archivos donde se implementa**: [`database/src/controllers/auth.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/controllers/auth.controller.ts#L76-L84).
- **Endpoints relacionados**: `POST /api/auth/login`.
- **Historias de usuario relacionadas**: `HU-AUTH-001`.

---

### RN-AUTH-004: Vigencia y Estructura del Token JWT
- **Descripción**: Todo inicio de sesión exitoso debe emitir un token JWT firmado criptográficamente con la variable de entorno `JWT_SECRET`, conteniendo en su payload `{ id, email, rol }` y un tiempo de expiración máximo de 24 horas (`1d`).
- **Motivo**: Mantener sesiones stateless seguras entre cliente y servidor con caducidad automática diaria.
- **Módulos afectados**: Todos los módulos.
- **Archivos donde se implementa**: [`database/src/controllers/auth.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/controllers/auth.controller.ts#L84-L98), [`database/src/middlewares/admin.middleware.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/middlewares/admin.middleware.ts).
- **Endpoints relacionados**: `POST /api/auth/login`.
- **Historias de usuario relacionadas**: `HU-AUTH-001`, `HU-AUTH-003`.

---

## 3. Flujo Operativo y Sesión

### RN-AUTH-005: Redirección Automática por Sesión Activa
- **Descripción**: Si un usuario con sesión válida en el navegador intenta ingresar a la ruta `/login`, el sistema debe interceptar la petición en el frontend y redirigirlo inmediatamente a `/dashboard`.
- **Motivo**: Optimizar la experiencia del usuario y evitar formularios de inicio de sesión redundantes.
- **Módulos afectados**: `01_autenticacion_acceso`.
- **Archivos donde se implementa**: [`src/router/index.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/router/index.ts).
- **Endpoints relacionados**: N/A.
- **Historias de usuario relacionadas**: `HU-AUTH-001`, `HU-AUTH-003`.

---

### RN-AUTH-006: Limpieza Completa en Cierre de Sesión
- **Descripción**: Al ejecutar el cierre de sesión, se debe purgar completamente el estado del store (`Pinia`), eliminar el token y los datos de usuario de `localStorage`, y forzar la redirección a `/login`.
- **Motivo**: Evitar que queden rastros de credenciales o tokens en memoria o almacenamiento local compartidos en terminales de vigilancia.
- **Módulos afectados**: Todos los módulos.
- **Archivos donde se implementa**: [`src/stores/auth.store.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/stores/auth.store.ts), [`src/components/UI/TheNavbar.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/components/UI/TheNavbar.vue).
- **Endpoints relacionados**: N/A.
- **Historias de usuario relacionadas**: `HU-AUTH-002`.

---

## 4. Restricciones

### RN-AUTH-007: Vinculación de Terminal Validador Único
- **Descripción**: Solo puede existir una terminal validadora activa simultáneamente por puesto de control. La desvinculación requiere confirmación del usuario para evitar desconexiones accidentales durante el turno.
- **Motivo**: Prevenir interferencias de múltiples dispositivos móviles enviando lecturas de códigos de barra o firmas al mismo tiempo.
- **Módulos afectados**: `01_autenticacion_acceso`, `02_control_ingreso`, `04_equipos_vehiculos`.
- **Archivos donde se implementa**: [`database/src/controllers/validator.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/controllers/validator.controller.ts), [`src/components/Modals/ModalDesvincularValidador.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/components/Modals/ModalDesvincularValidador.vue).
- **Endpoints relacionados**: `POST /api/validador/vincular`, `POST /api/validador/desvincular`.
- **Historias de usuario relacionadas**: `HU-AUTH-004`.
