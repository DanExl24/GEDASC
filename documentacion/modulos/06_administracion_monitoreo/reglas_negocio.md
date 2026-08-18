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

---

## 5. Gestión de Cuentas de Usuario

### RN-ADM-006: Restricción Exclusiva para Alta de Cuentas de Celador
- **Descripción**: El Administrador únicamente tiene permitido crear, editar y cambiar el estado de cuentas con rol `CELADOR` (`id_rol = 2`). El sistema bloquea a nivel de backend cualquier intento de asignar o promover un usuario al rol `ADMIN` a través de los formularios o endpoints de gestión de usuarios.
- **Motivo**: Blindar la seguridad de la plataforma, evitando la proliferación no controlada de superusuarios administradores.
- **Módulos afectados**: `06_administracion_monitoreo`, `01_autenticacion_acceso`.
- **Archivos donde se implementa**: [`database/src/controllers/admin.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/controllers/admin.controller.ts), [`src/views/AdminCeladoresView.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/views/AdminCeladoresView.vue).
- **Endpoints relacionados**: `POST /api/admin/celadores`, `PUT /api/admin/celadores/:id`, `PATCH /api/admin/celadores/:id/toggle`.
- **Historias de usuario relacionadas**: `HU-ADM-007`.

---

## 6. Gestión del Directorio Maestro de Aprendices

### RN-ADM-007: Unicidad e Integridad de Documento de Aprendiz
- **Descripción**: El número de documento del aprendiz es el identificador principal y único en la tabla `aprendiz`. El sistema no permite registrar ni actualizar aprendices cuyo documento colisione con otro ya existente.
- **Motivo**: Garantizar la consistencia de los accesos, asignación de computadores y vehículos, y reportes de auditoría en portería.
- **Módulos afectados**: `06_administracion_monitoreo`, `02_control_ingreso`, `03_control_salida`.
- **Archivos donde se implementa**: [`database/src/controllers/admin.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/controllers/admin.controller.ts), [`database/src/schemas/admin.schema.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/schemas/admin.schema.ts).
- **Endpoints relacionados**: `POST /api/admin/aprendices`, `PUT /api/admin/aprendices/:id_aprendiz`.
- **Historias de usuario relacionadas**: `HU-ADM-008`.

### RN-ADM-008: Baja Lógica y Protección de Integridad Histórica
- **Descripción**: Si un administrador solicita la eliminación de un aprendiz que ya cuenta con registros históricos de acceso en `detalles_ingreso`, el sistema rechaza la eliminación física y ejecuta automáticamente una baja lógica (`estado = false`), notificando al usuario que el historial ha sido preservado. Si el aprendiz no tiene movimientos históricos registrados, se limpian sus relaciones no transaccionales (`aprendiz_formacion`, `aprendiz_computador`, `aprendiz_vehiculo`) y se elimina de la base de datos.
- **Motivo**: Preservar la inmutabilidad de los registros de seguridad y auditoría institucional del CTA.
- **Módulos afectados**: `06_administracion_monitoreo`, `05_historial_reportes`.
- **Archivos donde se implementa**: [`database/src/controllers/admin.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/controllers/admin.controller.ts).
- **Endpoints relacionados**: `DELETE /api/admin/aprendices/:id_aprendiz`.
- **Historias de usuario relacionadas**: `HU-ADM-008`.

### RN-ADM-009: Ingesta y Validación de Registros Masivos de Aprendices
- **Descripción**: En la importación masiva desde Excel (`.xlsx`, `.xls`) o JSON, el sistema normaliza encabezados sin distinguir mayúsculas, tildes o variaciones comunes (`documento`, `cedula`, `identificacion`, `nombre`, `apellido`, `es_monitor`). Los registros con documento ya existente se contabilizan como *Ya Registrados* sin interrumpir el proceso de los aprendices nuevos restantes. El backend retorna un informe métrico estructurado con el desglose exacto de novedades.
- **Motivo**: Permitir la carga ágil y tolerante a fallos de cohortes completas de aprendices.
- **Módulos afectados**: `06_administracion_monitoreo`, `07_gestion_academica`.
- **Archivos donde se implementa**: [`database/src/controllers/admin.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/controllers/admin.controller.ts), [`src/components/Modals/ModalImportAprendicesGeneral.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/components/Modals/ModalImportAprendicesGeneral.vue).
- **Endpoints relacionados**: `POST /api/admin/aprendices/masivo`.
- **Historias de usuario relacionadas**: `HU-ADM-009`.


