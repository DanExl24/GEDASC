# Historias de Usuario — Módulo 02: Control Operativo de Ingreso y Reingreso

---

# HU-ING-001

## Historia
**Como** celador de turno en la portería del CTA  
**Quiero** escanear el código de barras del carné de un aprendiz utilizando la cámara del dispositivo  
**Para** registrar su ingreso de manera automática, ágil y sin errores de digitación.

## Descripción
Permite capturar el código de barras impreso en el carné institucional mediante la integración de la librería `Quagga.js`. Al decodificar el documento, el sistema consulta el estado del aprendiz, verifica sus horarios y registra su entrada, actualizando la tabla operativa de ingresos del día en tiempo real.

## Criterios de Aceptación
- La cámara del dispositivo se activa al presionar *"Escanear aprendiz"*.
- `Quagga.js` decodifica códigos estándar (CODE_128, EAN_13, etc.) extrayendo el número de documento de identidad.
- El sistema invoca `GET /api/registroIngresos/verificarEntrada/:documento`.
- Si el aprendiz no existe en la base de datos, muestra una alerta sonora/visual: *"El documento no existe en la base de datos"*.
- Si el aprendiz existe y no tiene sesión activa, se envía `POST /api/registroIngresos/addEntry/:documento`.
- El nuevo registro se agrega en la parte superior de la tabla de ingresos con: Nombre, Apellido, DNI, Programa/Motivo, Hora de Ingreso (formato 12 horas AM/PM) y estado de máquina *"No registrada"*.
- El escáner se reinicia automáticamente para la siguiente lectura.

## Metadatos
- **Prioridad**: Alta
- **Roles involucrados**: `CELADOR`, `ADMIN`
- **Reglas de negocio relacionadas**: `RN-ING-001`, `RN-ING-002`, `RN-ING-003`, `RN-ING-004`
- **Endpoints relacionados**: `GET /api/registroIngresos/verificarEntrada/:documento`, `POST /api/registroIngresos/addEntry/:documento`
- **Componentes frontend relacionados**: `src/views/GeneralEntryView.vue`, `src/composables/useScan.ts`, `src/composables/useAprendiz.ts`
- **Controllers/Services relacionados**: `database/src/controllers/entry.controller.ts`

---

# HU-ING-002

## Historia
**Como** celador de turno  
**Quiero** registrar el ingreso manual de un aprendiz mediante su número de documento de identidad  
**Para** permitir el acceso de aprendices que olvidaron, dañaron o no portan su carné físico.

## Descripción
Proporciona un flujo alternativo de ingreso donde el celador abre un modal de registro manual, digita el número de documento del aprendiz y el sistema autocompleta sus nombres, apellidos y programa de formación antes de confirmar el acceso.

## Criterios de Aceptación
- El modal [`ModalRegisterManual.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/components/AprendizUI/Modals/ModalRegisterManual.vue) se despliega al presionar el botón *"Ingreso manual"*.
- Al ingresar el documento y perder el foco o presionar buscar, se invoca `GET /api/registroIngresos/ingresoManual/:documento`.
- El sistema autocompleta los campos de solo lectura: Nombre, Apellido y Programa de formación.
- Si el documento no existe en la base de datos, se alerta al celador y se deshabilita el botón *"Añadir ingreso"*.
- Al presionar *"Añadir ingreso"*, se ejecutan las mismas validaciones de horarios, reingresos y monitorías que en el escaneo automático.
- El ingreso queda guardado y se refleja de inmediato en la tabla de ingresos de hoy.

## Metadatos
- **Prioridad**: Alta
- **Roles involucrados**: `CELADOR`, `ADMIN`
- **Reglas de negocio relacionadas**: `RN-ING-001`, `RN-ING-004`, `RN-ING-005`
- **Endpoints relacionados**: `GET /api/registroIngresos/ingresoManual/:documento`, `POST /api/registroIngresos/addEntry/:documento`
- **Componentes frontend relacionados**: `src/components/AprendizUI/Modals/ModalRegisterManual.vue`, `src/views/GeneralEntryView.vue`
- **Controllers/Services relacionados**: `database/src/controllers/entry.controller.ts`

---

# HU-ING-003

## Historia
**Como** sistema de control de acceso GEDASC  
**Quiero** detectar automáticamente si un aprendiz que escanea su carné ya cuenta con una sesión de ingreso activa (sin salida registrada)  
**Para** registrar automáticamente su salida y cerrar la sesión sin requerir que el celador cambie manualmente de pantalla.

## Descripción
Implementa la lógica de **Toggle Inteligente de Sesión**. Si un aprendiz escanea su documento y la base de datos detecta un registro en `detalles_ingreso` para la fecha actual sin su correspondiente tupla en `detalles_salida` (`activeSession: true`), el sistema interpreta la acción como el cierre de su jornada/sesión y registra automáticamente la salida.

## Criterios de Aceptación
- `DetectEntry` ejecuta una consulta relacional con `LEFT JOIN detalles_salida ds ON ds.id_ingreso = di.id_ingreso` filtrando por `ds.hora_salida IS NULL` y `di.hora_ingreso >= CURRENT_DATE`.
- Si se encuentra una sesión activa:
  - Si el aprendiz porta un computador o vehículo con estado `'dentro'`, el sistema abre el modal de firma de salida y retiro de equipo antes de cerrar la sesión.
  - Si no porta equipos activos, `AddEntry` inserta de inmediato en `detalles_salida (id_ingreso)` y responde con `{ type: 'exit', message: 'Salida registrada con éxito' }`.
- Se emite una alerta visual/toast confirmando que se registró la salida del aprendiz.
- La tabla de ingresos/salidas se refresca automáticamente.

## Metadatos
- **Prioridad**: Alta
- **Roles involucrados**: `CELADOR`, `ADMIN`
- **Reglas de negocio relacionadas**: `RN-ING-004`, `RN-ING-010`
- **Endpoints relacionados**: `GET /api/registroIngresos/verificarEntrada/:documento`, `POST /api/registroIngresos/addEntry/:documento`
- **Componentes frontend relacionados**: `src/views/GeneralEntryView.vue`, `src/composables/useAprendiz.ts`
- **Controllers/Services relacionados**: `database/src/controllers/entry.controller.ts`

---

# HU-ING-004

## Historia
**Como** celador de turno  
**Quiero** capturar obligatoriamente el motivo de reingreso cuando un aprendiz ingresa por segunda o enésima vez en el mismo día  
**Para** mantener trazabilidad y justificación de las múltiples visitas de un aprendiz al centro de formación.

## Descripción
Cuando un aprendiz ya completó una o más sesiones completas de entrada y salida en el día (`isReentry: true`), al registrar un nuevo acceso el sistema suspende el guardado inmediato y despliega el modal [`ModalReentryReason.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/components/AprendizUI/Modals/ModalReentryReason.vue), obligando al operador a seleccionar el motivo del reingreso antes de crear la nueva sesión en `detalles_ingreso`.

## Criterios de Aceptación
- La API evalúa `COUNT(*) AS total_hoy FROM detalles_ingreso WHERE id_aprendiz = $1 AND hora_ingreso >= CURRENT_DATE`.
- Si `total_hoy > 0` y no hay sesión activa, retorna `{ isReentry: true }`.
- El frontend abre [`ModalReentryReason.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/components/AprendizUI/Modals/ModalReentryReason.vue) con opciones predeterminadas:
  - *Retorno de almuerzo / refrigerio*
  - *Jornada complementaria / monitoría*
  - *Asesoría técnica / biblioteca*
  - *Trámite institucional*
  - *Otro (campo de texto libre)*
- Al confirmar el motivo, se envía `POST /api/registroIngresos/addEntry/:documento` con el payload `{ motivo_reingreso: '...' }`.
- El campo `motivo_reingreso` se guarda en la base de datos y se muestra en los modales de detalle de sesión.

## Metadatos
- **Prioridad**: Alta
- **Roles involucrados**: `CELADOR`, `ADMIN`
- **Reglas de negocio relacionadas**: `RN-ING-005`
- **Endpoints relacionados**: `GET /api/registroIngresos/verificarEntrada/:documento`, `POST /api/registroIngresos/addEntry/:documento`
- **Componentes frontend relacionados**: `src/components/AprendizUI/Modals/ModalReentryReason.vue`, `src/views/GeneralEntryView.vue`
- **Controllers/Services relacionados**: `database/src/controllers/entry.controller.ts`

---

# HU-ING-005

## Historia
**Como** sistema de control de acceso GEDASC  
**Quiero** validar en tiempo real la jornada operativa del centro de formación (Diurna, Tarde, Noche o Cerrado)  
**Para** clasificar automáticamente los ingresos y bloquear los registros cuando el centro se encuentra fuera de horario de servicio.

## Descripción
El sistema consulta periódicamente el endpoint `/api/jornadaTime/tiempoJornada` para obtener la hora oficial del servidor y su franja horaria:
- **Diurna**: 06:00 AM – 11:59 AM
- **Tarde**: 12:00 PM – 05:59 PM
- **Noche**: 06:00 PM – 11:59 PM
- **Fuera de jornada / Cerrado**: 12:00 AM – 05:59 AM

## Criterios de Aceptación
- La cabecera y el dashboard muestran la hora del servidor y un Badge con la jornada activa en tiempo real.
- Cada nuevo ingreso registrado almacena y visualiza una etiqueta de jornada (`Diurna`, `Tarde`, `Noche`).
- Si la hora actual cae entre las 00:00 y las 05:59, el sistema marca el estado como `Cerrado`.
- Cuando el sistema está fuera de jornada, los botones *"Escanear aprendiz"*, *"Ingreso manual"*, *"Escanear salida"* y *"Salida manual"* quedan deshabilitados y se muestra un banner de advertencia.

## Metadatos
- **Prioridad**: Alta
- **Roles involucrados**: `CELADOR`, `ADMIN`
- **Reglas de negocio relacionadas**: `RN-ING-002`, `RN-ING-003`
- **Endpoints relacionados**: `GET /api/jornadaTime/tiempoJornada`
- **Componentes frontend relacionados**: `src/composables/useJornada.ts`, `src/components/UI/TheNavbar.vue`, `src/views/GeneralEntryView.vue`
- **Controllers/Services relacionados**: `database/src/controllers/jornada.controller.ts`

---

# HU-ING-006

## Historia
**Como** celador de turno  
**Quiero** clasificar el tipo de actividad (Formación vs Monitoría) cuando un aprendiz designado como monitor ingresa al centro  
**Para** segregar las horas de actividad académica regular de las horas de labor institucional.

## Descripción
Cuando un aprendiz posee el indicador `es_monitor = true` en la tabla `aprendiz`, el sistema despliega el modal [`ModalConfirm.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/components/AprendizUI/Modals/ModalConfirm.vue) preguntando si el acceso corresponde a su jornada de **"Formación"** académica o a su labor de **"Monitoría"**.

## Criterios de Aceptación
- La API retorna `es_monitor: true` en la verificación previa.
- Se despliega una ventana interactiva solicitando la elección:
  - Botón: *"Formación Académica"* (`tipo_sesion = 'formacion'`)
  - Botón: *"Labor de Monitoría"* (`tipo_sesion = 'monitoria'`)
- La selección se envía en el cuerpo de `POST /api/registroIngresos/addEntry/:documento`.
- La tabla de ingresos del celador y las tablas de historial muestran un badge distintivo morado `[Monitoría]` o azul `[Formación]`.

## Metadatos
- **Prioridad**: Alta
- **Roles involucrados**: `CELADOR`, `ADMIN`
- **Reglas de negocio relacionadas**: `RN-ING-006`
- **Endpoints relacionados**: `GET /api/registroIngresos/verificarEntrada/:documento`, `POST /api/registroIngresos/addEntry/:documento`
- **Componentes frontend relacionados**: `src/components/AprendizUI/Modals/ModalConfirm.vue`, `src/views/GeneralEntryView.vue`
- **Controllers/Services relacionados**: `database/src/controllers/entry.controller.ts`

---

# HU-ING-007

## Historia
**Como** sistema de control de acceso inteligente  
**Quiero** validar el día y la hora de ingreso del aprendiz contra los horarios oficiales de sus formaciones activas  
**Para** exigir obligatoriamente un motivo de visita cuando el acceso ocurra fuera del horario curricular asignado.

## Descripción
El backend evalúa las fichas de formación activas del aprendiz (`aprendiz_formacion`), sus horarios (`horario`) y días habilitados (`horario_dia`). Si la hora del acceso se encuentra dentro del rango de la clase (con una ventana de tolerancia de ±30 minutos) y el día de la semana coincide, el acceso es autorizado como ingreso curricular regular. De lo contrario, se despliega [`ModalVisitReason.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/components/AprendizUI/Modals/ModalVisitReason.vue) para capturar el motivo institucional de la visita.

## Criterios de Aceptación
- La consulta SQL compara `CURRENT_TIME` contra `h.hora_inicio - 30 min` y `h.hora_fin + 30 min`, y `hd.dia_semana` con el día actual (Lunes a Domingo).
- Si `isWithinSchedule` es `false`, se abre [`ModalVisitReason.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/components/AprendizUI/Modals/ModalVisitReason.vue).
- Las opciones de motivo incluyen: *Biblioteca*, *Proyecto de formación*, *Monitoría*, *Bienestar al Aprendiz*, *Reunión con instructor*, *Evento institucional*, *Trámite administrativo*, *Otro*.
- Al seleccionar el motivo, se guarda en `detalles_ingreso.motivo_visita` y `id_formacion` se establece en `NULL` o en la formación seleccionada.
- En la tabla operativa, la columna Formación muestra el texto del motivo de visita con un estilo visual diferenciado.

## Metadatos
- **Prioridad**: Alta
- **Roles involucrados**: `CELADOR`, `ADMIN`
- **Reglas de negocio relacionadas**: `RN-ING-007`, `RN-ING-008`
- **Endpoints relacionados**: `GET /api/registroIngresos/verificarEntrada/:documento`, `POST /api/registroIngresos/addEntry/:documento`
- **Componentes frontend relacionados**: `src/components/AprendizUI/Modals/ModalVisitReason.vue`, `src/views/GeneralEntryView.vue`
- **Controllers/Services relacionados**: `database/src/controllers/entry.controller.ts`

---

# HU-ING-008

## Historia
**Como** celador de turno  
**Quiero** seleccionar cuál formación realizará el aprendiz cuando este cuente con múltiples formaciones activas coincidentes con el horario del ingreso  
**Para** asociar la sesión de acceso a la ficha curricular exacta y garantizar estadísticas precisas por programa.

## Descripción
En casos de aprendices con doble titulación o múltiples fichas activas cuyos horarios coinciden en el día y franja horaria actual, el sistema despliega el modal [`ModalSelectFormation.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/components/AprendizUI/Modals/ModalSelectFormation.vue) listando las fichas disponibles para que el celador elija a cuál de ellas asiste el aprendiz.

## Criterios de Aceptación
- Si `matchingFormations.length > 1`, el sistema abre [`ModalSelectFormation.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/components/AprendizUI/Modals/ModalSelectFormation.vue).
- Cada opción muestra el número de ficha (`id_formacion`), nombre del programa y rango horario.
- La formación seleccionada se envía en el campo `id_formacion` de `POST /api/registroIngresos/addEntry/:documento`.
- La sesión queda explícitamente vinculada a la ficha elegida.

## Metadatos
- **Prioridad**: Media
- **Roles involucrados**: `CELADOR`, `ADMIN`
- **Reglas de negocio relacionadas**: `RN-ING-009`
- **Endpoints relacionados**: `GET /api/registroIngresos/verificarEntrada/:documento`, `POST /api/registroIngresos/addEntry/:documento`
- **Componentes frontend relacionados**: `src/components/AprendizUI/Modals/ModalSelectFormation.vue`, `src/views/GeneralEntryView.vue`
- **Controllers/Services relacionados**: `database/src/controllers/entry.controller.ts`

---

# HU-ING-009

## Historia
**Como** administrador o evaluador del sistema  
**Quiero** simular una hora y fecha virtual en el servidor  
**Para** realizar pruebas exhaustivas de validación de horarios académicos, transiciones de jornadas y cambios de turno sin esperar el transcurso de las horas reales.

## Descripción
Permite a los administradores fijar una hora arbitraria en el servidor mediante [`ModalSimularHora.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/components/Modals/ModalSimularHora.vue). El backend intercepta todas las funciones de comparación de tiempo (`CURRENT_TIME`, `CURRENT_TIMESTAMP`) sustituyéndolas por la hora simulada hasta que el administrador restablezca la hora real del sistema.

## Criterios de Aceptación
- El modal permite ingresar una hora específica o presionar *"Restablecer hora real"*.
- `POST /api/admin/simularHora` actualiza el reloj virtual del backend.
- Cuando hay una simulación activa, la cabecera muestra un aviso parpadeante: *"⚠️ MODO SIMULACIÓN ACTIVO"*.
- Todas las validaciones de jornada, horarios académicos y restricciones de 5 minutos responden a la hora simulada.

## Metadatos
- **Prioridad**: Baja (Herramienta de QA / Administración)
- **Roles involucrados**: `ADMIN`
- **Reglas de negocio relacionadas**: `RN-ING-011`
- **Endpoints relacionados**: `POST /api/admin/simularHora`, `GET /api/admin/simularHora`
- **Componentes frontend relacionados**: `src/components/Modals/ModalSimularHora.vue`, `src/components/UI/TheNavbar.vue`
- **Controllers/Services relacionados**: `database/src/controllers/admin.controller.ts`
