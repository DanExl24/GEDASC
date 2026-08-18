# Reglas de Negocio — Módulo 06: Administración, Monitoreo y Alertas

---

## 1. Permisos y Seguridad

### RN-ADM-001: Restricción Exclusiva para el Rol Administrador
- **Descripción**: Todas las funcionalidades de analítica gerencial, corrección de registros, monitoreo de préstamos, seguimiento de inasistencias y panel de asociaciones están restringidas exclusivamente a usuarios con rol `ADMIN`.
- **Motivo**: Proteger los datos sensibles y la integridad de las configuraciones y auditorías institucionales.
- **Módulos afectados**: `06_administracion_monitoreo`, `07_gestion_academica`.
- **Archivos donde se implementa**: [`database/src/middlewares/admin.middleware.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/middlewares/admin.middleware.ts), [`src/router/index.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/router/index.ts).
- **Endpoints relacionados**: Todos los endpoints bajo `/api/admin/*`.
- **Historias de usuario relacionadas**: `HU-ADM-001` a `HU-ADM-006`.

---

## 2. Auditoría y Eliminación de Registros

### RN-ADM-002: Verificación de Identidad y Justificación Obligatoria para Eliminaciones
- **Descripción**: Para eliminar un registro de ingreso o salida, el sistema exige ingresar de forma exacta el documento de identidad o nombre completo del aprendiz afectado, junto con un motivo de anulación de al menos 5 caracteres.
- **Motivo**: Prevenir eliminaciones accidentales de registros válidos y mantener trazabilidad de los motivos de corrección operativa.
- **Módulos afectados**: `06_administracion_monitoreo`, `02_control_ingreso`, `03_control_salida`.
- **Archivos donde se implementa**: [`database/src/controllers/admin.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/controllers/admin.controller.ts#L60-L85), [`src/views/AdminRecordControlView.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/views/AdminRecordControlView.vue).
- **Endpoints relacionados**: `DELETE /api/admin/ingresos/:id`, `DELETE /api/admin/salidas/:id`.
- **Historias de usuario relacionadas**: `HU-ADM-002`.

---

### RN-ADM-003: Eliminación en Cascada Controlada
- **Descripción**: Al eliminar un registro de ingreso (`detalles_ingreso`), el sistema debe eliminar en cascada la salida asociada (`detalles_salida`), los registros de máquinas vinculadas a la sesión (`detalles_maquinas`) y las referencias de préstamos, preservando intacto el registro maestro del aprendiz en la tabla `aprendiz`.
- **Motivo**: Mantener la consistencia referencial de la base de datos sin generar registros huérfanos.
- **Módulos afectados**: `06_administracion_monitoreo`.
- **Archivos donde se implementa**: [`database/src/controllers/admin.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/controllers/admin.controller.ts), [`database/alter_fk_cascade.js`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/alter_fk_cascade.js).
- **Endpoints relacionados**: `DELETE /api/admin/ingresos/:id`.
- **Historias de usuario relacionadas**: `HU-ADM-002`.

---

## 3. Alertas y Seguimiento

### RN-ADM-004: Umbral para Alertas de Inasistencia Prolongada (3 Días)
- **Descripción**: El sistema clasifica como inasistencia prolongada y dispara una alerta en el Centro de Alertas únicamente cuando un aprendiz acumula **3 o más días consecutivos sin registrar acceso** al CTA dentro de los días hábiles de su formación.
- **Motivo**: Servir como mecanismo de alerta temprana para prevenir la deserción escolar en el marco del reglamento del aprendiz SENA.
- **Módulos afectados**: `06_administracion_monitoreo`.
- **Archivos donde se implementa**: [`database/src/controllers/admin.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/controllers/admin.controller.ts#L170-L210), [`src/views/AdminAlertsView.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/views/AdminAlertsView.vue).
- **Endpoints relacionados**: `GET /api/admin/track`.
- **Historias de usuario relacionadas**: `HU-ADM-004`, `HU-ADM-005`.

---

## 4. Métricas y Consolidación

### RN-ADM-005: Agregación de Métricas Trimestrales y Anuales
- **Descripción**: El cálculo de estadísticas anuales y trimestrales consolida los ingresos agrupados por trimestres calendario (T1: Ene-Mar, T2: Abr-Jun, T3: Jul-Sep, T4: Oct-Dic) y contabiliza aprendices únicos atendidos en el año vigente.
- **Motivo**: Suministrar información cuantitativa requerida para los comités de centro y rendición de cuentas institucionales.
- **Módulos afectados**: `06_administracion_monitoreo`.
- **Archivos donde se implementa**: [`database/src/controllers/admin.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/controllers/admin.controller.ts#L78-L82).
- **Endpoints relacionados**: `GET /api/admin/statsQuarter`, `GET /api/admin/statsYear`.
- **Historias de usuario relacionadas**: `HU-ADM-001`.
