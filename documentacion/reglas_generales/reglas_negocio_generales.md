# Reglas de Negocio Generales y Transversales — GEDASC

> **Gestión de Entradas y Salidas de Aprendices con Autenticación de Equipos y Doble Firma**  
> **Centro de Tecnología de la Amazonía (CTA) — SENA**  
> **Versión**: 2.8 (Modular)  
> **Documento**: Catálogo Maestro de Invariantes y Políticas Globales

---

## Introducción

El presente documento consolida y formaliza las **reglas de negocio generales, transversales y estructurales** que rigen el comportamiento de **GEDASC**.

A diferencia de las reglas de negocio específicas contenidas en cada módulo funcional, estas reglas representan **invariantes globales, políticas de seguridad, restricciones de integridad referencial, máquinas de estados y principios arquitectónicos** que deben cumplirse de manera uniforme en todo el ciclo de vida del software, independientemente del canal o punto de entrada desde el que se interactúe con el sistema.

### Estructura de las Reglas Generales

Cada regla de negocio general está codificada bajo la nomenclatura `RN-GEN-XXX` y detalla:
1. **Nombre y Descripción**: Definición clara y concisa de la política o invariante.
2. **Motivo**: Justificación operativa, legal, de seguridad o institucional.
3. **Alcance**: Delimitación funcional dentro del ecosistema de GEDASC.
4. **Evidencia Técnica**: Ubicación en código fuente, esquemas Zod, triggers, constraints PostgreSQL y controladores.
5. **Implementación Multi-Capa**: Explicación de cómo se garantiza la regla (Frontend, Backend, Base de Datos).
6. **Excepciones y Trazabilidad**: Condiciones de excepción e interrelación con módulos, entidades, endpoints, archivos e historias de usuario.

---

# 1. Arquitectura Institucional y Contexto Operativo

---

## RN-GEN-001

### Nombre
Ámbito Institucional Centralizado del Centro de Formación (Sede CTA)

### Descripción
El sistema GEDASC opera bajo un modelo de instancia centralizada dedicado a la sede física del **Centro de Tecnología de la Amazonía (CTA)**. Todas las entidades académicas (programas, formaciones/fichas, horarios), registros de acceso y activos gestionados pertenecen al ámbito operacional exclusivo del centro de formación. No existe coexistencia de múltiples instituciones en la base de datos; la pertenencia institucional es implícita y global para la totalidad de registros.

### Motivo
Garantizar la administración unificada de la portería física del centro, optimizando las consultas de control de acceso y evitando sobrecargas de discriminación por tenant en operaciones de tiempo real en torniquetes o puestos de control.

### Alcance
Transversal a todos los módulos y entidades del sistema.

### Evidencia
- **Esquema de BD**: [`DataBase/schema/gedascBD.sql`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/schema/gedascBD.sql), [`DataBase/prisma/schema.prisma`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/prisma/schema.prisma).
- **Documentación General**: [`documentacion/DOCUMENTACION_GENERAL.md`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/documentacion/DOCUMENTACION_GENERAL.md).
- **Controladores**: [`DataBase/src/controllers/admin.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/controllers/admin.controller.ts), [`DataBase/src/controllers/entry.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/controllers/entry.controller.ts).

### Implementación
La base de datos relacional PostgreSQL no incluye claves foráneas a tablas de instituciones secundarias. Las tablas maestras (`aprendiz`, `formaciones`, `programa`, `horario`, `detalles_ingreso`, `detalles_maquinas`) se relacionan directamente entre sí en el esquema `public`. Los reportes y encabezados visuales inyectan de forma fija el membrete oficial del Centro de Tecnología de la Amazonía.

### Excepciones
> No se identificaron excepciones en la implementación actual.

### Módulos afectados
- `01_autenticacion_acceso`
- `02_control_ingreso`
- `03_control_salida`
- `04_equipos_vehiculos`
- `05_historial_reportes`
- `06_administracion_monitoreo`
- `07_gestion_academica`

### Entidades afectadas
- `aprendiz`
- `formaciones`
- `programa`
- `horario`
- `detalles_ingreso`
- `detalles_salida`
- `detalles_maquinas`
- `usuarios`

### Endpoints relacionados
- Todos los endpoints de la API (`/api/*`).

### Archivos relacionados
- [`DataBase/src/config/db.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/config/db.ts)
- [`src/Services/exports/usePdfExport.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/Services/exports/usePdfExport.ts)
- [`src/components/UI/TheNavbar.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/components/UI/TheNavbar.vue)

### Historias de usuario relacionadas
- Regla transversal sin HU específica (Aplica a todo el sistema).

---

## RN-GEN-002

### Nombre
Exclusividad y Sincronización de Terminal Validadora Móvil por Puesto de Control

### Descripción
El sistema permite vincular dispositivos móviles como terminales auxiliares de captura (escaneo de códigos de barra de carnés y captura de firmas digitales). Solo puede existir **una única sesión de validador activa simultáneamente** asociada a la estación de control. Al vincular una nueva terminal, las credenciales o identificadores de socket previos deben ser actualizados o reasignados explícitamente para evitar concurrencia de lectura.

### Motivo
Prevenir colisiones operativas en portería donde múltiples dispositivos móviles envíen simultáneamente firmas o lecturas de documentos cruzadas al formulario principal de registro de acceso.

### Alcance
Módulos de autenticación, control de ingreso, control de salida y gestión de activos.

### Evidencia
- **Controlador**: [`DataBase/src/controllers/validator.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/controllers/validator.controller.ts).
- **Sockets**: [`DataBase/src/sockets/index.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/sockets/index.ts).
- **Tabla**: `validadores_firma` creada en [`DataBase/src/config/dbInit.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/config/dbInit.ts#L36-L45).
- **Componentes Vue**: [`src/components/Modals/ModalDesvincularValidador.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/components/Modals/ModalDesvincularValidador.vue), [`src/views/MobileValidatorView.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/views/MobileValidatorView.vue).

### Implementación
La base de datos impone `device_id VARCHAR(255) NOT NULL UNIQUE` en la tabla `validadores_firma`. El backend valida el estado activo y actualiza `ultimo_ping`. Mediante `Socket.io`, la sala del validador despacha eventos en tiempo real (`validator:scanned`, `validator:signature_saved`) únicamente a la pantalla del operador vinculada.

### Excepciones
> No se identificaron excepciones en la implementación actual.

### Módulos afectados
- `01_autenticacion_acceso`
- `02_control_ingreso`
- `04_equipos_vehiculos`

### Entidades afectadas
- `validadores_firma`
- `usuarios`

### Endpoints relacionados
- `POST /api/validador/vincular`
- `POST /api/validador/desvincular`
- `GET /api/validador/estado`

### Archivos relacionados
- [`DataBase/src/controllers/validator.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/controllers/validator.controller.ts)
- [`DataBase/src/routes/validator.routes.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/routes/validator.routes.ts)
- [`src/socket.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/socket.ts)

### Historias de usuario relacionadas
- `HU-AUTH-004`

---

# 2. Usuarios, Identidades y Cuentas de Acceso

---

## RN-GEN-003

### Nombre
Separación Estructural entre Cuentas de Acceso del Sistema y Registros de Aprendices

### Descripción
El sistema distingue de forma estricta entre dos entidades de personas:
1. **Usuarios Operativos/Administrativos (`usuarios`)**: Cuentas con credenciales de autenticación (correo electrónico y contraseña con hash) para iniciar sesión en el software con roles `ADMIN` o `CELADOR`.
2. **Aprendices (`aprendiz`)**: Sujetos objeto de control de acceso y seguimiento académico. No poseen contraseña ni cuenta de acceso al software de portería; se identifican mediante su documento de identidad.

Un aprendiz no es un usuario del sistema ni puede iniciar sesión en la interfaz web de portería.

### Motivo
Salvaguardar la confidencialidad y control operativo. Los aprendices son beneficiarios del servicio educativo y sujetos de registro físico, mientras que los operadores y coordinadores son usuarios autenticados del sistema.

### Alcance
Módulos de autenticación, control de ingreso, administración y gestión académica.

### Evidencia
- **Esquema de BD**: Tablas independientes `usuarios` (con `email`, `password`, `id_rol`) y `aprendiz` (con `documento`, `nombre`, `apellido`, `es_monitor`).
- **Controladores**: [`DataBase/src/controllers/auth.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/controllers/auth.controller.ts) vs [`DataBase/src/controllers/admin.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/controllers/admin.controller.ts).
- **Esquemas Zod**: [`DataBase/src/schemas/auth.schema.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/schemas/auth.schema.ts) vs [`DataBase/src/schemas/admin.schema.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/schemas/admin.schema.ts).

### Implementación
La separación está garantizada en la capa de persistencia de PostgreSQL mediante modelos disjuntos. La tabla `usuarios` requiere `id_rol` referenciando a `roles`, mientras que `aprendiz` se vincula exclusivamente a `detalles_ingreso`, `aprendiz_formacion`, `aprendiz_computador` y `aprendiz_vehiculo`.

### Excepciones
> No se identificaron excepciones en la implementación actual.

### Módulos afectados
- `01_autenticacion_acceso`
- `02_control_ingreso`
- `06_administracion_monitoreo`
- `07_gestion_academica`

### Entidades afectadas
- `usuarios`
- `roles`
- `aprendiz`

### Endpoints relacionados
- `POST /api/auth/login`
- `POST /api/admin/celadores`
- `POST /api/admin/aprendices`

### Archivos relacionados
- [`DataBase/src/controllers/auth.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/controllers/auth.controller.ts)
- [`DataBase/src/controllers/admin.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/controllers/admin.controller.ts)
- [`DataBase/schema/gedascBD.sql`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/schema/gedascBD.sql)

### Historias de usuario relacionadas
- `HU-AUTH-001`, `HU-ADM-007`, `HU-ADM-008`.

---

## RN-GEN-004

### Nombre
Unicidad Global e Inmutabilidad del Documento de Identidad del Aprendiz

### Descripción
El documento de identidad es la clave unívoca de identificación física y relacional del aprendiz en el sistema. No se permite la existencia de dos aprendices con el mismo número de documento, independientemente de que se encuentren activos o inactivos.

### Motivo
Garantizar la correlación inequívoca entre el carné físico escaneado por el código de barras en portería, las matrículas curriculares, el historial de permanencia y la titularidad de activos.

### Alcance
Transversal a los módulos de ingreso, salida, equipos/vehículos, reportes, administración y gestión académica.

### Evidencia
- **Constraint de BD**: `CONSTRAINT aprendiz_documento_key UNIQUE (documento)` en tabla `aprendiz`.
- **Esquema Zod**: [`DataBase/src/schemas/admin.schema.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/schemas/admin.schema.ts#L114-L121) (`documento: z.string().trim().min(5).max(20)`).
- **Controlador**: [`DataBase/src/controllers/admin.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/controllers/admin.controller.ts#L1100-L1130).

### Implementación
La unicidad está blindada a nivel de base de datos mediante la constraint `UNIQUE (documento)`. En la capa de aplicación, el endpoint de creación verifica la preexistencia del documento retornando `HTTP 409 Conflict` (`El documento ya se encuentra registrado`). En cargas masivas, los registros existentes se detectan y se categorizan como "Ya registrados" para no generar fallos en lote.

### Excepciones
> No se identificaron excepciones en la implementación actual.

### Módulos afectados
- `02_control_ingreso`
- `03_control_salida`
- `04_equipos_vehiculos`
- `05_historial_reportes`
- `06_administracion_monitoreo`
- `07_gestion_academica`

### Entidades afectadas
- `aprendiz`

### Endpoints relacionados
- `POST /api/admin/aprendices`
- `PUT /api/admin/aprendices/:id_aprendiz`
- `POST /api/admin/aprendices/masivo`
- `GET /api/registroIngresos/verificarEntrada/:documento`

### Archivos relacionados
- [`DataBase/src/controllers/admin.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/controllers/admin.controller.ts)
- [`DataBase/src/schemas/admin.schema.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/schemas/admin.schema.ts)

### Historias de usuario relacionadas
- `HU-ING-001`, `HU-ADM-008`, `HU-ADM-009`.

---

## RN-GEN-005

### Nombre
Unicidad y Formato Canónico del Correo Electrónico para Cuentas de Usuario

### Descripción
Toda cuenta de usuario (`usuarios`) debe poseer una dirección de correo electrónico única en la base de datos. Los correos se normalizan automáticamente a minúsculas y sin espacios antes de persistirse.

### Motivo
El correo electrónico constituye el identificador de autenticación (*login principal*) para ingresar al software.

### Alcance
Módulos de autenticación y administración de usuarios.

### Evidencia
- **Constraint de BD**: `CONSTRAINT usuarios_email_key UNIQUE (email)` en tabla `usuarios`.
- **Esquema Zod**: [`DataBase/src/schemas/auth.schema.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/schemas/auth.schema.ts#L4-L10), [`DataBase/src/schemas/admin.schema.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/schemas/admin.schema.ts#L10-L15).
- **Controlador**: [`DataBase/src/controllers/auth.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/controllers/auth.controller.ts), [`DataBase/src/controllers/admin.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/controllers/admin.controller.ts#L950-L980).

### Implementación
La unicidad está forzada por la restricción `UNIQUE` en PostgreSQL. La capa de validación Zod aplica `.trim().toLowerCase().email()` interceptando formatos no válidos antes de la consulta SQL. Si se intenta crear un celador con un correo ya existente, el controlador responde con `HTTP 409 Conflict`.

### Excepciones
> No se identificaron excepciones en la implementación actual.

### Módulos afectados
- `01_autenticacion_acceso`
- `06_administracion_monitoreo`

### Entidades afectadas
- `usuarios`

### Endpoints relacionados
- `POST /api/auth/login`
- `POST /api/admin/celadores`
- `PUT /api/admin/celadores/:id`

### Archivos relacionados
- [`DataBase/src/controllers/auth.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/controllers/auth.controller.ts)
- [`DataBase/src/controllers/admin.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/controllers/admin.controller.ts)

### Historias de usuario relacionadas
- `HU-AUTH-001`, `HU-ADM-007`.

---

# 3. Roles, Autenticación y Autorización (RBAC)

---

## RN-GEN-006

### Nombre
Control de Acceso Basado en Roles (RBAC) Estricto

### Descripción
El sistema define dos únicos roles válidos y mutuamente excluyentes en la tabla `roles`:
1. `ADMIN` (`id_rol = 1`): Acceso completo a métricas, alertas, desvinculaciones, corrección justificada de registros, gestión curricular y creación de celadores.
2. `CELADOR` (`id_rol = 2`): Acceso restringido exclusivamente a las operaciones de portería (registro de entradas, salidas, captura de firmas de equipos, verificación en tiempo real y consulta histórica en solo lectura).

### Motivo
Cumplir con el principio de menor privilegio, asegurando que el personal de vigilancia no pueda alterar configuraciones académicas, manipular estadísticas ni eliminar auditorías de acceso.

### Alcance
Transversal a todas las rutas y controladores del sistema.

### Evidencia
- **Tabla BD**: `roles (id_rol, nombre)` con registros `ADMIN` y `CELADOR`.
- **Middleware**: [`DataBase/src/middlewares/admin.middleware.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/middlewares/admin.middleware.ts#L33-L45) (`requireRole(['ADMIN'])`).
- **Enrutador Frontend**: [`src/router/index.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/router/index.ts) (`meta: { requiresAuth: true, role: 'ADMIN' }`).

### Implementación
En backend, las rutas protegidas ejecutan `authMiddleware` (valida el token JWT) seguido de `requireRole(['ADMIN'])`. Si el rol del token no coincide, se devuelve `HTTP 403 Forbidden` (`No tienes permisos`). En frontend, el router guard de Vue verifica el rol en el store de Pinia y bloquea la navegación no autorizada redirigiendo a la vista principal correspondiente.

### Excepciones
> No se identificaron excepciones en la implementación actual.

### Módulos afectados
- Transversal a todos los módulos.

### Entidades afectadas
- `usuarios`
- `roles`

### Endpoints relacionados
- `POST /api/auth/login`
- Todos los endpoints `/api/admin/*`

### Archivos relacionados
- [`DataBase/src/middlewares/admin.middleware.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/middlewares/admin.middleware.ts)
- [`src/router/index.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/router/index.ts)
- [`src/stores/auth.store.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/stores/auth.store.ts)

### Historias de usuario relacionadas
- `HU-AUTH-001`, `HU-AUTH-003`, `HU-ADM-001`.

---

## RN-GEN-007

### Nombre
Autenticación Stateless mediante Tokens JWT y Criptografía Bcrypt

### Descripción
La autenticación de usuarios es desacoplada y sin estado (*stateless*):
1. Las contraseñas se almacenan mediante hash generado con el algoritmo `bcrypt` (10 rondas de salt).
2. El inicio de sesión emite un token JWT firmado con la variable de entorno `JWT_SECRET`, conteniendo en su payload `{ id, email, rol }`.
3. El tiempo máximo de vigencia del token es de **24 horas (`1d`)**.

### Motivo
Garantizar la protección contra ataques de fuerza bruta o filtración de base de datos, y proveer una sesión segura para turnos continuos de vigilancia sin almacenar sesiones en memoria del servidor.

### Alcance
Módulos de autenticación y comunicación API en todos los módulos.

### Evidencia
- **Controlador Auth**: [`DataBase/src/controllers/auth.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/controllers/auth.controller.ts#L70-L95).
- **Middleware**: [`DataBase/src/middlewares/admin.middleware.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/middlewares/admin.middleware.ts#L13-L31).

### Implementación
Al ejecutar `POST /api/auth/login`, el backend busca el usuario activo por correo, compara la clave con `bcrypt.compare`, y si coincide genera el token mediante `jwt.sign(payload, secret, { expiresIn: '1d' })`. Las peticiones subsiguientes envían el encabezado `Authorization: Bearer <token>`, el cual es verificado por `jwt.verify`.

### Excepciones
> No se identificaron excepciones en la implementación actual.

### Módulos afectados
- Todos los módulos.

### Entidades afectadas
- `usuarios`

### Endpoints relacionados
- `POST /api/auth/login`

### Archivos relacionados
- [`DataBase/src/controllers/auth.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/controllers/auth.controller.ts)
- [`DataBase/src/middlewares/admin.middleware.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/middlewares/admin.middleware.ts)

### Historias de usuario relacionadas
- `HU-AUTH-001`.

---

## RN-GEN-008

### Nombre
Restricción en la Creación de Cuentas (Prohibición de Auto-Creación de Administradores)

### Descripción
El sistema prohíbe la creación o elevación de usuarios al rol `ADMIN` a través de los formularios o endpoints del sistema. Los endpoints de administración de usuarios solo permiten crear, modificar o cambiar el estado de cuentas con rol `CELADOR` (`id_rol = 2`).

### Motivo
Blindar la seguridad de la infraestructura del sistema, evitando que un administrador comprometido o un operador cree nuevos administradores sin intervención directa sobre la base de datos por personal técnico de TI.

### Alcance
Módulo de administración y autenticación.

### Evidencia
- **Controlador**: [`DataBase/src/controllers/admin.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/controllers/admin.controller.ts#L960-L975) (Fuerza de forma explícita `id_rol = 2` en el `INSERT INTO usuarios`).
- **Esquema Zod**: [`DataBase/src/schemas/admin.schema.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/schemas/admin.schema.ts#L3-L20) (`createCeladorSchema`).

### Implementación
El controlador backend descarta cualquier parámetro de rol enviado por el cliente y asigna estrictamente el valor `2` (`CELADOR`) en la consulta parametrizada a PostgreSQL.

### Excepciones
> La creación inicial del usuario administrador se realiza exclusivamente mediante scripts de inicialización (`seeds.sql`) en el despliegue del servidor.

### Módulos afectados
- `01_autenticacion_acceso`
- `06_administracion_monitoreo`

### Entidades afectadas
- `usuarios`
- `roles`

### Endpoints relacionados
- `POST /api/admin/celadores`
- `PUT /api/admin/celadores/:id`

### Archivos relacionados
- [`DataBase/src/controllers/admin.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/controllers/admin.controller.ts)
- [`DataBase/src/schemas/admin.schema.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/schemas/admin.schema.ts)

### Historias de usuario relacionadas
- `HU-ADM-007`

---

# 4. Gestión Curricular, Programas y Fichas Formativas

---

## RN-GEN-009

### Nombre
Jerarquía Curricular Estricta (Programa Curricular 1 -> N Fichas Formativas)

### Descripción
Todo programa de formación (`programa`) representa un diseño curricular institucional (ej. *ADSO*, *Animación 3D*) y puede tener asociadas múltiples formaciones o fichas formativas (`formaciones`). Sin embargo, toda formación debe estar inexcusablemente asociada a **un único programa académico** y a **un único horario**.

### Motivo
Respetar la estructura académica del SENA, donde cada número de ficha formativa constituye una cohorte específica de un programa de formación oficial.

### Alcance
Módulos de gestión académica, administración y control de ingreso.

### Evidencia
- **Claves Foráneas**: `formaciones_id_programa_fkey` (`FOREIGN KEY (id_programa) REFERENCES programa(id_programa)`) y `formaciones_id_horario_fkey` (`FOREIGN KEY (id_horario) REFERENCES horario(id_horario)`).
- **Esquema Zod**: [`DataBase/src/schemas/admin.schema.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/schemas/admin.schema.ts#L80-L99) (`createFormacionSchema`).

### Implementación
La restricción se asegura por llaves foráneas `NOT NULL` en PostgreSQL. La creación o edición de una formación exige `id_programa` y `id_horario` válidos; de lo contrario, la base de datos rechaza la transacción por violación de integridad referencial.

### Excepciones
> No se identificaron excepciones en la implementación actual.

### Módulos afectados
- `07_gestion_academica`
- `02_control_ingreso`

### Entidades afectadas
- `programa`
- `formaciones`
- `horario`

### Endpoints relacionados
- `POST /api/admin/formaciones`
- `PUT /api/admin/formaciones/:id_formacion`
- `GET /api/admin/formaciones`

### Archivos relacionados
- [`DataBase/src/controllers/admin.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/controllers/admin.controller.ts)
- [`DataBase/schema/gedascBD.sql`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/schema/gedascBD.sql)

### Historias de usuario relacionadas
- `HU-ACAD-001`, `HU-ACAD-003`.

---

## RN-GEN-010

### Nombre
Unicidad del Número Oficial de Ficha Formativa (`id_formacion`)

### Descripción
El identificador de formación (`id_formacion`) corresponde al número oficial de la ficha asignado por la institución. Este identificador es la clave primaria de la entidad `formaciones` y es **estrictamente único** en todo el sistema.

### Motivo
Evitar colisiones operativas entre cohortes académicas y permitir búsquedas directas en portería por número de ficha.

### Alcance
Módulo de gestión académica y control de ingreso.

### Evidencia
- **Primary Key**: `CONSTRAINT formaciones_pkey PRIMARY KEY (id_formacion)` en tabla `formaciones`.
- **Esquema Zod**: [`DataBase/src/schemas/admin.schema.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/schemas/admin.schema.ts#L82-L86) (`id_formacion: z.coerce.number().int().positive().min(100000)`).

### Implementación
PostgreSQL aplica la restricción de Primary Key sobre `id_formacion`. Si se intenta crear una ficha con un número ya existente, la base de datos arroja error de llave duplicada (`code: 23505`) y el controlador responde con `HTTP 409 Conflict`.

### Excepciones
> No se identificaron excepciones en la implementación actual.

### Módulos afectados
- `07_gestion_academica`
- `02_control_ingreso`

### Entidades afectadas
- `formaciones`

### Endpoints relacionados
- `POST /api/admin/formaciones`
- `GET /api/admin/formaciones/:id_formacion`

### Archivos relacionados
- [`DataBase/src/controllers/admin.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/controllers/admin.controller.ts)
- [`DataBase/src/schemas/admin.schema.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/schemas/admin.schema.ts)

### Historias de usuario relacionadas
- `HU-ACAD-003`

---

## RN-GEN-011

### Nombre
Unicidad de Matrícula por Ficha Formativa (`unique_id_aprendiz_id_formacion`)

### Descripción
Un aprendiz puede estar matriculado en más de un programa o ficha activa (ej. formación complementaria o doble titulación), pero **no puede existir más de una relación activa o registrada entre el mismo aprendiz y la misma ficha formativa**.

### Motivo
Prevenir duplicidades en las listas de asistencia de la cohorte y garantizar la integridad de las estadísticas de aprendices únicos matriculados por ficha.

### Alcance
Módulos de gestión académica y administración.

### Evidencia
- **Constraint de BD**: `CONSTRAINT unique_id_aprendiz_id_formacion UNIQUE (id_aprendiz, id_formacion)` en tabla `aprendiz_formacion`.
- **Controlador**: [`DataBase/src/controllers/admin.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/controllers/admin.controller.ts#L1250-L1280).

### Implementación
La base de datos impone la constraint `UNIQUE (id_aprendiz, id_formacion)`. En la adición individual o masiva de aprendices a una ficha, el backend comprueba previamente la existencia del vínculo y omite o rechaza la inserción redundante informando al usuario.

### Excepciones
> No se identificaron excepciones en la implementación actual.

### Módulos afectados
- `07_gestion_academica`
- `06_administracion_monitoreo`

### Entidades afectadas
- `aprendiz_formacion`
- `aprendiz`
- `formaciones`

### Endpoints relacionados
- `POST /api/admin/formaciones/:id_formacion/aprendices`
- `POST /api/admin/formaciones/:id_formacion/aprendices/masivo`

### Archivos relacionados
- [`DataBase/src/controllers/admin.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/controllers/admin.controller.ts)
- [`DataBase/schema/gedascBD.sql`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/schema/gedascBD.sql)

### Historias de usuario relacionadas
- `HU-ACAD-004`, `HU-ACAD-006`.

---

## RN-GEN-012

### Nombre
Detección y Bloqueo de Cruces de Horario en Doble Formación

### Descripción
Si un aprendiz se encuentra vinculado a más de una formación activa, los horarios de ambas fichas **no pueden solaparse en los mismos días de la semana y franjas horarias**. Al actualizar el horario de una ficha o modificar las horas de un horario asignado, el sistema valida la inexistencia de solapamientos temporales (`hora_inicio < otra_hora_fin AND hora_fin > otra_hora_inicio`) para cualquier aprendiz de la cohorte.

### Motivo
Prevenir inconsistencias académicas institucionales donde un estudiante figure programado presencialmente en dos ambientes de aprendizaje al mismo tiempo.

### Alcance
Módulo de gestión académica y administración curricular.

### Evidencia
- **Controlador**: [`DataBase/src/controllers/admin.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/controllers/admin.controller.ts#L610-L680) (Validación de cruce de horario en actualización y asignación).
- **Vistas Vue**: [`src/views/AdminHorariosView.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/views/AdminHorariosView.vue), [`src/components/Modals/ModalImportAprendicesMasivo.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/components/Modals/ModalImportAprendicesMasivo.vue).

### Implementación
Antes de ejecutar el `UPDATE` de horarios o vincular un aprendiz a una cohorte, el backend ejecuta una consulta de intersección de intervalos de tiempo (`tsrange` o comparación de horas) cruzando `horario_dia`, `horario` y `aprendiz_formacion`. Si se detecta cruce, responde con `HTTP 409 Conflict` detallando los aprendices y formaciones afectadas.

### Excepciones
> En importación masiva (`RN-ACAD-010`), los aprendices con cruce son omitidos individualmente en un reporte de novedades sin abortar la carga del resto del lote.

### Módulos afectados
- `07_gestion_academica`
- `06_administracion_monitoreo`

### Entidades afectadas
- `horario`
- `horario_dia`
- `formaciones`
- `aprendiz_formacion`

### Endpoints relacionados
- `PUT /api/admin/horarios/:id_horario`
- `PUT /api/admin/formaciones/:id_formacion`
- `POST /api/admin/formaciones/:id_formacion/aprendices/masivo`

### Archivos relacionados
- [`DataBase/src/controllers/admin.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/controllers/admin.controller.ts)
- [`src/Services/adminAcademic.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/Services/adminAcademic.ts)

### Historias de usuario relacionadas
- `HU-ACAD-002`, `HU-ACAD-003`, `HU-ACAD-006`.

---

# 5. Horarios, Jornadas y Control Temporal

---

## RN-GEN-013

### Nombre
Inferencia y Clasificación Automática de Jornadas Operativas

### Descripción
El sistema clasifica de forma automática e inequívoca las jornadas operativas del centro de formación a partir de la hora de la transacción o de inicio de la formación:
- **Mañana / Diurna**: `06:00:00` a `11:59:59`
- **Tarde**: `12:00:00` a `17:59:59`
- **Noche**: `18:00:00` a `23:59:59`

### Motivo
Estandarizar la clasificación horaria de las sesiones de acceso y permitir la agregación estadística consistente para reportes institucionales sin depender de la selección manual del operador.

### Alcance
Módulos de ingreso, salida, horarios curriculares, historial y reportes.

### Evidencia
- **Controladores**: [`DataBase/src/controllers/jornada.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/controllers/jornada.controller.ts), [`DataBase/src/controllers/admin.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/controllers/admin.controller.ts#L88-L94).
- **Composables Frontend**: [`src/composables/useJornada.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/composables/useJornada.ts).

### Implementación
Tanto el backend como el frontend ejecutan la función de inferencia temporal basada en la hora efectiva del servidor. En la creación de horarios (`POST /api/admin/horarios`), la columna `jornada` se calcula e inserta automáticamente en la base de datos.

### Excepciones
> No se identificaron excepciones en la implementación actual.

### Módulos afectados
- `02_control_ingreso`
- `03_control_salida`
- `05_historial_reportes`
- `07_gestion_academica`

### Entidades afectadas
- `horario`
- `detalles_ingreso`

### Endpoints relacionados
- `GET /api/jornadaTime/tiempoJornada`
- `POST /api/admin/horarios`

### Archivos relacionados
- [`DataBase/src/controllers/jornada.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/controllers/jornada.controller.ts)
- [`src/composables/useJornada.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/composables/useJornada.ts)

### Historias de usuario relacionadas
- `HU-ING-005`, `HU-ACAD-002`.

---

## RN-GEN-014

### Nombre
Ventana de Tolerancia Horaria para Acceso Académico (±30 Minutos)

### Descripción
La verificación en tiempo real de si un aprendiz asiste a una formación curricular programada se evalúa aplicando una ventana de tolerancia de:
- **30 minutos antes** de la hora de inicio oficial (`hora_inicio - 30 min`).
- **30 minutos después** de la hora de finalización oficial (`hora_fin + 30 min`).

Si la hora del escaneo se encuentra dentro de esta ventana para el día de la semana vigente, el ingreso se imputa directamente a la formación correspondiente.

### Motivo
Permitir el ingreso anticipado de aprendices para alistamiento en talleres y laboratorios, y la salida ordenada tras culminar la jornada académica.

### Alcance
Módulo de control de ingreso y control de salida.

### Evidencia
- **Controlador**: [`DataBase/src/controllers/entry.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/controllers/entry.controller.ts#L183-L196).
- **Documentación de Módulo**: [`documentacion/modulos/02_control_ingreso/reglas_negocio.md`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/documentacion/modulos/02_control_ingreso/reglas_negocio.md#L76-L84).

### Implementación
El controlador backend consulta las formaciones activas del aprendiz que tengan asignado el día actual en `horario_dia`. Compara `hora_actual >= (hora_inicio - INTERVAL '30 minutes') AND hora_actual <= (hora_fin + INTERVAL '30 minutes')`.

### Excepciones
> Si la hora está por fuera de la ventana de tolerancia, el sistema no rechaza el ingreso pero exige capturar obligatoriamente un motivo de visita (`RN-GEN-019`).

### Módulos afectados
- `02_control_ingreso`
- `03_control_salida`
- `07_gestion_academica`

### Entidades afectadas
- `horario`
- `horario_dia`
- `formaciones`
- `detalles_ingreso`

### Endpoints relacionados
- `GET /api/registroIngresos/verificarEntrada/:documento`

### Archivos relacionados
- [`DataBase/src/controllers/entry.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/controllers/entry.controller.ts)

### Historias de usuario relacionadas
- `HU-ING-007`

---

## RN-GEN-015

### Nombre
Bloqueo Operativo Nocturno / Fuera de Jornada (00:00:00 a 05:59:59)

### Descripción
Durante la franja horaria comprendida entre las `00:00:00` y las `05:59:59`, el sistema establece su estado operativo como `Cerrado`. En este intervalo se deshabilitan las opciones de escaneo e ingreso ordinario en la interfaz de portería.

### Motivo
Preservar la seguridad física del centro de formación en horas de la madrugada donde no hay programación académica ni actividades de talleres autorizadas.

### Alcance
Módulos de control de ingreso y control de salida.

### Evidencia
- **Controlador**: [`DataBase/src/controllers/jornada.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/controllers/jornada.controller.ts).
- **Composable**: [`src/composables/useJornada.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/composables/useJornada.ts).
- **Vista Principal**: [`src/views/GeneralEntryView.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/views/GeneralEntryView.vue).

### Implementación
La API retorna `estado: 'Cerrado'` en `GET /api/jornadaTime/tiempoJornada`. En la interfaz de usuario de Vue, se bloquean los campos de entrada y botones de escaneo, mostrando un indicador visual de centro fuera de servicio.

### Excepciones
> No se identificaron excepciones en la implementación actual.

### Módulos afectados
- `02_control_ingreso`
- `03_control_salida`

### Entidades afectadas
- Ninguna entidad de BD modificada (Validación de estado en tiempo de ejecución).

### Endpoints relacionados
- `GET /api/jornadaTime/tiempoJornada`

### Archivos relacionados
- [`DataBase/src/controllers/jornada.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/controllers/jornada.controller.ts)
- [`src/composables/useJornada.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/composables/useJornada.ts)

### Historias de usuario relacionadas
- `HU-ING-005`

---

## RN-GEN-016

### Nombre
Prevalencia del Reloj Simulado para Aseguramiento de Calidad y Pruebas

### Descripción
Cuando la variable global de simulación de hora está activa en el servidor (`simulacionActiva = true`), todas las funciones de inferencia de jornada, evaluación de ventanas de tolerancia académica y bloqueos horarios deben computarse a partir de la hora simulada configurada por el administrador.

### Motivo
Permitir la realización de pruebas de homologación, validaciones funcionales y aseguramiento de calidad (QA) en cualquier momento del día sin alterar el reloj del sistema operativo.

### Alcance
Módulos de ingreso, salida, horarios y administración.

### Evidencia
- **Controlador**: [`DataBase/src/controllers/admin.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/controllers/admin.controller.ts#L40-L55).
- **Esquema Zod**: [`DataBase/src/schemas/admin.schema.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/schemas/admin.schema.ts#L101-L105) (`simularHoraSchema`).

### Implementación
El backend mantiene el estado en memoria de la hora simulada. Los controladores que calculan la hora actual invocan una función auxiliar (`getEffectiveTime()`) que prioriza la hora simulada si está habilitada sobre `new Date()`.

### Excepciones
> En entornos de producción con simulación inactiva, rige la hora física provista por PostgreSQL / servidor.

### Módulos afectados
- `02_control_ingreso`
- `03_control_salida`
- `06_administracion_monitoreo`
- `07_gestion_academica`

### Entidades afectadas
- Ninguna (Estado en memoria de ejecución del backend).

### Endpoints relacionados
- `POST /api/admin/simularHora`
- `GET /api/admin/simularHora`

### Archivos relacionados
- [`DataBase/src/controllers/admin.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/controllers/admin.controller.ts)
- [`src/views/AdminSimulacionHoraView.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/views/AdminSimulacionHoraView.vue)

### Historias de usuario relacionadas
- `HU-ING-009`

---

# 6. Ciclo de Vida de Sesiones de Ingreso y Egreso

---

## RN-GEN-017

### Nombre
Existencia y Estado Activo Previo del Aprendiz para Registro de Acceso

### Descripción
Solo se permite registrar movimientos de acceso (ingresos o salidas) de personas que se encuentren previamente dadas de alta en la tabla `aprendiz` y cuyo estado sea activo (`estado = true`). Si el documento no existe o se encuentra inactivo, el sistema rechaza la operación con `HTTP 404 Not Found` o `HTTP 403 Forbidden`.

### Motivo
Impedir el acceso a las instalaciones de personas no identificadas en la base de datos institucional o aprendices retirados/suspendidos.

### Alcance
Módulos de ingreso, salida y equipos/vehículos.

### Evidencia
- **Controlador**: [`DataBase/src/controllers/entry.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/controllers/entry.controller.ts#L40-L48), [`DataBase/src/controllers/exit.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/controllers/exit.controller.ts#L40-L45).
- **Esquema Zod**: [`DataBase/src/schemas/entry.schema.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/schemas/entry.schema.ts), [`DataBase/src/schemas/exit.schema.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/schemas/exit.schema.ts).

### Implementación
Antes de procesar la inserción en `detalles_ingreso` o `detalles_salida`, el backend ejecuta `SELECT id_aprendiz, estado FROM aprendiz WHERE documento = $1`. Si el resultado es nulo o `estado = false`, la transacción se detiene inmediatamente.

### Excepciones
> No se identificaron excepciones en la implementación actual.

### Módulos afectados
- `02_control_ingreso`
- `03_control_salida`
- `04_equipos_vehiculos`

### Entidades afectadas
- `aprendiz`
- `detalles_ingreso`

### Endpoints relacionados
- `GET /api/registroIngresos/verificarEntrada/:documento`
- `POST /api/registroIngresos/addEntry/:documento`
- `GET /api/registroSalidas/verificarSalida/:documento`
- `POST /api/registroSalidas/addExit/:documento`

### Archivos relacionados
- [`DataBase/src/controllers/entry.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/controllers/entry.controller.ts)
- [`DataBase/src/controllers/exit.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/controllers/exit.controller.ts)

### Historias de usuario relacionadas
- `HU-ING-001`, `HU-ING-002`, `HU-SAL-001`.

---

## RN-GEN-018

### Nombre
Invariante de Ciclo de Sesión (No Egreso sin Ingreso Previo / Toggle Automático)

### Descripción
El ciclo de permanencia de un aprendiz sigue un modelo estrictamente secuencial:
1. No se puede registrar una salida (`detalles_salida`) sin un registro de ingreso previo en la fecha actual que carezca de salida asociada (`detalles_salida.hora_salida IS NULL`).
2. Si un aprendiz con sesión activa es escaneado en la vista de ingreso general, el sistema no crea un segundo ingreso concurrente; en su lugar, procesa el **cierre de la sesión activa (toggle de salida)**.

### Motivo
Mantener la coherencia física de permanencia (un aprendiz no puede estar simultáneamente dentro y fuera) y optimizar la agilidad de atención en portería durante horas pico.

### Alcance
Módulos de ingreso, salida e historial.

### Evidencia
- **Controlador Entry**: [`DataBase/src/controllers/entry.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/controllers/entry.controller.ts#L51-L74).
- **Controlador Exit**: [`DataBase/src/controllers/exit.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/controllers/exit.controller.ts#L43-L57).
- **Foreign Key**: `detalles_salida_id_ingreso_fkey` (`FOREIGN KEY (id_ingreso) REFERENCES detalles_ingreso(id_ingreso)`).

### Implementación
La integridad está asegurada por la relación `1 a 1` entre `detalles_ingreso` y `detalles_salida`. En backend, se verifica la presencia del registro abierto mediante un `LEFT JOIN detalles_salida ds ON di.id_ingreso = ds.id_ingreso WHERE ds.id_salida IS NULL`.

### Excepciones
> Si el aprendiz tiene activos registrados en `detalles_maquinas` con `estado_equipo = 'dentro'`, la salida automática se suspende hasta capturar la firma de retiro (`RN-GEN-024`).

### Módulos afectados
- `02_control_ingreso`
- `03_control_salida`
- `05_historial_reportes`

### Entidades afectadas
- `detalles_ingreso`
- `detalles_salida`

### Endpoints relacionados
- `GET /api/registroIngresos/verificarEntrada/:documento`
- `POST /api/registroIngresos/addEntry/:documento`
- `GET /api/registroSalidas/verificarSalida/:documento`
- `POST /api/registroSalidas/addExit/:documento`

### Archivos relacionados
- [`DataBase/src/controllers/entry.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/controllers/entry.controller.ts)
- [`DataBase/src/controllers/exit.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/controllers/exit.controller.ts)

### Historias de usuario relacionadas
- `HU-ING-003`, `HU-SAL-001`, `HU-SAL-002`.

---

## RN-GEN-019

### Nombre
Justificación Obligatoria de Reingresos Diarios Múltiples

### Descripción
Si un aprendiz no tiene sesión activa abierta pero ya registra al menos un ingreso cerrado en la misma fecha calendario (`total_hoy > 0`), el nuevo acceso se clasifica como un **reingreso** y requiere obligatoriamente registrar un `motivo_reingreso` justificado.

### Motivo
Monitorear y auditar los motivos por los cuales los aprendices salen y reingresan a las instalaciones durante el día (ej. almuerzo, diligencias, regreso a talleres).

### Alcance
Módulos de control de ingreso, historial y reportes.

### Evidencia
- **Controlador**: [`DataBase/src/controllers/entry.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/controllers/entry.controller.ts#L163-L175).
- **Esquema Zod**: [`DataBase/src/schemas/entry.schema.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/schemas/entry.schema.ts#L22-L27).
- **Componente Vue**: [`src/components/AprendizUI/Modals/ModalReentryReason.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/components/AprendizUI/Modals/ModalReentryReason.vue).

### Implementación
El backend ejecuta un conteo de ingresos del día para el aprendiz. Si `count > 0` y no viene el campo `motivo_reingreso`, el endpoint de verificación retorna `requiere_motivo_reingreso: true`. El frontend despliega el modal interactivo de captura antes de despachar `POST /api/registroIngresos/addEntry/:documento`.

### Excepciones
> El primer ingreso de la jornada no exige motivo de reingreso.

### Módulos afectados
- `02_control_ingreso`
- `05_historial_reportes`

### Entidades afectadas
- `detalles_ingreso`

### Endpoints relacionados
- `GET /api/registroIngresos/verificarEntrada/:documento`
- `POST /api/registroIngresos/addEntry/:documento`

### Archivos relacionados
- [`DataBase/src/controllers/entry.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/controllers/entry.controller.ts)
- [`src/components/AprendizUI/Modals/ModalReentryReason.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/components/AprendizUI/Modals/ModalReentryReason.vue)

### Historias de usuario relacionadas
- `HU-ING-004`

---

## RN-GEN-020

### Nombre
Motivo de Visita Obligatorio para Ingresos Fuera de Horario Curricular

### Descripción
Si la hora del acceso no coincide con ninguna formación activa del aprendiz dentro de la ventana de tolerancia para el día actual, el sistema bloquea el ingreso directo y exige el registro obligatorio de un `motivo_visita`.

### Motivo
Evitar la permanencia injustificada de aprendices en el centro educativo cuando no tienen clases programadas.

### Alcance
Módulos de ingreso, historial y reportes.

### Evidencia
- **Controlador**: [`DataBase/src/controllers/entry.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/controllers/entry.controller.ts#L230-L245).
- **Esquema Zod**: [`DataBase/src/schemas/entry.schema.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/schemas/entry.schema.ts#L29-L34).
- **Componente Vue**: [`src/components/AprendizUI/Modals/ModalVisitReason.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/components/AprendizUI/Modals/ModalVisitReason.vue).

### Implementación
Si la consulta de horarios curriculares devuelve cero coincidencias para el aprendiz, el backend marca la respuesta con `requiere_motivo_visita: true`. El frontend abre el modal de justificación de visita y lo envía al endpoint de creación.

### Excepciones
> No aplica cuando el ingreso coincide con una formación programada del aprendiz.

### Módulos afectados
- `02_control_ingreso`
- `05_historial_reportes`

### Entidades afectadas
- `detalles_ingreso`

### Endpoints relacionados
- `GET /api/registroIngresos/verificarEntrada/:documento`
- `POST /api/registroIngresos/addEntry/:documento`

### Archivos relacionados
- [`DataBase/src/controllers/entry.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/controllers/entry.controller.ts)
- [`src/components/AprendizUI/Modals/ModalVisitReason.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/components/AprendizUI/Modals/ModalVisitReason.vue)

### Historias de usuario relacionadas
- `HU-ING-007`

---

## RN-GEN-021

### Nombre
Restricción Temporal Antirrebote en Egreso Inmediato (< 5 Minutos)

### Descripción
El sistema bloquea el registro de salida de un aprendiz si han transcurrido **menos de 5 minutos** desde el instante exacto en que se registró su ingreso.

### Motivo
Prevenir dobles lecturas involuntarias del escáner en portería y disuadir registros fraudulentos donde el usuario registra entrada e inmediatamente salida.

### Alcance
Módulo de control de salida e ingreso general.

### Evidencia
- **Controlador**: [`DataBase/src/controllers/exit.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/controllers/exit.controller.ts).
- **Composable**: [`src/composables/useExitAprendiz.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/composables/useExitAprendiz.ts).

### Implementación
El backend calcula la diferencia `EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - di.hora_ingreso)) / 60`. Si la diferencia es menor a 5 minutos, rechaza la operación con `HTTP 400 Bad Request` indicando los minutos transcurridos.

### Excepciones
> No se identificaron excepciones en la implementación actual.

### Módulos afectados
- `03_control_salida`
- `02_control_ingreso`

### Entidades afectadas
- `detalles_ingreso`
- `detalles_salida`

### Endpoints relacionados
- `POST /api/registroSalidas/addExit/:documento`

### Archivos relacionados
- [`DataBase/src/controllers/exit.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/controllers/exit.controller.ts)
- [`src/composables/useExitAprendiz.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/composables/useExitAprendiz.ts)

### Historias de usuario relacionadas
- `HU-SAL-003`

---

## RN-GEN-022

### Nombre
Registro Justificado en Salidas Anticipadas respecto al Horario Académico

### Descripción
Si la hora del egreso es anterior a la hora de finalización del horario académico asignado (`hora_actual < hora_fin - 30 min`), el sistema clasifica la salida como anticipada y exige registrar el motivo en `detalles_salida.motivo_salida_anticipada`.

### Motivo
Auditar permisos especiales, salidas médicas o posibles deserciones tempranas de clase en el CTA.

### Alcance
Módulos de control de salida, historial y reportes.

### Evidencia
- **Controlador**: [`DataBase/src/controllers/exit.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/controllers/exit.controller.ts).
- **Esquema Zod**: [`DataBase/src/schemas/exit.schema.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/schemas/exit.schema.ts#L20-L26).
- **Componente Vue**: [`src/components/AprendizUI/Modals/ModalEarlyExitReason.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/components/AprendizUI/Modals/ModalEarlyExitReason.vue).

### Implementación
El backend compara la hora de salida contra el horario de la formación vinculada a la sesión en `detalles_ingreso`. Si es anticipada, retorna la novedad al frontend, requiriendo el motivo antes de insertar en `detalles_salida`.

### Excepciones
> No aplica si la salida se registra dentro o después de la ventana de finalización curricular.

### Módulos afectados
- `03_control_salida`
- `05_historial_reportes`

### Entidades afectadas
- `detalles_salida`
- `detalles_ingreso`

### Endpoints relacionados
- `GET /api/registroSalidas/verificarSalida/:documento`
- `POST /api/registroSalidas/addExit/:documento`

### Archivos relacionados
- [`DataBase/src/controllers/exit.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/controllers/exit.controller.ts)
- [`src/components/AprendizUI/Modals/ModalEarlyExitReason.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/components/AprendizUI/Modals/ModalEarlyExitReason.vue)

### Historias de usuario relacionadas
- `HU-SAL-006`

---

## RN-GEN-023

### Nombre
Clasificación de Tipo de Sesión para Aprendices con Rol de Monitor

### Descripción
Cuando un aprendiz posee la bandera `es_monitor = true`, el sistema no asume automáticamente que su ingreso es lectivo; requiere clasificar explícitamente en `detalles_ingreso.tipo_sesion` el valor `'formacion'` o `'monitoria'`.

### Motivo
Distinguir formalmente las horas dedicadas al plan de estudios curricular de las horas de contraprestación de monitoría para efectos de control y certificación institucional.

### Alcance
Módulos de ingreso, administración y seguimiento.

### Evidencia
- **Constraint CHECK**: `CONSTRAINT detalles_ingreso_tipo_sesion_check CHECK (tipo_sesion IN ('formacion', 'monitoria'))` en tabla `detalles_ingreso`.
- **Esquema Zod**: [`DataBase/src/schemas/entry.schema.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/schemas/entry.schema.ts#L20-L21).
- **Componente Vue**: [`src/components/AprendizUI/Modals/ModalConfirm.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/components/AprendizUI/Modals/ModalConfirm.vue).

### Implementación
La base de datos restringe los valores mediante `CHECK`. Al verificar la entrada de un monitor, el frontend despliega el selector de tipo de sesión y envía la opción seleccionada en el payload de `addEntry`.

### Excepciones
> Aprendices no monitores (`es_monitor = false`) reciben por defecto `tipo_sesion = 'formacion'`.

### Módulos afectados
- `02_control_ingreso`
- `06_administracion_monitoreo`

### Entidades afectadas
- `aprendiz`
- `detalles_ingreso`

### Endpoints relacionados
- `POST /api/registroIngresos/addEntry/:documento`

### Archivos relacionados
- [`DataBase/src/controllers/entry.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/controllers/entry.controller.ts)
- [`DataBase/schema/gedascBD.sql`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/schema/gedascBD.sql)

### Historias de usuario relacionadas
- `HU-ING-006`

---

# 7. Custodia de Activos, Doble Firma y Préstamos

---

## RN-GEN-024

### Nombre
Obligatoriedad de Doble Firma Digital en Cadena de Custodia de Activos

### Descripción
Todo ingreso de un equipo de cómputo o vehículo a las instalaciones requiere capturar la firma digital manuscrita de entrada (`firma_ingreso`), y todo retiro físico del activo requiere capturar la firma digital de salida (`firma_salida`). Ambas firmas son inmutables y se almacenan en formato Base64 (`image/png`).

### Motivo
Aportar respaldo jurídico y prueba pericial de no repudio para la institución y el portador respecto a la tenencia física del activo dentro del centro.

### Alcance
Módulos de equipos/vehículos, ingreso, salida y reportes históricos.

### Evidencia
- **Tabla BD**: `detalles_maquinas` (`firma_ingreso TEXT NOT NULL`, `firma_salida TEXT`, `estado_equipo VARCHAR(20)`).
- **Esquema Zod**: [`DataBase/src/schemas/machine.schema.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/schemas/machine.schema.ts#L42-L47) (`signatureSchema`).
- **Librería Frontend**: [`src/components/Library/SignaturePad.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/components/Library/SignaturePad.vue).

### Implementación
La columna `firma_ingreso` está definida como `NOT NULL` en PostgreSQL. La firma de salida se actualiza en el endpoint de retiro de equipo junto con el cambio de estado a `'retirado'` y el registro de `hora_retiro_equipo = CURRENT_TIMESTAMP`.

### Excepciones
> No se identificaron excepciones en la implementación actual.

### Módulos afectados
- `04_equipos_vehiculos`
- `02_control_ingreso`
- `03_control_salida`
- `05_historial_reportes`

### Entidades afectadas
- `detalles_maquinas`
- `computadores`
- `vehiculos`

### Endpoints relacionados
- `POST /api/registroIngresos/ingresoMaquina/:id`
- `POST /api/registroSalidas/retirarEquipo/:id_detallemaquina`

### Archivos relacionados
- [`DataBase/src/controllers/entry.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/controllers/entry.controller.ts)
- [`DataBase/src/controllers/exit.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/controllers/exit.controller.ts)
- [`src/components/Library/SignaturePad.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/components/Library/SignaturePad.vue)

### Historias de usuario relacionadas
- `HU-ACT-001`, `HU-ACT-002`, `HU-ACT-005`.

---

## RN-GEN-025

### Nombre
Bloqueo de Salida del Aprendiz con Activos Vinculados No Retirados

### Descripción
Si una sesión de acceso posee uno o más activos vinculados en `detalles_maquinas` con `estado_equipo = 'dentro'`, la salida del aprendiz queda **estrictamente bloqueada** hasta que se capture la firma de retiro de cada equipo y su estado pase a `'retirado'`.

### Motivo
Evitar que los aprendices abandonen las instalaciones dejando equipos o vehículos registrados a su nombre sin la verificación y entrega formal de custodia.

### Alcance
Módulos de salida, ingreso y equipos/vehículos.

### Evidencia
- **Controlador Entry**: [`DataBase/src/controllers/entry.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/controllers/entry.controller.ts#L147-L160).
- **Controlador Exit**: [`DataBase/src/controllers/exit.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/controllers/exit.controller.ts#L14-L20).
- **Vistas Vue**: [`src/views/GeneralEntryView.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/views/GeneralEntryView.vue), [`src/views/GeneralExitView.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/views/GeneralExitView.vue).

### Implementación
Al verificar la salida por documento, el backend consulta `SELECT dm.id_detallemaquina, dm.estado_equipo FROM detalles_maquinas dm WHERE dm.id_ingreso = $1 AND dm.estado_equipo = 'dentro'`. Si existen registros, el backend retorna `tiene_equipos_pendientes: true`, forzando la apertura del modal de retiro antes de permitir el egreso del aprendiz.

### Excepciones
> No se identificaron excepciones en la implementación actual.

### Módulos afectados
- `03_control_salida`
- `02_control_ingreso`
- `04_equipos_vehiculos`

### Entidades afectadas
- `detalles_maquinas`
- `detalles_salida`

### Endpoints relacionados
- `GET /api/registroSalidas/verificarSalida/:documento`
- `POST /api/registroSalidas/retirarEquipo/:id_detallemaquina`

### Archivos relacionados
- [`DataBase/src/controllers/exit.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/controllers/exit.controller.ts)
- [`DataBase/src/controllers/entry.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/controllers/entry.controller.ts)

### Historias de usuario relacionadas
- `HU-SAL-004`, `HU-ACT-006`.

---

## RN-GEN-026

### Nombre
Detección Automática de Préstamos y Trazabilidad de Titularidad

### Descripción
Todo equipo o vehículo que ingresa al CTA se valida contra el registro histórico de titularidad (`aprendiz_computador` / `aprendiz_vehiculo`). Si el serial o placa ya se encuentra asociado a un aprendiz distinto al portador actual, el movimiento se marca obligatoriamente como **préstamo** y se almacena la relación entre titular y portador.

### Motivo
Mantener la trazabilidad institucional y resolver discrepancias en caso de pérdida, daño o reclamos sobre activos dentro del centro.

### Alcance
Módulos de equipos/vehículos, administración y reportes.

### Evidencia
- **Servicio Backend**: [`DataBase/src/services/machines/checksBorroweds.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/services/machines/checksBorroweds.ts).
- **Controladores**: [`DataBase/src/controllers/computer.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/controllers/computer.controller.ts), [`DataBase/src/controllers/vehicle.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/controllers/vehicle.controller.ts).
- **Componente Vue**: [`src/components/AprendizUI/Modals/ModalAssetOwnerDetails.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/components/AprendizUI/Modals/ModalAssetOwnerDetails.vue).

### Implementación
Al ingresar serial/placa, el backend verifica el titular en `aprendiz_computador`. Si `id_aprendiz != aprendiz_actual`, el backend levanta la novedad de préstamo, asocia el movimiento y expone los datos de ambos aprendices en los endpoints de auditoría.

### Excepciones
> No se identificaron excepciones en la implementación actual.

### Módulos afectados
- `04_equipos_vehiculos`
- `05_historial_reportes`
- `06_administracion_monitoreo`

### Entidades afectadas
- `computadores`
- `vehiculos`
- `aprendiz_computador`
- `aprendiz_vehiculo`
- `detalles_maquinas`

### Endpoints relacionados
- `POST /api/registroIngresos/ingresoMaquina/:id`
- `GET /api/HistorialComputadores/propietario/:id_detallemaquina`
- `GET /api/HistorialVehiculos/propietario/:id_detallemaquina`

### Archivos relacionados
- [`DataBase/src/services/machines/checksBorroweds.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/services/machines/checksBorroweds.ts)
- [`DataBase/src/controllers/computer.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/controllers/computer.controller.ts)

### Historias de usuario relacionadas
- `HU-ACT-001`, `HU-ACT-003`, `HU-ACT-007`.

---

## RN-GEN-027

### Nombre
Unicidad Física y No Concurrencia de Activos dentro del Centro

### Descripción
Un computador o vehículo que figure con `estado_equipo = 'dentro'` en la tabla `detalles_maquinas` **no puede ser ingresado nuevamente** por ningún aprendiz (ni por su titular ni por un tercero) hasta que complete su ciclo de retiro formal.

### Motivo
Evitar inconsistencias físicas y clonación de registros donde un mismo activo figure dentro de las instalaciones dos veces en forma simultánea.

### Alcance
Módulo de equipos/vehículos e ingreso general.

### Evidencia
- **Servicio Backend**: [`DataBase/src/services/machines/checkDuplicate.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/services/machines/checkDuplicate.ts).
- **Controlador**: [`DataBase/src/controllers/entry.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/controllers/entry.controller.ts).

### Implementación
El servicio `checkDuplicate` ejecuta `SELECT 1 FROM detalles_maquinas WHERE (id_computador = $1 OR id_vehiculo = $2) AND estado_equipo = 'dentro'`. Si encuentra coincidencia, lanza excepción con `HTTP 409 Conflict` (`El equipo ya se encuentra registrado dentro de las instalaciones`).

### Excepciones
> Cuando el equipo pasa a `'retirado'`, queda inmediatamente habilitado para un nuevo ingreso (`RN-ACT-004`).

### Módulos afectados
- `04_equipos_vehiculos`
- `02_control_ingreso`

### Entidades afectadas
- `detalles_maquinas`
- `computadores`
- `vehiculos`

### Endpoints relacionados
- `POST /api/registroIngresos/ingresoMaquina/:id`

### Archivos relacionados
- [`DataBase/src/services/machines/checkDuplicate.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/services/machines/checkDuplicate.ts)

### Historias de usuario relacionadas
- `HU-ACT-004`

---

# 8. Estados, Transiciones y Preservación Histórica

---

## RN-GEN-028

### Nombre
Máquinas de Estados y Transiciones Válidas del Sistema

### Descripción
El sistema rige el ciclo de vida de sus entidades a través de estados predefinidos y controlados mediante constraints `CHECK` y validaciones Zod:
1. **`detalles_maquinas.estado_equipo`**: `'dentro'` $\rightarrow$ `'retirado'`. No se permite revertir de `'retirado'` a `'dentro'` sobre el mismo registro; cada nuevo ingreso genera una nueva tupla.
2. **`aprendiz_formacion.estado`**: `'activo'` $\rightarrow$ `'inactivo'` $\rightarrow$ `'finalizado'`.
3. **`formaciones.estado`**: `'activa'` $\rightarrow$ `'inactiva'` $\rightarrow$ `'finalizada'`.
4. **`programa.estado`**: `'activo'` $\rightarrow$ `'inactivo'`.
5. **`aprendiz.estado`** y **`usuarios.activo`**: Banderas booleanas (`true` / `false`).

### Motivo
Asegurar la consistencia semántica y transaccional de los datos en todas las operaciones del software.

### Alcance
Transversal a todas las entidades del sistema.

### Evidencia
- **Constraints de BD**:
  - `detalles_maquinas_estado_equipo_check`: `CHECK (estado_equipo IN ('dentro', 'retirado'))`
  - `aprendiz_formacion_estado_check`: `CHECK (estado IN ('activo', 'inactivo', 'finalizado'))`
  - `formaciones_estado_check`: `CHECK (estado IN ('activa', 'inactiva', 'finalizada'))`
  - `programa_estado_check`: `CHECK (estado IN ('activo', 'inactivo'))`
- **Esquemas Zod**: [`DataBase/src/schemas/admin.schema.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/schemas/admin.schema.ts).

### Implementación
Garantizado a nivel de base de datos relacional mediante restricciones `CHECK` de PostgreSQL y en capa de transporte mediante enumeraciones `z.enum([...])` en los esquemas de validación Zod.

### Excepciones
> No se identificaron excepciones en la implementación actual.

### Módulos afectados
- Todos los módulos.

### Entidades afectadas
- `detalles_maquinas`
- `aprendiz_formacion`
- `formaciones`
- `programa`
- `aprendiz`
- `usuarios`

### Endpoints relacionados
- Endpoints de creación y actualización en `/api/*`.

### Archivos relacionados
- [`DataBase/schema/gedascBD.sql`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/schema/gedascBD.sql)
- [`DataBase/src/schemas/admin.schema.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/schemas/admin.schema.ts)

### Historias de usuario relacionadas
- `HU-ACT-005`, `HU-ACAD-001`, `HU-ADM-008`.

---

## RN-GEN-029

### Nombre
Preservación de la Verdad Histórica mediante Baja Lógica

### Descripción
El sistema protege la integridad y el no repudio de la información histórica de seguridad y permanencia:
1. Si se solicita la eliminación de un aprendiz que posee registros en `detalles_ingreso`, el sistema **rechaza la eliminación física** y ejecuta automáticamente una **baja lógica** (`aprendiz.estado = false`).
2. Las consultas históricas deben reflejar el estado y metadatos vigentes en el instante exacto en que ocurrió la sesión (programa, jornada, firmas). Las modificaciones posteriores en la ficha del aprendiz no alteran los registros históricos consumados.

### Motivo
Garantizar la inmutabilidad y valor probatorio institucional de los registros de portería ante auditorías o requerimientos judiciales.

### Alcance
Módulos de administración, historial y gestión académica.

### Evidencia
- **Controlador Admin**: [`DataBase/src/controllers/admin.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/controllers/admin.controller.ts#L1150-L1190).
- **Controlador History**: [`DataBase/src/controllers/history.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/controllers/history.controller.ts).

### Implementación
Al ejecutar `DELETE /api/admin/aprendices/:id`, el backend consulta si existen registros en `detalles_ingreso`. Si existen, ejecuta `UPDATE aprendiz SET estado = false WHERE id_aprendiz = $1` y retorna mensaje notificando la preservación del historial. Solo si no tiene movimientos históricos se permite la eliminación física de la tabla `aprendiz`.

### Excepciones
> No se identificaron excepciones en la implementación actual.

### Módulos afectados
- `06_administracion_monitoreo`
- `05_historial_reportes`
- `07_gestion_academica`

### Entidades afectadas
- `aprendiz`
- `detalles_ingreso`
- `detalles_salida`

### Endpoints relacionados
- `DELETE /api/admin/aprendices/:id_aprendiz`
- `POST /api/historico/historialGeneral`

### Archivos relacionados
- [`DataBase/src/controllers/admin.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/controllers/admin.controller.ts)
- [`DataBase/src/controllers/history.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/controllers/history.controller.ts)

### Historias de usuario relacionadas
- `HU-ADM-008`, `HU-HIST-002`.

---

## RN-GEN-030

### Nombre
Protocolo de Doble Factor y Justificación para Anulación de Registros de Acceso

### Descripción
Para anular o corregir un registro de ingreso o salida, la operación está restringida al rol `ADMIN` y exige obligatoriamente:
1. Confirmación de identidad mediante el ingreso exacto del documento o nombre completo del aprendiz afectado (`verification`).
2. Registro de un motivo o justificación técnica de anulación de al menos 5 caracteres (`observation`).

### Motivo
Prevenir eliminaciones accidentales de registros de control de acceso válidos y mantener trazabilidad de auditoría de las intervenciones administrativas.

### Alcance
Módulo de administración y control de registros.

### Evidencia
- **Controlador**: [`DataBase/src/controllers/admin.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/controllers/admin.controller.ts#L60-L85).
- **Esquema Zod**: [`DataBase/src/schemas/admin.schema.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/schemas/admin.schema.ts#L107-L112) (`deleteRecordSchema`).
- **Vista Vue**: [`src/views/AdminRecordControlView.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/views/AdminRecordControlView.vue).

### Implementación
El endpoint `DELETE /api/admin/ingresos/:id` valida el esquema Zod y comprueba que la cadena de verificación coincida con el registro. Al procesar la anulación, ejecuta eliminación en cascada controlada de la salida y de los registros de máquinas vinculados a dicha sesión.

### Excepciones
> No se identificaron excepciones en la implementación actual.

### Módulos afectados
- `06_administracion_monitoreo`
- `02_control_ingreso`
- `03_control_salida`

### Entidades afectadas
- `detalles_ingreso`
- `detalles_salida`
- `detalles_maquinas`

### Endpoints relacionados
- `DELETE /api/admin/ingresos/:id`
- `DELETE /api/admin/salidas/:id`

### Archivos relacionados
- [`DataBase/src/controllers/admin.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/controllers/admin.controller.ts)
- [`src/views/AdminRecordControlView.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/views/AdminRecordControlView.vue)

### Historias de usuario relacionadas
- `HU-ADM-002`

---

# 9. Integridad Referencial y Políticas en Cascada

---

## RN-GEN-031

### Nombre
Políticas de Integridad Referencial y Acciones en Cascada en Base de Datos

### Descripción
El sistema define políticas determinísticas de integridad referencial para el manejo de relaciones en eliminación y actualización:
1. **`aprendiz_formacion` $\rightarrow$ `formaciones`**: `ON UPDATE CASCADE ON DELETE CASCADE`. La eliminación de una ficha formativa elimina automáticamente las matrículas asociadas a dicha ficha sin afectar a los aprendices.
2. **`detalles_ingreso` $\rightarrow$ `formaciones`**: `ON UPDATE CASCADE ON DELETE SET NULL`. La eliminación o cambio de una ficha formativa preserva los registros históricos de acceso estableciendo `id_formacion = NULL`.
3. **`horario_dia` $\rightarrow$ `horario`**: `ON DELETE CASCADE`. La eliminación de un horario remueve sus días asociados.
4. **`detalles_maquinas` $\rightarrow$ `detalles_ingreso`**: `ON DELETE CASCADE`. La anulación de un ingreso elimina las firmas de activos de esa sesión.
5. **`usuarios` $\rightarrow$ `roles`**: `RESTRICT` (por defecto). No se permite eliminar un rol mientras existan usuarios asociados.

### Motivo
Garantizar la consistencia estructural de la base de datos relacional PostgreSQL, evitando registros huérfanos y asegurando la supervivencia del historial de accesos.

### Alcance
Transversal a todas las entidades y módulos.

### Evidencia
- **Esquema de BD**: [`DataBase/schema/gedascBD.sql`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/schema/gedascBD.sql#L900-L1024).
- **Scripts de Configuración**: [`DataBase/alter_fk_cascade.js`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/alter_fk_cascade.js), [`DataBase/src/config/dbInit.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/config/dbInit.ts).

### Implementación
Implementado directamente a nivel de DDL en PostgreSQL con constraints de tipo `FOREIGN KEY ... ON UPDATE CASCADE ON DELETE CASCADE / SET NULL`.

### Excepciones
> No se identificaron excepciones en la implementación actual.

### Módulos afectados
- Todos los módulos.

### Entidades afectadas
- `formaciones`
- `aprendiz_formacion`
- `detalles_ingreso`
- `detalles_maquinas`
- `horario`
- `horario_dia`
- `usuarios`
- `roles`

### Endpoints relacionados
- Endpoints administrativos de eliminación y actualización (`/api/admin/*`).

### Archivos relacionados
- [`DataBase/schema/gedascBD.sql`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/schema/gedascBD.sql)
- [`DataBase/alter_fk_cascade.js`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/alter_fk_cascade.js)

### Historias de usuario relacionadas
- `HU-ADM-002`, `HU-ACAD-004`.

---

## RN-GEN-032

### Nombre
Validación Estricta y Sanitización en la Frontera de la API mediante Zod

### Descripción
Toda petición entrante que transporte datos en el cuerpo (`req.body`), parámetros de ruta (`req.params`) o parámetros de consulta (`req.query`) debe ser validada y tipificada mediante esquemas declarativos de **Zod** a través del middleware `validateRequest`. Las peticiones que contengan tipos incompatibles, longitudes inválidas o campos extraños son rechazadas con `HTTP 400 Bad Request` antes de alcanzar la capa de controladores o base de datos.

### Motivo
Blindar la API contra ataques de inyección, manipulación de tipos no controlados y datos truncados o inconsistentes.

### Alcance
Transversal a todos los endpoints del backend.

### Evidencia
- **Middleware**: [`DataBase/src/middlewares/validate.middleware.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/middlewares/validate.middleware.ts).
- **Directorio de Esquemas**: [`DataBase/src/schemas/`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/schemas/).
- **Rutas**: [`DataBase/src/routes/admin.routes.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/routes/admin.routes.ts), [`DataBase/src/routes/entry.routes.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/routes/entry.routes.ts), [`DataBase/src/routes/exit.routes.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/routes/exit.routes.ts).

### Implementación
El middleware `validateRequest({ body, params, query })` ejecuta `parseAsync`. Si ocurre un `ZodError`, formatea los errores en una respuesta JSON estructurada `{ success: false, message, errors: [{ field, message }] }` con status `400`.

### Excepciones
> No se identificaron excepciones en la implementación actual.

### Módulos afectados
- Todos los módulos.

### Entidades afectadas
- Todas las entidades del sistema.

### Endpoints relacionados
- Todos los endpoints de la API (`/api/*`).

### Archivos relacionados
- [`DataBase/src/middlewares/validate.middleware.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/middlewares/validate.middleware.ts)
- [`DataBase/src/schemas/admin.schema.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/schemas/admin.schema.ts)
- [`DataBase/src/schemas/auth.schema.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/schemas/auth.schema.ts)

### Historias de usuario relacionadas
- Regla transversal sin HU específica (Seguridad de infraestructura de API).

---

# 10. Consistencia e Invariantes Transversales entre Módulos

---

## RN-GEN-033

### Nombre
Invariante de Trazabilidad Transversal Extremo a Extremo

### Descripción
El flujo de operaciones en GEDASC debe mantener la coherencia y trazabilidad relacional completa a través de toda la cadena de valor:

$$\text{Centro (CTA)} \rightarrow \text{Programa} \rightarrow \text{Horario} \rightarrow \text{Formación (Ficha)} \rightarrow \text{Aprendiz} \rightarrow \text{Sesión (Ingreso)} \rightarrow \text{Activos (Doble Firma)} \rightarrow \text{Egreso (Salida)} \rightarrow \text{Historial / Analítica}$$

Ningún eslabón de la cadena puede ser omitido o quebrado durante la ejecución de las operaciones de control de acceso:
1. No puede existir una ficha sin programa ni horario.
2. No puede registrarse ingreso sin aprendiz activo.
3. No puede asignarse activo a una sesión inexistente.
4. No puede cerrarse la sesión sin verificar el retiro de los activos vinculados.
5. Los reportes y consultas históricas deben reflejar con fidelidad absoluta todos los metadatos generados a lo largo del flujo.

### Motivo
Garantizar la robustez funcional, la confiabilidad de las auditorías y la estandarización operativa del sistema de control de acceso en el Centro de Tecnología de la Amazonía.

### Alcance
Transversal a los 7 módulos del sistema.

### Evidencia
- **Documentación General**: [`documentacion/DOCUMENTACION_GENERAL.md`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/documentacion/DOCUMENTACION_GENERAL.md#L77-L104).
- **Esquema Relacional**: [`DataBase/schema/gedascBD.sql`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/schema/gedascBD.sql).
- **Flujos en Frontend**: [`src/router/index.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/router/index.ts).

### Implementación
La consistencia está blindada por la combinación simbiótica de:
- **Capa de BD**: Foreign keys con restricciones `RESTRICT` y `CASCADE` controladas, tipos de datos e índices relacionales.
- **Capa de Negocio (Backend)**: Validaciones en controladores, servicios dedicados y schemas Zod.
- **Capa de Interfaz (Frontend)**: Modales interactivos secuenciales, guardias de navegación en Vue Router y estado reactivo centralizado con Pinia.

### Excepciones
> No se identificaron excepciones en la implementación actual.

### Módulos afectados
- `01_autenticacion_acceso`
- `02_control_ingreso`
- `03_control_salida`
- `04_equipos_vehiculos`
- `05_historial_reportes`
- `06_administracion_monitoreo`
- `07_gestion_academica`

### Entidades afectadas
- `programa`
- `horario`
- `formaciones`
- `aprendiz`
- `aprendiz_formacion`
- `detalles_ingreso`
- `detalles_maquinas`
- `detalles_salida`
- `computadores`
- `vehiculos`
- `usuarios`

### Endpoints relacionados
- Todos los endpoints del sistema.

### Archivos relacionados
- [`documentacion/DOCUMENTACION_GENERAL.md`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/documentacion/DOCUMENTACION_GENERAL.md)
- [`DataBase/schema/gedascBD.sql`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/schema/gedascBD.sql)
- [`DataBase/src/index.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/src/index.ts)
- [`src/router/index.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/router/index.ts)

### Historias de usuario relacionadas
- Transversal a todas las Historias de Usuario (`HU-AUTH-001` a `HU-AUTH-004`, `HU-ING-001` a `HU-ING-009`, `HU-SAL-001` a `HU-SAL-006`, `HU-ACT-001` a `HU-ACT-007`, `HU-HIST-001` a `HU-HIST-004`, `HU-ADM-001` a `HU-ADM-009`, `HU-ACAD-001` a `HU-ACAD-006`).
