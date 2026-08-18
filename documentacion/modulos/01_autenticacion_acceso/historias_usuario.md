# Historias de Usuario — Módulo 01: Autenticación, Sesión y Control de Acceso

---

# HU-AUTH-001

## Historia
**Como** usuario del sistema (Celador o Administrador)  
**Quiero** iniciar sesión con mis credenciales institucionales (correo electrónico y contraseña)  
**Para** acceder a las funcionalidades del sistema según los permisos asignados a mi rol.

## Descripción
Permite a los operadores autenticarse en GEDASC mediante un formulario seguro en la pantalla principal de acceso. El sistema valida las credenciales contra la base de datos PostgreSQL utilizando Bcrypt y genera un token JWT con vigencia de 24 horas (`1d`). Al autenticarse con éxito, se almacena la sesión y se redirige automáticamente al Dashboard.

## Criterios de Aceptación
- El formulario solicita obligatoriamente correo electrónico (`email`) y contraseña (`password`).
- Los campos son validados con esquema Zod en frontend y backend (email con formato válido, campos requeridos).
- La contraseña se verifica contra el hash seguro en base de datos (`bcrypt.compare`).
- Si las credenciales son incorrectas o el usuario no existe, se muestra un mensaje de error claro: *"Credenciales inválidas"* o *"Usuario no encontrado"*.
- Si la autenticación es exitosa, se genera un JWT con el payload `{ id, email, rol }` y se responde con código HTTP 200.
- La sesión se guarda en Pinia Store y `localStorage` (`token`, `user`).
- El usuario es redirigido inmediatamente a la vista `/dashboard`.

## Metadatos
- **Prioridad**: Alta
- **Roles involucrados**: `CELADOR`, `ADMIN`
- **Reglas de negocio relacionadas**: `RN-AUTH-001`, `RN-AUTH-002`, `RN-AUTH-003`, `RN-AUTH-004`
- **Endpoints relacionados**: `POST /api/auth/login`
- **Componentes frontend relacionados**: `src/views/LoginView.vue`, `src/stores/auth.store.ts`
- **Controllers/Services relacionados**: `database/src/controllers/auth.controller.ts`, `database/src/schemas/auth.schema.ts`

---

# HU-AUTH-002

## Historia
**Como** usuario autenticado  
**Quiero** cerrar mi sesión de trabajo desde la barra de navegación superior  
**Para** proteger la integridad de los datos y evitar accesos no autorizados al retirarme de la estación de control.

## Descripción
Permite al usuario finalizar su sesión activa en cualquier momento. Al hacer clic en el botón *"Cerrar sesión"*, el sistema limpia el estado reactivo del store, elimina el token y los datos de usuario del almacenamiento local del navegador (`localStorage`) y redirige forzosamente a la pantalla de Login (`/login`).

## Criterios de Aceptación
- El botón *"Cerrar sesión"* está visible en el encabezado (`TheNavbar.vue`) únicamente cuando existe una sesión activa.
- Al activarse, se ejecuta la acción `logout()` del `auth.store.ts`.
- Se eliminan de forma segura las llaves `token` y `user` de `localStorage`.
- Se cancela cualquier suscripción o conexión activa de Socket.io asociada a la sesión.
- Se redirige al usuario a la ruta `/login`.
- Si el usuario intenta presionar el botón "Atrás" del navegador, el guard de navegación le impide acceder a rutas protegidas y lo mantiene en `/login`.

## Metadatos
- **Prioridad**: Alta
- **Roles involucrados**: `CELADOR`, `ADMIN`
- **Reglas de negocio relacionadas**: `RN-AUTH-003`, `RN-AUTH-005`
- **Endpoints relacionados**: N/A (Gestión de estado cliente y expiración JWT)
- **Componentes frontend relacionados**: `src/components/UI/TheNavbar.vue`, `src/stores/auth.store.ts`, `src/router/index.ts`
- **Controllers/Services relacionados**: `database/src/middlewares/admin.middleware.ts`

---

# HU-AUTH-003

## Historia
**Como** sistema de seguridad GEDASC  
**Quiero** validar el rol del usuario y los tokens JWT en cada petición y navegación  
**Para** restringir el acceso a módulos administrativos únicamente a usuarios con rol `ADMIN` y garantizar que usuarios no autenticados no accedan al sistema.

## Descripción
Implementa una doble capa de seguridad:
1. **Frontend (Navigation Guards)**: Inspecciona cada cambio de ruta en Vue Router (`beforeEach`). Si una ruta requiere autenticación (`requiresAuth: true`) y no hay token válido, redirige a `/login`. Si requiere rol administrador (`requiredRole: 'ADMIN'`) y el usuario es `CELADOR`, bloquea la navegación y redirige al dashboard.
2. **Backend (Middlewares Express)**: `authMiddleware` valida la firma del token JWT en el encabezado `Authorization: Bearer <token>`. `requireRole(['ADMIN'])` verifica que el usuario posea privilegios suficientes antes de ejecutar operaciones administrativas.

## Criterios de Aceptación
- Si un usuario no autenticado intenta acceder a `/dashboard`, `/ingreso`, `/historial` o rutas `/admin/*`, es redirigido a `/login`.
- Si un usuario ya autenticado entra a `/login`, el sistema lo redirige automáticamente a `/dashboard`.
- Si un usuario con rol `CELADOR` intenta navegar a rutas como `/admin/aprendices`, `/admin/correccion`, `/admin/horarios`, `/admin/alertas`, el Navigation Guard cancela el acceso.
- Cualquier endpoint administrativo bajo `/api/admin/*` responde `401 Unauthorized` si no se envía token o este expiró.
- Cualquier endpoint administrativo responde `403 Forbidden` si el rol en el token no es `ADMIN`.

## Metadatos
- **Prioridad**: Alta
- **Roles involucrados**: `CELADOR`, `ADMIN`
- **Reglas de negocio relacionadas**: `RN-AUTH-001`, `RN-AUTH-004`, `RN-AUTH-005`, `RN-AUTH-006`
- **Endpoints relacionados**: Middleware aplicado en todas las rutas protegidas (`/api/admin/*`, etc.)
- **Componentes frontend relacionados**: `src/router/index.ts`, `src/components/UI/TheSidebar.vue`, `src/components/UI/TheNavbar.vue`
- **Controllers/Services relacionados**: `database/src/middlewares/admin.middleware.ts`, `database/src/controllers/auth.controller.ts`

---

# HU-AUTH-004

## Historia
**Como** celador o administrador  
**Quiero** consultar y gestionar el estado de vinculación del terminal validador / dispositivo de escaneo móvil  
**Para** asegurar que las capturas de carné y firmas remotas provengan de dispositivos autorizados en la portería.

## Descripción
Permite conectar o desvincular dispositivos móviles auxiliares (tablets o teléfonos) que actúan como validadores de carné y lienzos de firma remota. El sistema mantiene el estado de conexión del validador y permite al administrador desvincularlo mediante un modal de confirmación.

## Criterios de Aceptación
- El endpoint `GET /api/validador/estado` retorna el estado actual del dispositivo (`vinculado`, `ip`, `nombre_dispositivo`, `ultima_actividad`).
- El endpoint `POST /api/validador/vincular` registra un nuevo identificador de terminal validador.
- El endpoint `POST /api/validador/desvincular` revoca la sesión del dispositivo validador activo (requiere confirmación de administrador).
- La interfaz muestra un indicador visual en tiempo real en la cabecera cuando el validador móvil está sincronizado vía WebSockets.

## Metadatos
- **Prioridad**: Media
- **Roles involucrados**: `CELADOR`, `ADMIN`
- **Reglas de negocio relacionadas**: `RN-AUTH-007`
- **Endpoints relacionados**: `GET /api/validador/estado`, `POST /api/validador/vincular`, `POST /api/validador/desvincular`
- **Componentes frontend relacionados**: `src/components/Modals/ModalDesvincularValidador.vue`, `src/components/UI/TheNavbar.vue`
- **Controllers/Services relacionados**: `database/src/controllers/validator.controller.ts`, `database/src/sockets/index.ts`
