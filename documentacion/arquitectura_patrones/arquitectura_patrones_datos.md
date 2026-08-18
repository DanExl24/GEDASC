# GEDASC — Arquitectura, Patrones de Ingeniería y Modelo de Datos

Este documento detalla la arquitectura de software, los patrones de ingeniería, la jerarquía de roles, los flujos técnicos críticos y las entidades fundamentales de la base de datos de **GEDASC** (*Gestión de Entradas y Salidas de Aprendices con Autenticación de Equipos y Doble Firma*), implementado para el **Centro de Tecnología de la Amazonía (CTA) — SENA Regional Caquetá**.

---

## Stack Tecnológico

### Arquitectura General

GEDASC implementa una arquitectura **Cliente-Servidor Desacoplada** basada en una Single Page Application (SPA) reactiva en el frontend, una API RESTful stateless con capacidades de comunicación bidireccional en tiempo real (WebSockets) en el backend, y un motor de base de datos relacional PostgreSQL con integridad referencial estricta.

```mermaid
graph TD
    subgraph CLIENTE["Capa de Presentación (Frontend SPA)"]
        UI_PC["Terminal Fija de Portería\n(Vue 3 + TailwindCSS + Pinia)"]
        UI_MOB["Validador Móvil / Tablet\n(Quagga2 + Signature Pad)"]
    end

    subgraph BACKEND["Capa de Servicios y API (Node.js / Express 5)"]
        GATEWAY["Express Router + CORS + Error Handling"]
        AUTH_GUARD["JWT Auth Guard + RBAC Middleware"]
        ZOD_VAL["Zod Validation Middleware"]
        WS_HUB["Socket.io Real-Time Hub"]
        
        subgraph SERVICES["Servicios de Dominio"]
            ENTRY_ENG["Entry / Exit Engine"]
            ASSET_SRV["Machine & Asset Custody Service"]
            ACAD_SRV["Curricular & Schedule Service"]
            TRACK_SRV["Attendance & Alert Engine"]
        end
    end

    subgraph PERSISTENCIA["Capa de Persistencia (PostgreSQL 18+)"]
        DB[(Base de Datos GEDASC)]
        TABLES["Esquema Relacional\n(aprendiz, formaciones, horario,\ndetalles_ingreso, detalles_maquinas,\ndetalles_salida, usuarios)"]
        INTEGRITY["Constraints (FK Cascade / Set Null, UNIQUE, CHECK)"]
    end

    UI_PC -->|HTTPS JSON REST| GATEWAY
    UI_MOB -->|HTTPS JSON REST| GATEWAY
    UI_PC <-->|WSS Socket.io| WS_HUB
    UI_MOB <-->|WSS Socket.io| WS_HUB

    GATEWAY --> AUTH_GUARD
    AUTH_GUARD --> ZOD_VAL
    ZOD_VAL --> SERVICES
    SERVICES -->|pg.Pool Consultas Parametrizadas| DB
    DB --- TABLES
    TABLES --- INTEGRITY
```

### Frontend

- **Framework:** Vue.js `3.5.x` (Composition API con sintaxis `<script setup lang="ts">`).
- **Lenguaje:** TypeScript `5.9.x` con tipado estricto y chequeo en compilación (`vue-tsc`).
- **Enrutamiento:** Vue Router `5.0.x` con Navigation Guards (`router.beforeEach`) para protección de rutas según roles RBAC.
- **Gestión de Estado:** Pinia `3.0.x` con stores modulares (`auth.store.ts`, estado reactivo de jornada y UI).
- **Diseño y Estilos:** TailwindCSS `3.3.x` con sistema utilitario optimizado para pantallas táctiles y escritorios de portería.
- **Captura Óptica y Biométrica:** Quagga2 `1.12.x` para lectura óptica de códigos de barras (Code 128 / EAN) y Signature Pad `5.1.x` sobre HTML5 Canvas para firmas manuscritas en Base64.
- **Build / Tooling:** Vite `6.x` con soporte HTTPS local mediante `@vitejs/plugin-basic-ssl` / `mkcert` y PostCSS.

### Backend

- **Entorno de Ejecución:** Node.js `>=20.19.0` (LTS recomendada).
- **Framework Web:** Express `5.2.x` con enrutamiento modular y middlewares asíncronos nativos.
- **Lenguaje:** TypeScript `5.9.x` transpilado con `tsc` y ejecutado en desarrollo con `ts-node-dev`.
- **Comunicación en Tiempo Real:** Socket.io `4.8.x` para enlace de terminales móviles y estaciones de portería.
- **Validación de Entradas:** Zod `4.4.x` con middleware declarativo `validateRequest({ body, params, query })`.
- **Acceso a Datos:** Driver nativo `pg` (node-postgres `8.18.x`) con connection pooling (`pg.Pool`) y consultas SQL parametrizadas (`$1, $2, ...`). Prisma `7.8.x` como referencia de esquema.
- **Base de Datos:** PostgreSQL `18.x` / `16.x` Relacional con soporte transaccional ACID y restricciones DDL.
- **Seguridad Criptográfica:** `bcryptjs` (10 salt rounds) para contraseñas y `jsonwebtoken` (JWT) con HMAC-SHA256 y vigencia de 24 horas (`1d`).
- **Servicios de Exportación:** `jspdf` / `jspdf-autotable` para PDF vectoriales y `xlsx (SheetJS)` para libros de cálculo.

---

## Jerarquía de Roles y Autenticación

El sistema implementa un modelo de **Control de Acceso Basado en Roles (RBAC)** desacoplado de las personas que son objeto de control (aprendices):

```mermaid
flowchart TD
    subgraph ROLES["Jerarquía RBAC del Sistema"]
        R_ADMIN["ADMIN (id_rol = 1)\nCoordinación / TI"]
        R_CELADOR["CELADOR (id_rol = 2)\nOperador de Portería"]
    end

    subgraph SUJETOS["Sujetos de Control (Sin Credenciales)"]
        S_APRENDIZ["APRENDIZ\n(Identificado por documento)"]
        S_MONITOR["APRENDIZ MONITOR\n(Flag es_monitor = true)"]
    end

    R_ADMIN -->|Gestión Total, Auditoría, Corrección, Horarios| R_CELADOR
    R_CELADOR -->|Control de Acceso, Escaneo, Firmas de Activos| S_APRENDIZ
    S_APRENDIZ --- S_MONITOR
```

### 1. Administrador del Sistema

- **Identificador:** `ADMIN` (`id_rol = 1`).
- **Responsabilidades:** Administración curricular (programas, fichas, horarios), creación y desvinculación masiva de aprendices desde Excel, monitoreo de alertas de ausentismo ($\ge 3\text{ días}$), analítica de aforo, creación de cuentas de celadores y anulación justificada de registros erróneos.
- **Permisos relevantes:** Acceso exclusivo a todas las rutas bajo `/api/admin/*` y vistas `/admin/*`. Capacidad de ejecutar bajas lógicas y anulación en cascada de registros.

### 2. Celador / Operador de Portería

- **Identificador:** `CELADOR` (`id_rol = 2`).
- **Responsabilidades:** Operación continua de puestos de control de acceso, escaneo de carnés, captura de firmas digitales de equipos y vehículos, registro de motivos de reingreso o visita extraordinaria, y consultas históricas en modalidad de solo lectura.
- **Permisos relevantes:** Acceso a `/api/registroIngresos/*`, `/api/registroSalidas/*`, `/api/validador/*` y `/api/historico/*`. Prohibido el acceso a configuraciones curriculares, borrado de registros o creación de usuarios.

### 3. Aprendiz / Portador de Activos (Sujeto de Control)

- **Identificador:** No posee credenciales de acceso al software (`usuarios`); se identifica mediante su documento de identidad único en la tabla `aprendiz`.
- **Responsabilidades:** Portar su carné con código de barras y estampar su firma digital manuscrita al ingresar y retirar activos.

---

## Esquema de Base de Datos y Entidades

El modelo relacional se organiza en cuatro dominios estructurales:

```mermaid
erDiagram
    ROLES ||--o{ USUARIOS : "define permisos"
    USUARIOS ||--o{ VALIDADORES_FIRMA : "vincula"
    
    PROGRAMA ||--|{ FORMACIONES : "contiene"
    HORARIO ||--|{ FORMACIONES : "asigna turno"
    HORARIO ||--|{ HORARIO_DIA : "dias habilitados"
    
    APRENDIZ ||--|{ APRENDIZ_FORMACION : "matricula"
    FORMACIONES ||--|{ APRENDIZ_FORMACION : "agrupa"
    
    APRENDIZ ||--|{ DETALLES_INGRESO : "origina acceso"
    FORMACIONES ||--o{ DETALLES_INGRESO : "asistencia"
    DETALLES_INGRESO ||--o| DETALLES_SALIDA : "completa ciclo"
    DETALLES_INGRESO ||--o{ DETALLES_MAQUINAS : "porta"
    
    APRENDIZ ||--o{ APRENDIZ_COMPUTADOR : "propietario"
    COMPUTADORES ||--o{ APRENDIZ_COMPUTADOR : "asignado"
    APRENDIZ ||--o{ APRENDIZ_VEHICULO : "propietario"
    VEHICULOS ||--o{ APRENDIZ_VEHICULO : "asignado"
    
    COMPUTADORES ||--o{ DETALLES_MAQUINAS : "custodia"
    VEHICULOS ||--o{ DETALLES_MAQUINAS : "custodia"
```

### 1. Dominio Académico y Curricular

- **`programa`**: Catálogo de diseños curriculares del SENA (`id_programa PK`, `nombre_programa UNIQUE`, `version`, `nivel`, `estado`).
- **`horario`**: Franjas horarias maestras (`id_horario PK`, `hora_inicio`, `hora_fin`, `jornada`).
- **`horario_dia`**: Días de funcionamiento normalizados (`id_horario FK`, `dia_semana PK`) con `ON DELETE CASCADE`.
- **`formaciones`**: Fichas académicas institucionales (`id_formacion PK`, `id_programa FK`, `id_horario FK`, `fecha_inicio`, `fecha_fin`, `estado`).
- **`aprendiz_formacion`**: Matrículas activas e históricas (`id PK`, `id_aprendiz FK`, `id_formacion FK`, `estado`) con constraint `UNIQUE(id_aprendiz, id_formacion)` y `ON DELETE CASCADE`.

### 2. Dominio de Control de Acceso y Sesiones

- **`aprendiz`**: Directorio maestro de aprendices (`id_aprendiz PK`, `documento UNIQUE`, `nombre`, `apellido`, `estado`, `es_monitor`).
- **`detalles_ingreso`**: Registro atómico de acceso (`id_ingreso PK`, `id_aprendiz FK`, `id_formacion FK`, `hora_ingreso`, `tipo_sesion`, `motivo_reingreso`, `motivo_visita`) con `FK id_formacion ON DELETE SET NULL`.
- **`detalles_salida`**: Cierre de sesión de permanencia (`id_salida PK`, `id_ingreso FK UNIQUE`, `hora_salida`, `motivo_salida_anticipada`) con `FK id_ingreso ON DELETE CASCADE`.

### 3. Dominio de Custodia de Activos y Equipos

- **`computadores`**: Catálogo de portátiles (`id_computador PK`, `serial UNIQUE`, `marca`, `activo`).
- **`vehiculos`**: Catálogo de vehículos (`id_vehiculo PK`, `tipo_vehiculo`, `placa`, `modelo`).
- **`aprendiz_computador`** y **`aprendiz_vehiculo`**: Vínculos de titularidad histórica y máquina principal.
- **`detalles_maquinas`**: Movimientos de activos por sesión (`id_detallemaquina PK`, `id_ingreso FK`, `id_computador FK`, `id_vehiculo FK`, `firma_ingreso TEXT NOT NULL`, `firma_salida TEXT`, `estado_equipo VARCHAR(20)`, `hora_retiro_equipo`) con `FK id_ingreso ON DELETE CASCADE`.

### 4. Dominio de Seguridad y Usuarios

- **`roles`**: Perfiles autorizados (`id_rol PK`, `nombre UNIQUE` $\rightarrow$ `'ADMIN'`, `'CELADOR'`).
- **`usuarios`**: Cuentas del personal (`id_usuario PK`, `nombre`, `email UNIQUE`, `password`, `id_rol FK`, `activo`, `ultimo_login`).
- **`validadores_firma`**: Dispositivos móviles vinculados (`id_validador PK`, `device_id UNIQUE`, `id_usuario FK`, `activo`, `ultimo_ping`).

---

## Modelo de Sesión Dinámica y Cadena de Custodia con Doble Firma

GEDASC implementa un patrón de **Sesión Dinámica Transaccional** combinado con una **Máquina de Estados Finita para Custodia de Activos**:

```mermaid
stateDiagram-v2
    [*] --> FueraDelCentro : Aprendiz en el exterior

    state "Acceso al Centro" as Ingreso {
        FueraDelCentro --> Verificacion : Escaneo de Carné
        Verificacion --> IngresoSimple : Sin Activos Portados
        Verificacion --> IngresoConActivo : Con PC / Vehículo
        IngresoConActivo --> CapturaFirmaEntrada : Serial / Placa + Firma
        CapturaFirmaEntrada --> SesionActiva : estado_equipo = 'dentro'
        IngresoSimple --> SesionActiva : detalles_ingreso creado
    }

    state "Permanencia en el Centro" as Permanencia {
        SesionActiva --> IntentoSalida : Escaneo en Portería (Toggle)
        IntentoSalida --> BloqueoPorActivo : ¿Tiene activos con estado 'dentro'?
        BloqueoPorActivo --> CapturaFirmaSalida : Obliga Firma de Retiro
        CapturaFirmaSalida --> SalidaPermitida : estado_equipo = 'retirado'
        IntentoSalida --> SalidaPermitida : No tiene activos retenidos
    }

    SalidaPermitida --> FueraDelCentro : INSERT detalles_salida (Sesión Cerrada)
```

### Fuentes de Verdad

1. **`detalles_ingreso` + `detalles_salida`**
   - **Propósito:** Determinar si un aprendiz se encuentra físicamente dentro de las instalaciones en el instante actual.
   - **Uso:** El estado de permanencia se calcula evaluando si existe un registro en `detalles_ingreso` para la fecha actual donde `detalles_salida.hora_salida IS NULL`.
   - **Restricciones:** Un aprendiz no puede tener más de una sesión abierta en el mismo instante (`RN-ING-004`).

2. **`detalles_maquinas`**
   - **Propósito:** Garantizar el valor probatorio de la cadena de custodia de equipos.
   - **Uso:** Valida la no concurrencia (`checkDuplicate.ts`), asienta la tenencia (`estado_equipo = 'dentro'`) e impide el egreso físico del aprendiz si el activo no ha sido firmado en salida (`RN-ACT-005`, `RN-SAL-003`).
   - **Restricciones:** `firma_ingreso` es obligatoria (`NOT NULL`). La firma de salida es requerida para transicionar a `'retirado'`.

### Ventajas de esta Arquitectura

- **Operación en 1 Solo Paso**: La misma terminal de escaneo opera ingresos y egresos sin exigir cambio manual de interfaz.
- **Cero Pérdidas de Custodia**: Imposibilidad física y lógica de que un aprendiz abandone la sede dejando un equipo registrado a su nombre sin firmar.
- **Inmutabilidad Probatoria**: Firmas rasterizadas en Base64 persistidas atómicamente en la base de datos relacional.

---

## Patrones y Decisiones de Ingeniería

### 1. Validación Declarativa en Frontera con Zod (`validateRequest`)

- **Problema:** Evitar que datos corruptos, cadenas maliciosas o tipos incongruentes alcancen la capa de servicios o provoquen errores no controlados en PostgreSQL.
- **Solución:** Middleware de orden superior `validateRequest({ body, params, query })` que ejecuta `parseAsync` contra esquemas tipificados en `DataBase/src/schemas/`.
- **Motivación:** Tipado estático en tiempo de desarrollo (`z.infer`) combinado con sanitización automática (`.trim()`, `.toLowerCase()`) y respuestas `HTTP 400 Bad Request` estandarizadas.

### 2. Connection Pooling y Consultas Parametrizadas Nativas

- **Problema:** En horas pico de portería, abrir y cerrar conexiones TCP por cada escaneo satura el motor de base de datos y degrada la latencia.
- **Solución:** Instancia única de `pg.Pool` compartida con consultas SQL parametrizadas (`$1, $2, ...`).
- **Motivación:** Soporte de alto rendimiento concurrente con tiempos de respuesta inferiores a $50\text{ ms}$ y protección contra inyección SQL.

### 3. Sincronización Reactiva Bidireccional con WebSockets (Socket.io)

- **Problema:** Necesidad de desacoplar la captura óptica y táctil (realizada en smartphones de los celadores en la fila) de la terminal fija de escritorio de portería.
- **Solución:** Servidor Socket.io montado sobre el servidor HTTP Express en el namespace `/validador`.
- **Motivación:** Permite despachar eventos `validator:scanned` y `validator:signature_saved` en milisegundos sin sobrecarga de sondeo HTTP (*polling*).

### 4. Algoritmo de Inferencia Temporal y Tolerancia Horaria

- **Problema:** Coordinar la asistencia lectiva con flexibilidad institucional ante llegadas tempranas y salidas ordenadas de talleres.
- **Solución:** Evaluación de intervalos temporales con margen de tolerancia de $\pm 30\text{ minutos}$ cruzando `horario_dia`, `horario` y la hora efectiva del servidor (o reloj simulado en pruebas).
- **Motivación:** Automatiza la imputación a la ficha formativa y exige justificaciones únicamente ante anomalías reales (visitas extraordinarias o reingresos).

---

## Flujos Técnicos Críticos

### Flujo 1: Ciclo Completo de Acceso Peatonal con Registro de Activo

```mermaid
sequenceDiagram
    autonumber
    actor C as Celador de Portería
    participant UI as GeneralEntryView.vue
    participant API as entry.controller.ts
    participant MACH as checksDuplicate / checksBorroweds
    participant DB as PostgreSQL (pg.Pool)

    C->>UI: Escanea carné del aprendiz
    UI->>API: GET /api/registroIngresos/verificarEntrada/:doc
    API->>DB: SELECT aprendiz, horario, sesion_abierta
    DB-->>API: Aprendiz activo, sin sesión abierta, en horario
    API-->>UI: Retorna datos de validación OK

    opt Aprendiz ingresa con Portátil
        UI->>C: Abre modal de captura de activo y firma
        C->>UI: Digita Serial y captura firma manuscrita
        UI->>API: POST /api/registroIngresos/ingresoMaquina/:id { serial, marca, firma }
        API->>MACH: checkDuplicate(serial)
        MACH->>DB: SELECT 1 FROM detalles_maquinas WHERE serial=$1 AND estado='dentro'
        DB-->>MACH: No duplicado
        API->>MACH: checksBorroweds(serial, id_aprendiz)
        MACH-->>API: Verifica si es equipo propio o préstamo
        API->>DB: INSERT INTO detalles_maquinas (firma_ingreso, estado_equipo='dentro')
        DB-->>API: Confirmado
    end

    UI->>API: POST /api/registroIngresos/addEntry/:doc { id_formacion, tipo_sesion }
    API->>DB: INSERT INTO detalles_ingreso (id_aprendiz, id_formacion, hora_ingreso)
    DB-->>API: Retorna id_ingreso creado
    API-->>UI: HTTP 201 Created (Ingreso Confirmado)
    UI->>C: Despliega notificación verde de acceso autorizado
```

### Flujo 2: Validador Móvil en Tiempo Real mediante WebSockets

```mermaid
sequenceDiagram
    autonumber
    actor C_MOB as Celador en Fila (Móvil)
    participant MOB as MobileValidatorView.vue
    participant WS as Socket.io Server (Node.js)
    participant DESK as GeneralEntryView.vue (PC Portería)
    participant API as validator.controller.ts

    C_MOB->>MOB: Abre validador en smartphone
    MOB->>API: POST /api/validador/vincular { device_id, nombre }
    API-->>MOB: HTTP 200 OK (Dispositivo Vinculado)
    
    MOB->>WS: Handshake WebSocket (join room 'validator')
    DESK->>WS: Handshake WebSocket (join room 'validator')

    C_MOB->>MOB: Apunta cámara al código de barras del carné
    MOB->>MOB: Quagga2 decodifica código de barras
    MOB->>WS: socket.emit('validator:scanned', { documento: '1075254123' })
    WS->>DESK: socket.emit('validator:scanned', payload)
    DESK->>DESK: Auto-completa campo documento e inicia verificación

    C_MOB->>MOB: Solicita firma táctil en pantalla del móvil
    MOB->>WS: socket.emit('validator:signature_saved', { firma: 'data:image/png;base64,...' })
    WS->>DESK: socket.emit('validator:signature_saved', payload)
    DESK->>DESK: Inyecta firma Base64 en el formulario de portería
```

### Flujo 3: Anulación Justificada de Registros con Eliminación en Cascada

```mermaid
sequenceDiagram
    autonumber
    actor A as Administrador
    participant UI as AdminRecordControlView.vue
    participant API as admin.controller.ts
    participant DB as PostgreSQL

    A->>UI: Selecciona registro erróneo a anular
    UI->>A: Solicita reconfirmación de documento y motivo (>= 5 caracteres)
    A->>UI: Ingresa documento exacto y motivo técnico
    UI->>API: DELETE /api/admin/ingresos/:id { verification, observation, date }
    API->>API: Zod validateRequest(deleteRecordSchema)
    API->>DB: SELECT id_aprendiz, documento FROM detalles_ingreso JOIN aprendiz USING(id_aprendiz) WHERE id_ingreso=$1
    
    alt Documento no coincide con la verificación
        API-->>UI: HTTP 400 Bad Request ("El documento de verificación no coincide")
    else Documento verificado
        API->>DB: BEGIN TRANSACTION
        API->>DB: DELETE FROM detalles_salida WHERE id_ingreso = $1
        API->>DB: DELETE FROM detalles_maquinas WHERE id_ingreso = $1
        API->>DB: DELETE FROM detalles_ingreso WHERE id_ingreso = $1
        API->>DB: COMMIT TRANSACTION
        API-->>UI: HTTP 200 OK ("Registro anulado exitosamente con auditoría")
        UI->>A: Actualiza la tabla y muestra confirmación
    end
```

---

## Mapa de Módulos y Referencias de Ingeniería

| # | Módulo | Componente Principal (Frontend) | Controlador / Servicio Backend | Esquema / Entidad BD | Documentación Técnica |
| :-: | :--- | :--- | :--- | :--- | :--- |
| **01** | Autenticación y Acceso | `LoginView.vue`, `MobileValidatorView.vue` | `auth.controller.ts`, `validator.controller.ts` | `usuarios`, `roles`, `validadores_firma` | [`01_autenticacion_acceso`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/documentacion/modulos/01_autenticacion_acceso/README.md) |
| **02** | Control de Ingreso | `GeneralEntryView.vue`, `ModalScanEntry.vue` | `entry.controller.ts`, `jornada.controller.ts` | `detalles_ingreso`, `aprendiz`, `horario` | [`02_control_ingreso`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/documentacion/modulos/02_control_ingreso/README.md) |
| **03** | Control de Salida | `GeneralExitView.vue`, `ModalEarlyExitReason.vue` | `exit.controller.ts` | `detalles_salida`, `detalles_ingreso` | [`03_control_salida`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/documentacion/modulos/03_control_salida/README.md) |
| **04** | Equipos y Vehículos | `SignaturePad.vue`, `ModalRegisterMachine.vue` | `computer.controller.ts`, `vehicle.controller.ts`, `checksDuplicate.ts` | `computadores`, `vehiculos`, `detalles_maquinas` | [`04_equipos_vehiculos`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/documentacion/modulos/04_equipos_vehiculos/README.md) |
| **05** | Historial y Reportes | `HistoryView.vue`, `usePdfExport.ts` | `history.controller.ts` | Vistas SQL parametrizadas con `JOIN` | [`05_historial_reportes`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/documentacion/modulos/05_historial_reportes/README.md) |
| **06** | Administración y Monitoreo | `AdminAlertsView.vue`, `AdminRecordControlView.vue` | `admin.controller.ts`, `stats.controller.ts` | `usuarios`, `aprendiz`, agregaciones | [`06_administracion_monitoreo`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/documentacion/modulos/06_administracion_monitoreo/README.md) |
| **07** | Gestión Curricular | `AdminHorariosView.vue`, `ModalImportAprendicesMasivo.vue` | `admin.controller.ts` (Formaciones/Horarios) | `programa`, `formaciones`, `horario`, `horario_dia` | [`07_gestion_academica`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/documentacion/modulos/07_gestion_academica/README.md) |

---

## Documentación Conexa

- 🧠 **Base de Conocimiento del Sistema:** [`documentacion/base_conocimiento/conocimiento_sistema.md`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/documentacion/base_conocimiento/conocimiento_sistema.md)
- 🏛️ **Documento Técnico Integral:** [`documentacion/tecnico_integral/documento_tecnico_integral.md`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/documentacion/tecnico_integral/documento_tecnico_integral.md)
- ⚙️ **Documento Técnico Maestro Modular:** [`documentacion/tecnico_maestro/documento_tecnico_maestro.md`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/documentacion/tecnico_maestro/documento_tecnico_maestro.md)
- 📋 **Documento Funcional Maestro Modular:** [`documentacion/funcional_maestro/documento_funcional_maestro.md`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/documentacion/funcional_maestro/documento_funcional_maestro.md)
- 📜 **Reglas de Negocio Generales y Transversales:** [`documentacion/reglas_generales/reglas_negocio_generales.md`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/documentacion/reglas_generales/reglas_negocio_generales.md)
- 🗺️ **Portal e Índice Maestro de Documentación:** [`documentacion/DOCUMENTACION_GENERAL.md`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/documentacion/DOCUMENTACION_GENERAL.md)
- 🗄️ **DDL Maestro de Base de Datos:** [`DataBase/schema/gedascBD.sql`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/DataBase/schema/gedascBD.sql)
- 🚀 **Repositorio Oficial de Código Fuente:** `https://github.com/DanExl24/GEDASC.git` (Rama `GEDASC-V2`)
