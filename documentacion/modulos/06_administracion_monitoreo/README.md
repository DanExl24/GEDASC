# Módulo 06: Administración, Monitoreo y Alertas

## 1. Descripción General

El **Módulo de Administración, Monitoreo y Alertas** es el centro de control táctico y estratégico del sistema **GEDASC**, de acceso exclusivo para usuarios con rol `ADMIN`. Centraliza las métricas operativas globales del **Centro de Tecnología de la Amazonía (CTA)**, la auditoría y corrección controlada de registros, la supervisión de activos en calidad de préstamo, el seguimiento de inasistencias y la administración del perfil académico de los aprendices.

Sus pilares funcionales son:
- **Dashboard Gerencial**: Estadísticas en tiempo real (ingresos del día, mes, trimestre y año; últimos 4 movimientos y gráficas de afluencia).
- **Corrección de Registros**: Eliminación controlada y auditada de ingresos o salidas con verificación de identidad y motivo explícito.
- **Monitoreo de Máquinas Prestadas**: Trazabilidad de computadores y vehículos en uso por aprendices distintos a su propietario original con indicador de tiempo transcurrido.
- **Aprendices y Actividad**: Supervisión de sesiones acumuladas, horas de permanencia y filtro por días consecutivos sin asistir.
- **Centro de Alertas**: Notificación temprana de inasistencia prolongada (3 o más días sin registro) y préstamos no programados.
- **Panel de Asociaciones**: Gestión de la designación de Monitores y asignación multiformación.

---

## 2. Arquitectura y Componentes del Módulo

### 2.1 Backend (Node.js / Express / TypeScript)
- **Rutas**: [`database/src/routes/admin.routes.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/routes/admin.routes.ts), [`database/src/routes/stats.routes.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/routes/stats.routes.ts)
- **Controladores**: [`database/src/controllers/admin.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/controllers/admin.controller.ts), [`database/src/controllers/stats.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/controllers/stats.controller.ts)
- **Middlewares**: [`database/src/middlewares/admin.middleware.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/middlewares/admin.middleware.ts) (`authMiddleware`, `requireRole(['ADMIN'])`)
- **Base de Datos**: Tablas `aprendiz`, `detalles_ingreso`, `detalles_salida`, `aprendiz_formacion`, `computadores_prestados`, `vehiculos_prestados`.

### 2.2 Frontend (Vue 3 / TypeScript / Pinia)
- **Vistas**:
  - [`src/views/DashboardView.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/views/DashboardView.vue)
  - [`src/views/AdminRecordControlView.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/views/AdminRecordControlView.vue)
  - [`src/views/AdminBorrowedAssetsView.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/views/AdminBorrowedAssetsView.vue)
  - [`src/views/AdminAprendicesView.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/views/AdminAprendicesView.vue)
  - [`src/views/AdminAlertsView.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/views/AdminAlertsView.vue)
- **Modales Administrativos**:
  - `ModalDeleteEntry.vue` / `ModalDeleteExit.vue` (Eliminación justificada de registros)
  - [`src/components/AprendizUI/Modals/ModalAsociaciones.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/components/AprendizUI/Modals/ModalAsociaciones.vue) (Gestión de monitores y fichas)
  - [`src/components/AprendizUI/Modals/ModalMachineDetails.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/components/AprendizUI/Modals/ModalMachineDetails.vue) (Inspección de activos del aprendiz)

---

## 3. Endpoints del Módulo

| Método | Endpoint | Descripción | Roles Permitidos |
|---|---|---|---|
| `GET` | `/api/admin/aprendices` | Consulta listado consolidado de aprendices con horas acumuladas y días sin asistir | `ADMIN` |
| `POST` | `/api/admin/aprendices/toggleMonitor/:id_aprendiz` | Activa o desactiva la condición de monitor del aprendiz | `ADMIN` |
| `GET` | `/api/admin/aprendices/:id_aprendiz/formaciones` | Obtiene todas las fichas vinculadas al aprendiz con sus estados | `ADMIN` |
| `POST` | `/api/admin/aprendices/:id_aprendiz/formaciones` | Asigna una nueva ficha de formación al aprendiz | `ADMIN` |
| `DELETE` | `/api/admin/aprendices/:id_aprendiz/formaciones/:id_formacion` | Desvincula una ficha de formación del aprendiz | `ADMIN` |
| `GET` | `/api/admin/ingresos` | Consulta movimientos administrativos de acceso con estado (Completo / Pendiente) | `ADMIN` |
| `DELETE` | `/api/admin/ingresos/:id` | Elimina un registro de ingreso previa verificación de motivo y documento | `ADMIN` |
| `DELETE` | `/api/admin/salidas/:id` | Elimina un registro de salida previa verificación de motivo y documento | `ADMIN` |
| `GET` | `/api/admin/borrowed/computers` | Lista computadores registrados en calidad de préstamo | `ADMIN` |
| `GET` | `/api/admin/borrowed/vehicles` | Lista vehículos registrados en calidad de préstamo | `ADMIN` |
| `GET` | `/api/admin/track` | Consulta alertas activas (inasistencia >= 3 días y préstamos) | `ADMIN` |
| `GET` | `/api/admin/statsQuarter` | Retorna métricas agregadas por trimestre del año | `ADMIN` |
| `GET` | `/api/admin/statsYear` | Retorna total consolidado de aprendices atendidos en el año | `ADMIN` |

---

## 4. Estructura de Documentación del Módulo

- [`historias_usuario.md`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/documentacion/modulos/06_administracion_monitoreo/historias_usuario.md): Historias de usuario completas con criterios de aceptación y trazabilidad.
- [`reglas_negocio.md`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/documentacion/modulos/06_administracion_monitoreo/reglas_negocio.md): Catálogo de reglas de auditoría, eliminación, umbrales de alerta y monitores.
- [`casos_uso.md`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/documentacion/modulos/06_administracion_monitoreo/casos_uso.md): Casos de uso de corrección de registros, panel de alertas y gestión de asociaciones.
