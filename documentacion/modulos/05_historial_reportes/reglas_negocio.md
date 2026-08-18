# Reglas de Negocio — Módulo 05: Historial y Reportes Exportables

---

## 1. Permisos y Alcance de Visualización

### RN-HIST-001: Modo Solo Lectura para Operadores (Celadores)
- **Descripción**: La consulta histórica de movimientos y activos en el módulo de Historial opera estrictamente en modalidad de solo lectura para el rol `CELADOR`. No se permite editar, anular ni eliminar registros históricos desde esta interfaz.
- **Motivo**: Preservar la integridad y no repudio de la información histórica registrada en portería.
- **Módulos afectados**: `05_historial_reportes`, `06_administracion_monitoreo`.
- **Archivos donde se implementa**: [`src/views/HistoryView.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/views/HistoryView.vue), [`database/src/controllers/history.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/controllers/history.controller.ts).
- **Endpoints relacionados**: `GET /api/historico/historial`.
- **Historias de usuario relacionadas**: `HU-HIST-001`.

---

## 2. Integridad y Construcción de Consultas

### RN-HIST-002: Inmutabilidad e Integridad de la Información Histórica
- **Descripción**: Las consultas históricas deben reflejar el estado y metadatos vigentes en el instante exacto en que ocurrió la sesión (programa, jornada, motivo de visita, firmas). Los cambios futuros en la ficha académica del aprendiz no deben alterar la formación histórica asentada en la tupla de `detalles_ingreso`.
- **Motivo**: Garantizar fidelidad histórica y auditoría forense precisa.
- **Módulos afectados**: `05_historial_reportes`, `07_gestion_academica`.
- **Archivos donde se implementa**: [`database/src/controllers/history.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/controllers/history.controller.ts#L30-L90).
- **Endpoints relacionados**: `POST /api/historico/historialGeneral`, `GET /api/historico/historialMaquinas/:id_detallemaquina`.
- **Historias de usuario relacionadas**: `HU-HIST-001`, `HU-HIST-003`.

---

## 3. Generación y Exportación de Reportes

### RN-HIST-003: Estándar y Estructura de Exportación PDF/Excel
- **Descripción**: Todo reporte exportado debe incluir: Encabezado institucional con nombre del sistema y centro, tipo de reporte, rango de fechas aplicado, fecha y hora exacta de generación, usuario que emitió el informe, listado tabular ordenado y totales o métricas de conteo al pie del documento.
- **Motivo**: Cumplir con los requerimientos formales de presentación y auditoría institucional.
- **Módulos afectados**: `05_historial_reportes`.
- **Archivos donde se implementa**: [`src/Services/exports/usePdfExport.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/Services/exports/usePdfExport.ts), [`src/composables/History/useRecordReport.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/composables/History/useRecordReport.ts).
- **Endpoints relacionados**: `POST /api/historico/historialGeneral`, `POST /api/historico/historialMaquinas`.
- **Historias de usuario relacionadas**: `HU-HIST-004`.

---

### RN-HIST-004: Independencia y Limpieza de Filtros por Tipo de Reporte
- **Descripción**: Los parámetros de configuración y filtros configurados para un tipo de reporte (ej. *Reporte de Activos*) no deben contaminar ni sobreescribir la configuración de los otros tipos (ej. *Reporte de Ingresos*). Al presionar *"Limpiar configuración"*, solo se reestablecen los filtros de la pestaña activa.
- **Motivo**: Evitar errores operativos al alternar entre diferentes tipos de consultas o descargas.
- **Módulos afectados**: `05_historial_reportes`.
- **Archivos donde se implementa**: [`src/composables/History/useRecordReport.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/composables/History/useRecordReport.ts).
- **Endpoints relacionados**: N/A (Estado cliente).
- **Historias de usuario relacionadas**: `HU-HIST-004`.
