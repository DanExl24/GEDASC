# Casos de Uso — Módulo 03: Control Operativo de Salida de Aprendices

---

## CU-SAL-01: Registro de Salida Ordinaria de Aprendiz

- **Actor Principal**: Celador de turno
- **Precondiciones**:
  - El aprendiz cuenta con una sesión de ingreso abierta en la fecha actual (`detalles_salida.hora_salida IS NULL`).
  - Han transcurrido más de 5 minutos desde el registro del ingreso.
  - El aprendiz no tiene equipos con estado `'dentro'` pendientes por retirar.
- **Disparador**: El aprendiz se acerca a la portería para retirarse del centro.

### Flujo Principal (Éxito):
1. El celador presiona *"Escanear salida"* en [`GeneralExitView.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/views/GeneralExitView.vue) o en la pestaña unificada de portería.
2. `Quagga.js` lee el código de barras y envía `GET /api/registroSalidas/verificarSalida/:documento`.
3. El backend verifica que existe la sesión activa y que no hay equipos pendientes de firma.
4. El sistema envía la petición `POST /api/registroSalidas/addExit/:documento`.
5. El backend inserta la tupla en `detalles_salida (id_ingreso)` con la hora actual y responde con status `201 Created`.
6. El frontend reproduce un sonido de confirmación y actualiza la tabla de salidas del día.

### Flujos Alternativos:
- **FA-1 (Salida Manual)**:
  1. En el paso 1, el celador presiona *"Salida manual"*.
  2. Se abre [`ModalRegisterExitManual.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/components/AprendizUI/Modals/ModalRegisterExitManual.vue), digita el DNI y presiona *"Añadir salida"*, continuando en el paso 3.

### Flujos de Excepción:
- **FE-1 (Sin ingreso activo)**:
  1. En el paso 3, el backend no encuentra ingreso activo para la fecha actual.
  2. Responde con `400 Bad Request` y mensaje: *"No tiene un ingreso activo para registrar salida"*.
  3. El frontend muestra alerta informativa.
- **FE-2 (Intento de salida antes de 5 minutos)**:
  1. En el paso 3, han transcurrido menos de 5 minutos desde el ingreso.
  2. El sistema bloquea el registro e informa al celador el tiempo restante.

- **Postcondiciones**:
  - La sesión queda cerrada y registrada en `detalles_salida`.

---

## CU-SAL-02: Registro de Salida con Retiro Físico y Firma de Equipo

- **Actor Principal**: Celador de turno
- **Precondiciones**:
  - El aprendiz tiene ingreso activo y registró un computador o vehículo con estado `'dentro'`.
- **Disparador**: El aprendiz solicita salir portando el equipo registrado al entrar.

### Flujo Principal:
1. El celador escanea el carné del aprendiz.
2. El sistema detecta que el aprendiz tiene vinculado un activo en `detalles_maquinas` con `estado_equipo = 'dentro'`.
3. El sistema suspende el cierre directo de la salida y abre el modal de firma de salida (`ModalExitComputer.vue`).
4. El celador verifica físicamente la coincidencia del serial o placa del activo.
5. El aprendiz plasma su firma digital de salida en el lienzo táctil `SignaturePad.vue`.
6. El celador presiona *"Confirmar retiro y registrar salida"*.
7. El frontend envía `POST /api/registroSalidas/retirarEquipo/:id_detallemaquina` enviando la firma digital en Base64.
8. El backend almacena `firma_salida`, fija `estado_equipo = 'retirado'`, guarda la hora de retiro y procede a insertar la salida en `detalles_salida`.
9. La tabla de salidas se actualiza mostrando el estado de firma exitoso.

- **Postcondiciones**:
  - El equipo queda formalmente marcado como retirado del CTA con evidencia de doble firma (ingreso y salida).
