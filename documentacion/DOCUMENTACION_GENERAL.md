# Documentación General del Sistema — GEDASC

> **Gestión de Entradas y Salidas de Aprendices con Autenticación de Equipos y Doble Firma**  
> **Centro de Tecnología de la Amazonía (CTA)**  
> **Versión del Sistema**: 2.8 (Modular)

---

## 1. Visión General del Sistema

**GEDASC** es una solución integral de control de acceso físico, gestión de permanencia y trazabilidad de activos (computadores y vehículos) desarrollada para el **Centro de Tecnología de la Amazonía (CTA)**.

El sistema opera bajo un **modelo basado en sesiones dinámicas**, permitiendo gestionar ingresos múltiples diarios, clasificar actividades de aprendices monitores, verificar en tiempo real el cumplimiento de horarios curriculares mediante tolerancia horaria (±30 min), registrar justificaciones obligatorias para visitas extraordinarias y asegurar la cadena de custodia de equipos mediante un mecanismo de **doble firma digital** (ingreso y salida).

---

## 2. Mapa y Estructura de Documentación Modular

Toda la documentación técnica y funcional del sistema está organizada de forma modular y estandarizada dentro del directorio [`documentacion/modulos/`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/documentacion/modulos/). Cada módulo constituye una fuente de verdad autocontenida que incluye:
- **`README.md`**: Contexto técnico, arquitectura de endpoints, controllers y vistas.
- **`historias_usuario.md`**: Historias de usuario formales con criterios de aceptación y trazabilidad completa.
- **`reglas_negocio.md`**: Catálogo de reglas de negocio categorizadas por permisos, validaciones, flujos y restricciones.
- **`casos_uso.md`**: Casos de uso detallados para los flujos operativos complejos.

```text
documentacion/modulos/
├── 01_autenticacion_acceso/          # Control de sesión, JWT, roles RBAC y validador móvil
├── 02_control_ingreso/               # Escaneo de carné, ingreso manual, reingresos y horarios
├── 03_control_salida/                # Control de salidas, tiempos mínimos y firma de egreso
├── 04_equipos_vehiculos/             # Doble firma, detección de préstamos y concurrencia
├── 05_historial_reportes/            # Consultas cronológicas, filtros y exportación PDF/Excel
├── 06_administracion_monitoreo/      # Dashboard, corrección justificada, alertas y seguimiento
└── 07_gestion_academica/             # Programas curriculares, horarios y fichas de formación
```

---

## 3. Índice Detallado por Módulos

### 📌 [Módulo 01: Autenticación, Sesión y Control de Acceso](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/documentacion/modulos/01_autenticacion_acceso/README.md)
- **Historias de Usuario**: [`historias_usuario.md`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/documentacion/modulos/01_autenticacion_acceso/historias_usuario.md) (`HU-AUTH-001` a `HU-AUTH-004`).
- **Reglas de Negocio**: [`reglas_negocio.md`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/documentacion/modulos/01_autenticacion_acceso/reglas_negocio.md) (`RN-AUTH-001` a `RN-AUTH-007`).
- **Casos de Uso**: [`casos_uso.md`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/documentacion/modulos/01_autenticacion_acceso/casos_uso.md) (`CU-AUTH-01`, `CU-AUTH-02`).

### 📌 [Módulo 02: Control Operativo de Ingreso y Reingreso](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/documentacion/modulos/02_control_ingreso/README.md)
- **Historias de Usuario**: [`historias_usuario.md`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/documentacion/modulos/02_control_ingreso/historias_usuario.md) (`HU-ING-001` a `HU-ING-009`).
- **Reglas de Negocio**: [`reglas_negocio.md`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/documentacion/modulos/02_control_ingreso/reglas_negocio.md) (`RN-ING-001` a `RN-ING-011`).
- **Casos de Uso**: [`casos_uso.md`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/documentacion/modulos/02_control_ingreso/casos_uso.md) (`CU-ING-01`, `CU-ING-02`).

### 📌 [Módulo 03: Control Operativo de Salida de Aprendices](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/documentacion/modulos/03_control_salida/README.md)
- **Historias de Usuario**: [`historias_usuario.md`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/documentacion/modulos/03_control_salida/historias_usuario.md) (`HU-SAL-001` a `HU-SAL-005`).
- **Reglas de Negocio**: [`reglas_negocio.md`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/documentacion/modulos/03_control_salida/reglas_negocio.md) (`RN-SAL-001` a `RN-SAL-004`).
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
- **Historias de Usuario**: [`historias_usuario.md`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/documentacion/modulos/06_administracion_monitoreo/historias_usuario.md) (`HU-ADM-001` a `HU-ADM-006`).
- **Reglas de Negocio**: [`reglas_negocio.md`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/documentacion/modulos/06_administracion_monitoreo/reglas_negocio.md) (`RN-ADM-001` a `RN-ADM-005`).
- **Casos de Uso**: [`casos_uso.md`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/documentacion/modulos/06_administracion_monitoreo/casos_uso.md) (`CU-ADM-01`, `CU-ADM-02`).

### 📌 [Módulo 07: Gestión Curricular y Horarios Académicos](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/documentacion/modulos/07_gestion_academica/README.md)
- **Historias de Usuario**: [`historias_usuario.md`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/documentacion/modulos/07_gestion_academica/historias_usuario.md) (`HU-ACAD-001` a `HU-ACAD-005`).
- **Reglas de Negocio**: [`reglas_negocio.md`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/documentacion/modulos/07_gestion_academica/reglas_negocio.md) (`RN-ACAD-001` a `RN-ACAD-006`).
- **Casos de Uso**: [`casos_uso.md`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/documentacion/modulos/07_gestion_academica/casos_uso.md) (`CU-ACAD-01`, `CU-ACAD-02`).

---

## 4. Matriz de Trazabilidad Extremo a Extremo

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

---

## 5. Plan de Mantenimiento y Limpieza Documental

Con la consolidación de esta estructura modular:
1. Las fuentes anteriores (`requisitos.txt`, `requisitosFuncionales.txt`, `documentacion-v2.md`, etc.) quedan absorbidas e integradas al 100% en esta documentación modular.
2. Cada módulo es autónomo y sincronizado, permitiendo que cualquier nuevo requerimiento se incorpore directamente en su respectivo módulo sin generar duplicidades en la documentación general.
