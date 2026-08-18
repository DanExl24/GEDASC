# Módulo 05: Historial y Reportes Exportables

## 1. Descripción General

El **Módulo de Historial y Reportes Exportables** proporciona las capacidades de consulta cronológica, trazabilidad operativa y generación de documentos oficiales (PDF y Excel) del sistema **GEDASC**. Permite a celadores y administradores auditar todos los accesos de aprendices y movimientos de equipos registrados en el **Centro de Tecnología de la Amazonía (CTA)**.

Dispone de:
- **Consulta Histórica Multicriterio**: Filtrado por rangos de fecha preestablecidos o personalizados, programas curriculares y términos de búsqueda textual.
- **Detalle de Sesión Avanzado**: Visualización modal de todos los metadatos de una sesión (horas de permanencia, motivo de reingreso, motivo de visita, tipo de sesión, activos vinculados).
- **Centro de Reportes Dinámico**: Generación y descarga de 4 tipos de informes parametrizables:
  1. *Reporte de Ingresos*
  2. *Reporte de Salidas*
  3. *Registro Histórico Consolidado*
  4. *Reporte de Activos (Computadores y Vehículos)*
- **Exportación en Doble Formato**: Generación estructurada en formato PDF institucional y hojas de cálculo de Excel (`.xlsx`).

---

## 2. Arquitectura y Componentes del Módulo

### 2.1 Backend (Node.js / Express / TypeScript)
- **Rutas**: [`database/src/routes/history.routes.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/routes/history.routes.ts), [`database/src/routes/stats.routes.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/routes/stats.routes.ts)
- **Controladores**: [`database/src/controllers/history.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/controllers/history.controller.ts), [`database/src/controllers/stats.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/controllers/stats.controller.ts)
- **Base de Datos**: Tablas `detalles_ingreso`, `detalles_salida`, `aprendiz`, `formaciones`, `programa`, `detalles_maquinas`.

### 2.2 Frontend (Vue 3 / TypeScript / Pinia)
- **Vistas**: [`src/views/HistoryView.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/views/HistoryView.vue), [`src/views/RecordHistory.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/views/RecordHistory.vue)
- **Composables y Servicios**:
  - [`src/composables/History/useHistoryFilters.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/composables/History/useHistoryFilters.ts)
  - [`src/composables/History/useRecordReport.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/composables/History/useRecordReport.ts)
  - [`src/composables/History/useHistoryMachineDetail.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/composables/History/useHistoryMachineDetail.ts)
  - [`src/Services/exports/usePdfExport.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/Services/exports/usePdfExport.ts)
- **Componentes y Modales**:
  - [`src/components/AprendizUI/HistoryAprendizTable.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/components/AprendizUI/HistoryAprendizTable.vue)
  - [`src/components/AprendizUI/Modals/ModalHistoryMachineDetails.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/components/AprendizUI/Modals/ModalHistoryMachineDetails.vue)

---

## 3. Endpoints del Módulo

| Método | Endpoint | Descripción | Roles Permitidos |
|---|---|---|---|
| `GET` | `/api/historico/historial` | Consulta general del historial de movimientos de aprendices | `CELADOR`, `ADMIN` |
| `POST` | `/api/historico/historialGeneral` | Consulta avanzada con filtros combinados (fecha, programa, búsqueda) | `CELADOR`, `ADMIN` |
| `POST` | `/api/historico/historialMaquinas` | Consulta de movimientos históricos con activos asociados | `CELADOR`, `ADMIN` |
| `GET` | `/api/historico/historialFechas` | Consulta de registros filtrados por rango de fechas | `CELADOR`, `ADMIN` |
| `GET` | `/api/historico/opcionesFiltros` | Obtiene el catálogo de programas y fichas activas para poblar selectores | `CELADOR`, `ADMIN` |
| `GET` | `/api/historico/historialMaquinas/:id_detallemaquina` | Obtiene el detalle técnico y firmas del activo asociado | `CELADOR`, `ADMIN` |
| `GET` | `/api/estadisticas/stats` | Obtiene contadores y métricas agregadas de asistencia | `CELADOR`, `ADMIN` |

---

## 4. Estructura de Documentación del Módulo

- [`historias_usuario.md`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/documentacion/modulos/05_historial_reportes/historias_usuario.md): Historias de usuario completas con criterios de aceptación y trazabilidad.
- [`reglas_negocio.md`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/documentacion/modulos/05_historial_reportes/reglas_negocio.md): Catálogo de reglas de consulta, integridad histórica y exportaciones.
- [`casos_uso.md`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/documentacion/modulos/05_historial_reportes/casos_uso.md): Casos de uso de generación y exportación de reportes institucionales.
