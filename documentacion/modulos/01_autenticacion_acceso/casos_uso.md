# Casos de Uso — Módulo 01: Autenticación, Sesión y Control de Acceso

---

## CU-AUTH-01: Iniciar Sesión en el Sistema GEDASC

- **Actor Principal**: Celador / Administrador
- **Precondiciones**:
  - El usuario debe tener una cuenta activa registrada en la base de datos con un rol válido (`CELADOR` o `ADMIN`).
  - El servidor backend y la base de datos PostgreSQL deben estar en ejecución.
- **Disparador**: El usuario ingresa a la aplicación y visualiza el formulario de login.

### Flujo Principal (Éxito):
1. El usuario ingresa su correo electrónico y contraseña en [`LoginView.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/views/LoginView.vue).
2. El usuario hace clic en el botón *"Acceder al sistema"*.
3. El frontend valida el esquema de entrada (`loginSchema`) y envía la petición `POST /api/auth/login`.
4. El backend verifica la existencia del usuario y valida la contraseña mediante `bcrypt.compare`.
5. El backend genera el token JWT con expiración de 24 horas y retorna los datos del usuario con código HTTP 200.
6. El frontend guarda el token y la información del usuario en `Pinia` y en `localStorage`.
7. El sistema redirige automáticamente al usuario a la vista `/dashboard`.
8. La barra lateral [`TheSidebar.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/components/UI/TheSidebar.vue) renderiza únicamente los módulos permitidos para el rol autenticado.

### Flujos Alternativos:
- **FA-1 (Usuario con sesión ya activa)**:
  1. El usuario navega manualmente a la URL `/login`.
  2. El Navigation Guard de Vue Router detecta el token válido en `localStorage`.
  3. El sistema redirige de inmediato a `/dashboard` sin mostrar el formulario.

### Flujos de Excepción:
- **FE-1 (Datos incompletos o formato inválido)**:
  1. En el paso 3, Zod detecta campos vacíos o email inválido.
  2. El sistema muestra un mensaje de validación visual y bloquea el envío.
- **FE-2 (Credenciales incorrectas o usuario inexistente)**:
  1. En el paso 4, el correo no coincide o `bcrypt.compare` retorna `false`.
  2. El backend responde con status `401 Unauthorized` y mensaje descriptivo.
  3. El frontend muestra una alerta de error: *"Credenciales inválidas"*.
- **FE-3 (Falla del servidor o base de datos)**:
  1. En el paso 4, la conexión a la base de datos falla.
  2. El backend responde con status `500 Internal Server Error`.
  3. El frontend muestra mensaje de error de conexión.

- **Postcondiciones**:
  - El usuario queda autenticado y autorizado para operar el sistema según su rol.

---

## CU-AUTH-02: Control de Acceso y Rutas Protegidas por Rol

- **Actor Principal**: Celador
- **Precondiciones**:
  - El usuario está autenticado con rol `CELADOR`.
- **Disparador**: El usuario intenta acceder a una URL administrativa (por ejemplo, `/admin/aprendices` o `/admin/horarios`).

### Flujo Principal:
1. El usuario digita directamente en la barra del navegador una URL restringida o hace clic en un enlace administrativo.
2. El Navigation Guard de Vue Router intercepta la transición de ruta.
3. El guard consulta `authStore.user.rol` y evalúa la propiedad meta `requiredRole: 'ADMIN'`.
4. Al verificar que el rol es `CELADOR`, el guard cancela la navegación y redirige forzosamente a `/dashboard`.
5. Se muestra una advertencia de permisos insuficientes.

### Flujo de Excepción (Petición directa a API):
1. Un cliente externo intenta enviar una petición `DELETE /api/admin/ingresos/1` con un token de `CELADOR`.
2. El middleware `requireRole(['ADMIN'])` en Express intercepta la petición.
3. El middleware responde con código HTTP `403 Forbidden` y mensaje `{ message: "Acceso denegado" }`.

- **Postcondiciones**:
  - Se mantiene la integridad y confidencialidad de las funciones administrativas.
