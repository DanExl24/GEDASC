# Reglas de Negocio — Módulo 03: Control Operativo de Salida de Aprendices

---

## 1. Permisos y Validación de Estado

### RN-SAL-001: Existencia Obligatoria de Ingreso Activo en el Día
- **Descripción**: No se puede registrar la salida de un aprendiz si este no cuenta con un registro previo en `detalles_ingreso` para la fecha actual sin salida asociada (`ds.hora_salida IS NULL`).
- **Motivo**: Mantener la coherencia del ciclo de vida de la sesión (no puede haber salida sin entrada previa).
- **Módulos afectados**: `03_control_salida`, `05_historial_reportes`.
- **Archivos donde se implementa**: [`database/src/controllers/exit.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/controllers/exit.controller.ts#L43-L57).
- **Endpoints relacionados**: `GET /api/registroSalidas/verificarSalida/:documento`, `POST /api/registroSalidas/addExit/:documento`.
- **Historias de usuario relacionadas**: `HU-SAL-001`, `HU-SAL-002`.

---

## 2. Restricciones Temporales

### RN-SAL-002: Restricción de Salida Inmediata (< 5 Minutos)
- **Descripción**: El sistema no debe permitir registrar la salida de un aprendiz si han transcurrido menos de 5 minutos desde la hora en que se registró su ingreso.
- **Motivo**: Prevenir dobles lecturas accidentales del escáner en portería y disuadir ingresos fraudulentos de solo registro.
- **Módulos afectados**: `03_control_salida`.
- **Archivos donde se implementa**: [`database/src/controllers/exit.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/controllers/exit.controller.ts), [`src/composables/useExitAprendiz.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/composables/useExitAprendiz.ts).
- **Endpoints relacionados**: `POST /api/registroSalidas/addExit/:documento`.
- **Historias de usuario relacionadas**: `HU-SAL-003`.

---

## 3. Retiro de Activos y Doble Firma

### RN-SAL-003: Retiro Físico y Firma Obligatoria de Equipos Vinculados
- **Descripción**: Si la sesión de ingreso tiene un activo vinculado (`detalles_ingreso.id_detallemaquina IS NOT NULL`) y su estado es `'dentro'`, la salida del aprendiz queda bloqueada hasta que se capture la `firma_salida` y el equipo pase al estado `'retirado'`.
- **Motivo**: Asegurar la cadena de custodia y evidencia jurídica de que el activo registrado al ingresar fue retirado formalmente por el portador.
- **Módulos afectados**: `03_control_salida`, `04_equipos_vehiculos`.
- **Archivos donde se implementa**: [`database/src/controllers/exit.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/controllers/exit.controller.ts#L14-L20), [`src/views/GeneralExitView.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/views/GeneralExitView.vue).
- **Endpoints relacionados**: `POST /api/registroSalidas/retirarEquipo/:id_detallemaquina`.
- **Historias de usuario relacionadas**: `HU-SAL-004`.

---

## 4. Trazabilidad y Consultas

### RN-SAL-004: Inmutabilidad de la Hora de Salida del Sistema
- **Descripción**: La hora de salida se asigna de manera inmutable en el backend mediante `CURRENT_TIMESTAMP` al momento de ejecutar la inserción en `detalles_salida`. No puede ser manipulada por el frontend.
- **Motivo**: Garantizar la veracidad y precisión cronológica del historial de permanencia en el centro.
- **Módulos afectados**: `03_control_salida`, `05_historial_reportes`, `06_administracion_monitoreo`.
- **Archivos donde se implementa**: [`database/src/controllers/exit.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/controllers/exit.controller.ts#L61-L68).
- **Endpoints relacionados**: `POST /api/registroSalidas/addExit/:documento`.
- **Historias de usuario relacionadas**: `HU-SAL-001`, `HU-SAL-002`.

---

### RN-SAL-005: Detección de Salida Anticipada y Justificación Obligatoria
- **Descripción**: Si la hora del egreso es inferior a la hora de finalización del horario académico (`CURRENT_TIME < (horario.hora_fin - INTERVAL '30 minutes')`), el sistema clasifica la salida como anticipada y exige el registro del motivo justificado en `detalles_salida.motivo_salida_anticipada`.
- **Motivo**: Auditar deserciones tempranas de clase o salidas autorizadas por motivos médicos y personales.
- **Módulos afectados**: `03_control_salida`, `05_historial_reportes`, `07_gestion_academica`.
- **Archivos donde se implementa**: [`database/src/controllers/exit.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/controllers/exit.controller.ts), [`src/components/AprendizUI/Modals/ModalEarlyExitReason.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/components/AprendizUI/Modals/ModalEarlyExitReason.vue), [`src/views/GeneralEntryView.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/views/GeneralEntryView.vue).
- **Endpoints relacionados**: `GET /api/registroSalidas/verificarSalida/:documento`, `POST /api/registroSalidas/addExit/:documento`.
- **Historias de usuario relacionadas**: `HU-SAL-006`.

