# Casos de Uso — Módulo 02: Control Operativo de Ingreso y Reingreso

---

## CU-ING-01: Registro de Ingreso Regular de Aprendiz (Escaneo o Manual)

- **Actor Principal**: Celador de turno
- **Precondiciones**:
  - El sistema está en jornada operativa habilitada (`Diurna`, `Tarde` o `Noche`).
  - El aprendiz está registrado en la base de datos y no tiene una sesión de acceso abierta en el día.
- **Disparador**: El aprendiz presenta su carné en la portería o indica su número de documento.

### Flujo Principal (Éxito):
1. El celador presiona *"Escanear aprendiz"* en [`GeneralEntryView.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/views/GeneralEntryView.vue) y apunta la cámara al carné.
2. `Quagga.js` lee el código de barras y extrae el número de documento de identidad.
3. El frontend realiza la consulta `GET /api/registroIngresos/verificarEntrada/:documento`.
4. El backend verifica que el aprendiz existe, confirma que no tiene sesión activa (`activeSession: false`), comprueba que es su primer ingreso del día (`isReentry: false`) y que el horario actual coincide con su formación (`isWithinSchedule: true`).
5. El sistema envía automáticamente la petición `POST /api/registroIngresos/addEntry/:documento` con `tipo_sesion = 'formacion'` e `id_formacion`.
6. El backend inserta el nuevo registro en `detalles_ingreso` con la hora del sistema y retorna status `201 Created`.
7. El frontend reproduce un sonido de confirmación y actualiza reactivamente la tabla de ingresos del día, mostrando la fila con:
   - Nombre y Apellidos completos
   - DNI
   - Nombre de la Formación o Ficha
   - Hora de Ingreso (ej. 07:05 AM)
   - Badge de Jornada (ej. Diurna)
   - Botón *"Registrar máquina"* (estado actual: *No registrada*).

### Flujos Alternativos:
- **FA-1 (Ingreso Manual por DNI)**:
  1. En el paso 1, el celador presiona *"Ingreso manual"*.
  2. Se abre [`ModalRegisterManual.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/components/AprendizUI/Modals/ModalRegisterManual.vue) y el celador digita el documento.
  3. El sistema autocompleta el nombre y programa del aprendiz.
  4. El celador presiona *"Añadir ingreso"*, continuando con el paso 3 del flujo principal.
- **FA-2 (Aprendiz Monitor)**:
  1. En el paso 4, el backend detecta `es_monitor: true`.
  2. El sistema suspende el guardado directo y despliega [`ModalConfirm.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/components/AprendizUI/Modals/ModalConfirm.vue).
  3. El celador selecciona *"Labor de Monitoría"* o *"Formación Académica"*.
  4. Se envía la petición con el `tipo_sesion` seleccionado y se procede al paso 6.
- **FA-3 (Reingreso en el mismo día)**:
  1. En el paso 4, el backend detecta `isReentry: true` (ya tuvo un ingreso previo hoy).
  2. El sistema despliega [`ModalReentryReason.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/components/AprendizUI/Modals/ModalReentryReason.vue).
  3. El celador selecciona el motivo (ej. *"Retorno de almuerzo"*) y confirma.
  4. Se envía la petición con `motivo_reingreso` y se procede al paso 6.

### Flujos de Excepción:
- **FE-1 (Aprendiz no registrado en base de datos)**:
  1. En el paso 3, el backend retorna `404 Not Found`.
  2. El frontend muestra una alerta roja y no permite el registro.
- **FE-2 (Sistema fuera de jornada operativa)**:
  1. La hora del servidor es entre 00:00 y 05:59.
  2. Los botones de ingreso están bloqueados y se visualiza banner de estado *"Cerrado"*.

- **Postcondiciones**:
  - Se crea una nueva sesión de acceso activa en `detalles_ingreso`.

---

## CU-ING-02: Ingreso Extraordinario Fuera de Horario Académico

- **Actor Principal**: Celador de turno
- **Precondiciones**:
  - El aprendiz está registrado en la base de datos.
  - La hora o día actual no coincide con los horarios de sus formaciones activas.
- **Disparador**: El aprendiz ingresa a las instalaciones en un horario fuera de sus clases oficiales.

### Flujo Principal:
1. El celador escanea el carné o digita el DNI del aprendiz.
2. `DetectEntry` evalúa `schedulesQuery` y determina que `isWithinSchedule = false`.
3. El frontend detecta que no hay coincidencia horaria y despliega el modal interactivo [`ModalVisitReason.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/components/AprendizUI/Modals/ModalVisitReason.vue).
4. El celador consulta al aprendiz el motivo de su permanencia en el centro y selecciona una opción válida (ej. *Biblioteca*, *Proyecto de formación*, *Bienestar al Aprendiz*, *Reunión con instructor*).
5. El celador presiona *"Confirmar ingreso"*.
6. El sistema envía `POST /api/registroIngresos/addEntry/:documento` incluyendo `{ motivo_visita: 'Biblioteca' }`.
7. El backend almacena la sesión con `motivo_visita` registrado.
8. La tabla de ingresos muestra el registro destacando la justificación de visita en lugar del nombre del programa.

- **Postcondiciones**:
  - El acceso queda auditado con justificación explícita de visita fuera de horario curricular.
