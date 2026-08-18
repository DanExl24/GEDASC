# Documentación General del Sistema — GEDASC

> **Gestión de Entradas y Salidas de Aprendices con Autenticación de Equipos y Doble Firma**  
> **Centro de Tecnología de la Amazonía (CTA) — SENA Regional Caquetá**  
> **Versión del Sistema**: 2.8 (Modular y Transversal)

---

## 1. Visión General del Sistema

**GEDASC** es una solución integral de control de acceso físico, gestión de permanencia y trazabilidad de activos (computadores y vehículos) desarrollada para el **Centro de Tecnología de la Amazonía (CTA)**.

El sistema opera bajo un **modelo basado en sesiones dinámicas**, permitiendo gestionar ingresos múltiples diarios, clasificar actividades de aprendices monitores, verificar en tiempo real el cumplimiento de horarios curriculares mediante tolerancia horaria ($\pm 30\text{ min}$), registrar justificaciones obligatorias para visitas extraordinarias y asegurar la cadena de custodia de equipos mediante un mecanismo de **doble firma digital** (ingreso y salida).

---

## 2. Mapa Maestro de Documentación del Sistema

Toda la documentación técnica, funcional y de arquitectura está categorizada de forma modular y estandarizada en carpetas dedicadas dentro de [`documentacion/`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/documentacion/):

```text
documentacion/
├── DOCUMENTACION_GENERAL.md          # Portal e Índice Maestro del Sistema
├── base_conocimiento/                # Base de Conocimiento, Dominio y ADRs
│   └── conocimiento_sistema.md
├── arquitectura_patrones/            # Arquitectura, Patrones de Ingeniería y Modelo de Datos
│   └── arquitectura_patrones_datos.md
├── dic/                              # Diccionario de Datos Oficial de la Base de Datos
│   └── diccionario_datos.md
├── tecnico_integral/                 # Documento Técnico Integral y Arquitectura Global
│   └── documento_tecnico_integral.md
├── tecnico_maestro/                  # Especificación Técnica Profunda de los 7 Módulos
│   └── documento_tecnico_maestro.md
├── funcional_maestro/                # Especificación Funcional, Procesos y Casos de Uso
│   └── documento_funcional_maestro.md
├── reglas_generales/                 # Catálogo Maestro de Reglas de Negocio Transversales
│   └── reglas_negocio_generales.md
└── modulos/                          # Documentación Modular Autocontenida
    ├── 01_autenticacion_acceso/      # Control de sesión, JWT, roles RBAC y validador móvil
    ├── 02_control_ingreso/           # Escaneo de carné, ingreso manual, reingresos y horarios
    ├── 03_control_salida/            # Control de salidas, tiempos mínimos y firma de egreso
    ├── 04_equipos_vehiculos/         # Doble firma, detección de préstamos y concurrencia
    ├── 05_historial_reportes/        # Consultas cronológicas, filtros y exportación PDF/Excel
    ├── 06_administracion_monitoreo/  # Dashboard, corrección justificada, alertas y seguimiento
    └── 07_gestion_academica/         # Programas curriculares, horarios y fichas de formación
```

---

## 3. Documentos Maestros del Sistema

| Documento Maestro | Carpeta / Archivo | Propósito y Contenido |
| :--- | :--- | :--- |
| 🧠 **Base de Conocimiento** | [`base_conocimiento/conocimiento_sistema.md`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/documentacion/base_conocimiento/conocimiento_sistema.md) | Visión del negocio, dominio SENA/CTA, 9 Decisiones Arquitectónicas (ADRs), stack tecnológico y guía de onboarding para nuevos desarrolladores. |
| 📐 **Arquitectura y Patrones** | [`arquitectura_patrones/arquitectura_patrones_datos.md`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/documentacion/arquitectura_patrones/arquitectura_patrones_datos.md) | Arquitectura técnica, patrones de ingeniería (Zod, Sockets, pg.Pool), jerarquía RBAC, modelo relacional ERD y flujos técnicos críticos. |
| 🗄️ **Diccionario de Datos** | [`dic/diccionario_datos.md`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/documentacion/dic/diccionario_datos.md) | Catálogo oficial de las 16 tablas de PostgreSQL, campos, tipos, restricciones PK/FK/UK, índices B-Tree, enumeraciones y reglas en BD. |
| 🏛️ **Documento Técnico Integral** | [`tecnico_integral/documento_tecnico_integral.md`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/documentacion/tecnico_integral/documento_tecnico_integral.md) | Arquitectura global, capas, diagramas Mermaid de arquitectura, modelo ERD completo, seguridad RBAC/JWT e infraestructura de despliegue. |
| ⚙️ **Documento Técnico Maestro** | [`tecnico_maestro/documento_tecnico_maestro.md`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/documentacion/tecnico_maestro/documento_tecnico_maestro.md) | Detalle técnico profundo de los 7 módulos: controladores, esquemas Zod, endpoints, payloads JSON, queries SQL parametrizadas y WebSockets. |
| 📋 **Documento Funcional Maestro** | [`funcional_maestro/documento_funcional_maestro.md`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/documentacion/funcional_maestro/documento_funcional_maestro.md) | Comportamiento del sistema, casos de uso (`CU`), historias de usuario (`HU`), diagramas de secuencia funcionales y matrices de trazabilidad. |
| 📜 **Reglas de Negocio Generales** | [`reglas_generales/reglas_negocio_generales.md`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/documentacion/reglas_generales/reglas_negocio_generales.md) | Catálogo de las 33 invariantes y políticas transversales (`RN-GEN-001` a `RN-GEN-033`) en 10 categorías estructurales. |

---

## 4. Índice Detallado por Módulos Funcionales

### 📌 [Módulo 01: Autenticación, Sesión y Control de Acceso](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/documentacion/modulos/01_autenticacion_acceso/README.md)
- **Historias de Usuario**: [`historias_usuario.md`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/documentacion/modulos/01_autenticacion_acceso/historias_usuario.md) (`HU-AUTH-001` a `HU-AUTH-004`).
- **Reglas de Negocio**: [`reglas_negocio.md`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/documentacion/modulos/01_autenticacion_acceso/reglas_negocio.md) (`RN-AUTH-001` a `RN-AUTH-007`).
- **Casos de Uso**: [`casos_uso.md`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/documentacion/modulos/01_autenticacion_acceso/casos_uso.md) (`CU-AUTH-01`, `CU-AUTH-02`).

### 📌 [Módulo 02: Control Operativo de Ingreso y Reingreso](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/documentacion/modulos/02_control_ingreso/README.md)
- **Historias de Usuario**: [`historias_usuario.md`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/documentacion/modulos/02_control_ingreso/historias_usuario.md) (`HU-ING-001` a `HU-ING-009`).
- **Reglas de Negocio**: [`reglas_negocio.md`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/documentacion/modulos/02_control_ingreso/reglas_negocio.md) (`RN-ING-001` a `RN-ING-011`).
- **Casos de Uso**: [`casos_uso.md`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/documentacion/modulos/02_control_ingreso/casos_uso.md) (`CU-ING-01`, `CU-ING-02`).

### 📌 [Módulo 03: Control Operativo de Salida de Aprendices](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/documentacion/modulos/03_control_salida/README.md)
- **Historias de Usuario**: [`historias_usuario.md`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/documentacion/modulos/03_control_salida/historias_usuario.md) (`HU-SAL-001` a `HU-SAL-006`).
- **Reglas de Negocio**: [`reglas_negocio.md`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/documentacion/modulos/03_control_salida/reglas_negocio.md) (`RN-SAL-001` a `RN-SAL-005`).
- **Casos de Uso**: [`casos_uso.md`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/documentacion/modulos/03_control_salida/casos_uso.md) (`CU-SAL-01`, `CU-SAL-02`).

### 📌 [Módulo 04: Gestión de Equipos de Cómputo y Vehículos](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/documentacion/modulos/04_equipos_vehiculos/README.md)
- **Historias de Usuario**: [`historias_usuario.md`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/documentacion/modulos/04_equipos_vehiculos/historias_usuario.md) (`HU-ACT-001` a `HU-ACT-007`).
- **Reglas de Negocio**: [`reglas_negocio.md`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/documentacion/modulos/04_equipos_vehiculos/reglas_negocio.md) (`RN-ACT-001` a `RN-ACT-007`).
- **Casos de Uso**: [`casos_uso.md`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/documentacion/modulos/04_equipos_vehiculos/casos_uso.md) (`CU-ACT-01`, `CU-ACT-02`).

### 📌 [Módulo 05: Historial y Reportes Exportables](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/documentacion/modulos/05_historial_reportes/README.md)
- **Historias de Usuario**: [`historias_usuario.md`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/documentacion/modulos/05_historial_reportes/historias_usuario.md) (`HU-HIST-001` a `HU-HIST-004`).
- **Reglas de Negocio**: [`reglas_negocio.md`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/documentacion/modulos/05_historial_reportes/reglas_negocio.md) (`RN-HIST-001` a `RN-HIST-004`).
- **Casos de Uso**: [`casos_uso.md`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/documentacion/modulos/05_historial_reportes/casos_uso.md) (`CU-HIST-01`).

### 📌 [Módulo 06: Administración, Monitoreo y Alertas](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/documentacion/modulos/06_administracion_monitoreo/README.md)
- **Historias de Usuario**: [`historias_usuario.md`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/documentacion/modulos/06_administracion_monitoreo/historias_usuario.md) (`HU-ADM-001` a `HU-ADM-007`).
- **Reglas de Negocio**: [`reglas_negocio.md`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/documentacion/modulos/06_administracion_monitoreo/reglas_negocio.md) (`RN-ADM-001` a `RN-ADM-006`).
- **Casos de Uso**: [`casos_uso.md`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/documentacion/modulos/06_administracion_monitoreo/casos_uso.md) (`CU-ADM-01`, `CU-ADM-02`).

### 📌 [Módulo 07: Gestión Curricular y Horarios Académicos](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/documentacion/modulos/07_gestion_academica/README.md)
- **Historias de Usuario**: [`historias_usuario.md`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/documentacion/modulos/07_gestion_academica/historias_usuario.md) (`HU-ACAD-001` a `HU-ACAD-005`).
- **Reglas de Negocio**: [`reglas_negocio.md`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/documentacion/modulos/07_gestion_academica/reglas_negocio.md) (`RN-ACAD-001` a `RN-ACAD-006`).
- **Casos de Uso**: [`casos_uso.md`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/documentacion/modulos/07_gestion_academica/casos_uso.md) (`CU-ACAD-01`, `CU-ACAD-02`).

---

## 5. Matriz de Trazabilidad Extremo a Extremo

```text
┌─────────────────────────┐
│   Historia de Usuario   │  (Ej: HU-ING-001)
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│    Regla de Negocio     │  (Ej: RN-ING-001, RN-ING-007)
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│   Endpoint de la API    │  (Ej: POST /api/registroIngresos/addEntry/:doc)
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ Controller / Service BD │  (Ej: entry.controller.ts -> AddEntry)
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│    Vista / Componente   │  (Ej: GeneralEntryView.vue -> ModalScanEntry.vue)
└─────────────────────────┘
```
