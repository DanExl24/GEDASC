# Módulo 01: Autenticación, Sesión y Control de Acceso

## 1. Descripción General

El **Módulo de Autenticación, Sesión y Control de Acceso** es el núcleo de seguridad del sistema **GEDASC**. Proporciona el control de acceso basado en roles (RBAC) para el personal del **Centro de Tecnología de la Amazonía (CTA)**, distinguiendo entre roles operativos (`CELADOR`) y roles de supervisión/gestión (`ADMIN`).

Gestiona la autenticación mediante credenciales seguras (email y contraseña con hashing Bcrypt), generación y verificación de tokens de sesión JWT (JSON Web Tokens), persistencia del estado en el cliente (LocalStorage / Pinia), control de rutas protegidas mediante Guards en Vue Router, y la sincronización con terminales móviles / dispositivos validadores.

---

## 2. Arquitectura y Componentes del Módulo

### 2.1 Backend (Node.js / Express / TypeScript)
- **Rutas**: [`database/src/routes/auth.routes.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/routes/auth.routes.ts), [`database/src/routes/validator.routes.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/routes/validator.routes.ts)
- **Controladores**: [`database/src/controllers/auth.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/controllers/auth.controller.ts), [`database/src/controllers/validator.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/controllers/validator.controller.ts)
- **Middlewares**: [`database/src/middlewares/admin.middleware.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/middlewares/admin.middleware.ts), [`database/src/middlewares/error.middleware.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/middlewares/error.middleware.ts)
- **Esquemas de Validación**: [`database/src/schemas/auth.schema.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/schemas/auth.schema.ts) (Zod)
- **Base de Datos**: Tablas `usuarios`, `roles`, `dispositivos_validador`.

### 2.2 Frontend (Vue 3 / TypeScript / Pinia)
- **Vistas**: [`src/views/LoginView.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/views/LoginView.vue)
- **Stores**: [`src/stores/auth.store.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/stores/auth.store.ts)
- **Router / Guards**: [`src/router/index.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/router/index.ts)
- **Componentes**: [`src/components/UI/TheNavbar.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/components/UI/TheNavbar.vue), [`src/components/UI/TheSidebar.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/components/UI/TheSidebar.vue), [`src/components/Modals/ModalDesvincularValidador.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/components/Modals/ModalDesvincularValidador.vue)

---

## 3. Endpoints del Módulo

| Método | Endpoint | Descripción | Roles Permitidos |
|---|---|---|---|
| `POST` | `/api/auth/login` | Inicia sesión validando email y password, retorna JWT y datos del usuario | Público |
| `GET` | `/api/validador/estado` | Consulta el estado de vinculación del terminal validador | `CELADOR`, `ADMIN` |
| `POST` | `/api/validador/vincular` | Vincula un terminal móvil/validador al puesto de control | `CELADOR`, `ADMIN` |
| `POST` | `/api/validador/desvincular`| Desvincula el terminal validador activo | `ADMIN` |

---

## 4. Estructura de Documentación del Módulo

- [`historias_usuario.md`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/documentacion/modulos/01_autenticacion_acceso/historias_usuario.md): Especificación detallada de todas las Historias de Usuario con criterios de aceptación y trazabilidad.
- [`reglas_negocio.md`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/documentacion/modulos/01_autenticacion_acceso/reglas_negocio.md): Catálogo de Reglas de Negocio categorizadas por Permisos, Validaciones y Restricciones.
- [`casos_uso.md`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/documentacion/modulos/01_autenticacion_acceso/casos_uso.md): Casos de uso de autenticación, control de sesiones y vinculación de terminales.
