# Reglas de Negocio — Módulo 02: Control Operativo de Ingreso y Reingreso

---

## 1. Permisos y Acceso

### RN-ING-001: Existencia Previa del Aprendiz en Base de Datos
- **Descripción**: Solo se puede registrar el ingreso de personas que se encuentren previamente matriculadas y registradas en la tabla `aprendiz`. Si el documento no existe, el sistema debe rechazar el intento con status HTTP 404.
- **Motivo**: Prevenir el ingreso de personas ajenas a la institución educativa o no registradas en la base de datos oficial.
- **Módulos afectados**: `02_control_ingreso`, `03_control_salida`, `06_administracion_monitoreo`.
- **Archivos donde se implementa**: [`database/src/controllers/entry.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/controllers/entry.controller.ts#L40-L47).
- **Endpoints relacionados**: `GET /api/registroIngresos/verificarEntrada/:documento`, `POST /api/registroIngresos/addEntry/:documento`.
- **Historias de usuario relacionadas**: `HU-ING-001`, `HU-ING-002`.

---

## 2. Jornadas Operativas

### RN-ING-002: Clasificación de Jornadas Operativas del Centro
- **Descripción**: Todo ingreso registrado debe clasificarse en una de las tres jornadas operativas oficiales según la hora de la transacción:
  - **Diurna**: 06:00:00 a 11:59:59
  - **Tarde**: 12:00:00 a 17:59:59
  - **Noche**: 18:00:00 a 23:59:59
- **Motivo**: Estandarizar la clasificación temporal de la permanencia y facilitar reportes estadísticos por franja horaria.
- **Módulos afectados**: `02_control_ingreso`, `05_historial_reportes`, `06_administracion_monitoreo`.
- **Archivos donde se implementa**: [`database/src/controllers/jornada.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/controllers/jornada.controller.ts), [`src/composables/useJornada.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/composables/useJornada.ts).
- **Endpoints relacionados**: `GET /api/jornadaTime/tiempoJornada`.
- **Historias de usuario relacionadas**: `HU-ING-005`.

---

### RN-ING-003: Bloqueo Operativo Fuera de Jornada
- **Descripción**: Si la hora del servidor se encuentra entre las 00:00:00 y las 05:59:59, el estado del sistema es `Cerrado`. En este estado, quedan deshabilitadas las opciones de escaneo e ingreso manual en la interfaz.
- **Motivo**: Seguridad física del centro; en horas de la madrugada no se permite el ingreso ordinario de aprendices.
- **Módulos afectados**: `02_control_ingreso`, `03_control_salida`.
- **Archivos donde se implementa**: [`src/composables/useJornada.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/composables/useJornada.ts), [`src/views/GeneralEntryView.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/views/GeneralEntryView.vue).
- **Endpoints relacionados**: `GET /api/jornadaTime/tiempoJornada`.
- **Historias de usuario relacionadas**: `HU-ING-005`.

---

## 3. Sesiones y Reingresos

### RN-ING-004: Detección Automática de Sesión Abierta (Toggle de Salida)
- **Descripción**: Si un aprendiz intenta ingresar y ya posee un registro en `detalles_ingreso` para la fecha actual sin registro de salida en `detalles_salida`, el sistema no crea un nuevo ingreso; en su lugar, cierra la sesión abierta registrando automáticamente su salida.
- **Motivo**: Agilizar la operación de la portería en horas pico, permitiendo usar una misma terminal de escaneo para entradas y salidas sin conmutar vistas manualmente.
- **Módulos afectados**: `02_control_ingreso`, `03_control_salida`.
- **Archivos donde se implementa**: [`database/src/controllers/entry.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/controllers/entry.controller.ts#L51-L74).
- **Endpoints relacionados**: `GET /api/registroIngresos/verificarEntrada/:documento`, `POST /api/registroIngresos/addEntry/:documento`.
- **Historias de usuario relacionadas**: `HU-ING-003`.

---

### RN-ING-005: Obligatoriedad de Motivo en Reingresos Diarios
- **Descripción**: Si el aprendiz no tiene sesión activa pero ya registra al menos un ingreso completado en la fecha actual (`total_hoy > 0`), el nuevo registro se considera un **reingreso** y requiere obligatoriamente capturar el `motivo_reingreso`.
- **Motivo**: Conocer la justificación operativa por la cual un aprendiz entra y sale múltiples veces de la sede (ej. regreso de almuerzo, actividades extracurriculares).
- **Módulos afectados**: `02_control_ingreso`, `05_historial_reportes`.
- **Archivos donde se implementa**: [`database/src/controllers/entry.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/controllers/entry.controller.ts#L163-L173), [`src/components/AprendizUI/Modals/ModalReentryReason.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/components/AprendizUI/Modals/ModalReentryReason.vue).
- **Endpoints relacionados**: `POST /api/registroIngresos/addEntry/:documento`.
- **Historias de usuario relacionadas**: `HU-ING-004`.

---

### RN-ING-006: Clasificación de Sesión para Aprendices Monitores
- **Descripción**: Si el aprendiz tiene la bandera `es_monitor = true`, el sistema debe registrar en `detalles_ingreso.tipo_sesion` el valor explícito `'formacion'` o `'monitoria'`, seleccionado por el usuario en el modal interactivo.
- **Motivo**: Separar las horas lectivas del aprendiz de sus horas de contraprestación de monitoría para auditorías académicas y administrativas.
- **Módulos afectados**: `02_control_ingreso`, `06_administracion_monitoreo`.
- **Archivos donde se implementa**: [`database/src/controllers/entry.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/controllers/entry.controller.ts#L79-L82), [`src/components/AprendizUI/Modals/ModalConfirm.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/components/AprendizUI/Modals/ModalConfirm.vue).
- **Endpoints relacionados**: `POST /api/registroIngresos/addEntry/:documento`.
- **Historias de usuario relacionadas**: `HU-ING-006`.

---

## 4. Validación Académica y Horarios

### RN-ING-007: Ventana de Tolerancia para Horarios Académicos
- **Descripción**: La coincidencia entre la hora de ingreso y el horario de una formación se evalúa permitiendo un margen de tolerancia de **30 minutos antes** de la hora de inicio y **30 minutos después** de la hora de finalización del horario oficial.
- **Motivo**: Permitir el acceso anticipado de aprendices para alistamiento en talleres y la salida ordenada tras finalizar la clase.
- **Módulos afectados**: `02_control_ingreso`, `07_gestion_academica`.
- **Archivos donde se implementa**: [`database/src/controllers/entry.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/controllers/entry.controller.ts#L183-L196).
- **Endpoints relacionados**: `GET /api/registroIngresos/verificarEntrada/:documento`.
- **Historias de usuario relacionadas**: `HU-ING-007`.

---

### RN-ING-008: Motivo de Visita Obligatorio Fuera de Horario Curricular
- **Descripción**: Si la hora del acceso no coincide con ninguna formación activa del aprendiz para el día de la semana actual, el sistema bloquea el ingreso directo y exige el registro de un `motivo_visita`.
- **Motivo**: Evitar la permanencia injustificada de aprendices en instalaciones del centro cuando no tienen clases programadas.
- **Módulos afectados**: `02_control_ingreso`, `05_historial_reportes`.
- **Archivos donde se implementa**: [`database/src/controllers/entry.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/controllers/entry.controller.ts#L230-L245), [`src/components/AprendizUI/Modals/ModalVisitReason.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/components/AprendizUI/Modals/ModalVisitReason.vue).
- **Endpoints relacionados**: `POST /api/registroIngresos/addEntry/:documento`.
- **Historias de usuario relacionadas**: `HU-ING-007`.

---

### RN-ING-009: Selección de Ficha en Casos de Múltiples Formaciones Coincidentes
- **Descripción**: Si un aprendiz está matriculado en más de un programa activo y los horarios de ambos coinciden en el momento del ingreso, el celador debe seleccionar explícitamente a qué formación asiste el aprendiz.
- **Motivo**: Mantener la trazabilidad y la correcta imputación de asistencia por ficha académica.
- **Módulos afectados**: `02_control_ingreso`, `07_gestion_academica`.
- **Archivos donde se implementa**: [`database/src/controllers/entry.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/controllers/entry.controller.ts#L204-L230), [`src/components/AprendizUI/Modals/ModalSelectFormation.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/components/AprendizUI/Modals/ModalSelectFormation.vue).
- **Endpoints relacionados**: `POST /api/registroIngresos/addEntry/:documento`.
- **Historias de usuario relacionadas**: `HU-ING-008`.

---

## 5. Restricciones y Excepciones

### RN-ING-010: Bloqueo de Salida Automática si el Aprendiz Porta Equipo Activo
- **Descripción**: Si un aprendiz con sesión activa intenta registrar salida mediante escaneo y tiene un equipo de cómputo o vehículo con `estado_equipo = 'dentro'`, la salida automática se suspende y se abre obligatoriamente el modal de retiro físico y firma de salida del equipo.
- **Motivo**: Evitar que un aprendiz abandone la sede dejando equipos registrados a su nombre sin la debida constatación y firma de retiro.
- **Módulos afectados**: `02_control_ingreso`, `03_control_salida`, `04_equipos_vehiculos`.
- **Archivos donde se implementa**: [`database/src/controllers/entry.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/controllers/entry.controller.ts#L147-L160), [`src/views/GeneralEntryView.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/views/GeneralEntryView.vue).
- **Endpoints relacionados**: `GET /api/registroIngresos/verificarEntrada/:documento`.
- **Historias de usuario relacionadas**: `HU-ING-003`, `HU-SAL-004`, `HU-ACT-006`.

---

### RN-ING-011: Prevalencia del Reloj Simulado sobre el Sistema Real
- **Descripción**: Cuando la variable global de simulación de hora está activa en el servidor, todas las funciones de verificación de jornada, horarios de formaciones y bloqueos deben calcularse a partir de la hora simulada.
- **Motivo**: Permitir pruebas de homologación y aseguramiento de calidad funcionales en cualquier momento del día.
- **Módulos afectados**: `02_control_ingreso`, `03_control_salida`, `07_gestion_academica`.
- **Archivos donde se implementa**: [`database/src/controllers/admin.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/controllers/admin.controller.ts#L40-L45).
- **Endpoints relacionados**: `POST /api/admin/simularHora`, `GET /api/admin/simularHora`.
- **Historias de usuario relacionadas**: `HU-ING-009`.
