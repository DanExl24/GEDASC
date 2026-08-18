# Historias de Usuario — Módulo 03: Control Operativo de Salida de Aprendices

---

# HU-SAL-001

## Historia
**Como** celador de turno en la portería del CTA  
**Quiero** escanear el carné de un aprendiz al momento de su egreso  
**Para** registrar su salida formal, finalizar su sesión de permanencia y liberar su estado en el centro.

## Descripción
Permite capturar el código de barras del carné del aprendiz para tramitar su salida. El sistema valida que el aprendiz posea una sesión de ingreso activa (sin salida registrada hoy), verifica si tiene equipos pendientes por firmar y registra la tupla en `detalles_salida`.

## Criterios de Aceptación
- El celador presiona *"Escanear salida"* en [`GeneralExitView.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/views/GeneralExitView.vue) o en la vista unificada.
- `Quagga.js` lee el código de barras y envía `GET /api/registroSalidas/verificarSalida/:documento`.
- Si el aprendiz no tiene un ingreso activo registrado en el día, el sistema muestra una alerta: *"No tiene un ingreso activo para registrar salida"*.
- Si el aprendiz tiene ingreso activo y no porta activos pendientes, se invoca `POST /api/registroSalidas/addExit/:documento`.
- El sistema registra la tupla en `detalles_salida (id_ingreso)` con la marca de tiempo actual del servidor.
- La tabla de salidas del día se actualiza de inmediato mostrando: Nombre, Apellido, DNI, Programa de Formación, Hora de Salida y Estado de firma.

## Metadatos
- **Prioridad**: Alta
- **Roles involucrados**: `CELADOR`, `ADMIN`
- **Reglas de negocio relacionadas**: `RN-SAL-001`, `RN-SAL-002`, `RN-SAL-003`
- **Endpoints relacionados**: `GET /api/registroSalidas/verificarSalida/:documento`, `POST /api/registroSalidas/addExit/:documento`
- **Componentes frontend relacionados**: `src/views/GeneralExitView.vue`, `src/views/GeneralEntryView.vue`, `src/composables/useExitAprendiz.ts`
- **Controllers/Services relacionados**: `database/src/controllers/exit.controller.ts`

---

# HU-SAL-002

## Historia
**Como** celador de turno  
**Quiero** registrar manualmente la salida de un aprendiz mediante su número de documento de identidad  
**Para** tramitar el egreso de aprendices que no portan su carné físico al salir.

## Descripción
Proporciona el formulario modal [`ModalRegisterExitManual.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/components/AprendizUI/Modals/ModalRegisterExitManual.vue) para digitar el DNI del aprendiz, verificar que cuente con ingreso activo en el día y registrar su salida manual.

## Criterios de Aceptación
- Al presionar *"Salida manual"*, se abre [`ModalRegisterExitManual.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/components/AprendizUI/Modals/ModalRegisterExitManual.vue).
- El celador digita el documento de identidad.
- El sistema busca el registro de ingreso activo y completa automáticamente los datos informativos del aprendiz.
- Al presionar *"Añadir salida"*, se envía `POST /api/registroSalidas/addExit/:documento`.
- Si la operación es exitosa, se cierra el modal y se actualiza la tabla de egresos.

## Metadatos
- **Prioridad**: Alta
- **Roles involucrados**: `CELADOR`, `ADMIN`
- **Reglas de negocio relacionadas**: `RN-SAL-001`, `RN-SAL-002`
- **Endpoints relacionados**: `POST /api/registroSalidas/addExit/:documento`
- **Componentes frontend relacionados**: `src/components/AprendizUI/Modals/ModalRegisterExitManual.vue`, `src/views/GeneralExitView.vue`
- **Controllers/Services relacionados**: `database/src/controllers/exit.controller.ts`

---

# HU-SAL-003

## Historia
**Como** sistema de control de acceso GEDASC  
**Quiero** impedir el registro de salida si no han transcurrido al menos 5 minutos desde la hora de ingreso  
**Para** evitar registros duplicados accidentales o salidas inmediatas no justificadas.

## Descripción
Implementa una regla de protección temporal: si un aprendiz intenta registrar su salida dentro de los primeros 5 minutos posteriores a su hora de ingreso, el sistema rechaza la transacción y emite un mensaje informativo con los minutos restantes para poder registrar el egreso.

## Criterios de Aceptación
- La API evalúa la diferencia entre `CURRENT_TIMESTAMP` y `detalles_ingreso.hora_ingreso`.
- Si la diferencia es menor a 5 minutos (`tiempo_transcurrido < 300 segundos`), la solicitud se rechaza con código HTTP 400.
- El frontend muestra una alerta: *"No es posible registrar la salida. Debe esperar al menos 5 minutos desde el ingreso"*.

## Metadatos
- **Prioridad**: Alta
- **Roles involucrados**: `CELADOR`, `ADMIN`
- **Reglas de negocio relacionadas**: `RN-SAL-002`
- **Endpoints relacionados**: `POST /api/registroSalidas/addExit/:documento`, `GET /api/registroSalidas/verificarSalida/:documento`
- **Componentes frontend relacionados**: `src/views/GeneralExitView.vue`, `src/composables/useExitAprendiz.ts`
- **Controllers/Services relacionados**: `database/src/controllers/exit.controller.ts`

---

# HU-SAL-004

## Historia
**Como** celador de turno  
**Quiero** capturar la firma digital de retiro y verificar físicamente el equipo antes de confirmar la salida del aprendiz  
**Para** certificar que el activo registrado al ingresar está siendo retirado de forma conforme por su titular.

## Descripción
Cuando un aprendiz registró un computador o vehículo durante su ingreso, al momento de tramitar su salida el sistema identifica el registro activo en `detalles_maquinas`. Si el estado del activo es `'dentro'`, se despliega el modal de retiro de equipos (`ModalExitComputer.vue` / `SignaturePad.vue`) para capturar la firma digital de salida y actualizar el activo como `'retirado'` con su respectiva marca de tiempo.

## Criterios de Aceptación
- `DetectExit` identifica si `detalles_ingreso.id_detallemaquina` no es nulo y `detalles_maquinas.estado_equipo = 'dentro'`.
- El sistema bloquea el cierre directo de la salida y abre el modal de firma de retiro de equipo.
- El aprendiz dibuja su firma en el componente táctil `SignaturePad.vue`.
- Al confirmar, se envía `POST /api/registroSalidas/retirarEquipo/:id_detallemaquina` con el Base64 de la firma.
- El backend actualiza `detalles_maquinas.firma_salida`, establece `estado_equipo = 'retirado'` y `hora_retiro_equipo = CURRENT_TIMESTAMP`.
- Una vez firmado el retiro del equipo, se finaliza el registro de la salida en `detalles_salida`.

## Metadatos
- **Prioridad**: Alta
- **Roles involucrados**: `CELADOR`, `ADMIN`
- **Reglas de negocio relacionadas**: `RN-SAL-003`, `RN-ACT-005`
- **Endpoints relacionados**: `POST /api/registroSalidas/retirarEquipo/:id_detallemaquina`, `POST /api/registroSalidas/addExit/:documento`
- **Componentes frontend relacionados**: `src/components/AprendizUI/Modals/ModalExitComputer.vue`, `src/components/Library/SignaturePad.vue`, `src/views/GeneralExitView.vue`
- **Controllers/Services relacionados**: `database/src/controllers/exit.controller.ts`

---

# HU-SAL-005

## Historia
**Como** celador o administrador  
**Quiero** buscar aprendices en tiempo real en la lista de salidas del día por nombre, apellido o documento  
**Para** verificar rápidamente si un aprendiz específico ya registró su salida del centro.

## Descripción
Dispone de una barra de búsqueda en la parte superior de la tabla de salidas. Al escribir cualquier criterio, el sistema filtra y presenta en milisegundos las coincidencias de los aprendices que ya egresaron en la fecha actual.

## Criterios de Aceptación
- La barra de búsqueda ejecuta consultas al endpoint `GET /api/registroSalidas/buscar?q={texto}` con debounce.
- El backend realiza una búsqueda insensible a mayúsculas/minúsculas (`ILIKE`) sobre `documento`, `nombre` y `apellido`.
- Solo retorna los movimientos de egreso correspondientes a la fecha actual (`ds.hora_salida >= CURRENT_DATE`).
- Si se limpia el buscador, la tabla restaura la lista completa de salidas del día.

## Metadatos
- **Prioridad**: Media
- **Roles involucrados**: `CELADOR`, `ADMIN`
- **Reglas de negocio relacionadas**: `RN-SAL-004`
- **Endpoints relacionados**: `GET /api/registroSalidas/buscar`
- **Componentes frontend relacionados**: `src/views/GeneralExitView.vue`, `src/views/GeneralEntryView.vue`
- **Controllers/Services relacionados**: `database/src/controllers/exit.controller.ts`

---

# HU-SAL-006

## Historia
**Como** celador de turno  
**Quiero** que el sistema detecte si un aprendiz está saliendo antes de la hora estipulada de su formación académica  
**Para** capturar obligatoriamente el motivo justificado de su egreso anticipado antes de permitir la salida.

## Descripción
Al escanear la salida, el sistema compara la hora actual (`CURRENT_TIME`) contra la hora de finalización configurada en el horario de la formación (`horario.hora_fin`). Si el aprendiz egresa con más de 30 minutos de anticipación al término de su jornada, se despliega el modal `ModalEarlyExitReason.vue` exigiendo seleccionar la justificación correspondiente (*Permiso de instructor*, *Cita médica*, *Calamidad doméstica*, *Fin de jornada*, *Otro*) y se almacena en `detalles_salida.motivo_salida_anticipada`.

## Criterios de Aceptación
- Si `CURRENT_TIME < (horario.hora_fin - INTERVAL '30 minutes')`, el backend marca `isEarlyExit = true`.
- El frontend intercepta el flujo e impide la salida directa, abriendo `ModalEarlyExitReason.vue`.
- El operador selecciona una justificación predefinida o ingresa una descripción personalizada si selecciona "Otro".
- Al confirmar, se envía `POST /api/registroSalidas/addExit/:documento` incluyendo `{ motivo_salida_anticipada: '...' }`.
- El registro de egreso almacena la justificación para fines de auditoría y reportes académicos.

## Metadatos
- **Prioridad**: Alta
- **Roles involucrados**: `CELADOR`, `ADMIN`
- **Reglas de negocio relacionadas**: `RN-SAL-005`
- **Endpoints relacionados**: `GET /api/registroSalidas/verificarSalida/:documento`, `POST /api/registroSalidas/addExit/:documento`
- **Componentes frontend relacionados**: `src/components/AprendizUI/Modals/ModalEarlyExitReason.vue`, `src/views/GeneralEntryView.vue`
- **Controllers/Services relacionados**: `database/src/controllers/exit.controller.ts`

