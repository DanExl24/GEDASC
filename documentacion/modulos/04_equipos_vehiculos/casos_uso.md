# Casos de Uso — Módulo 04: Gestión y Control de Equipos de Cómputo y Vehículos

---

## CU-ACT-01: Registro de Computador con Detección de Préstamo

- **Actor Principal**: Celador de turno
- **Precondiciones**:
  - El aprendiz ya cuenta con un registro de ingreso activo en la fecha actual.
  - El aprendiz declara portar un computador portátil.
- **Disparador**: El celador presiona el botón *"Registrar máquina"* en la fila del aprendiz.

### Flujo Principal:
1. El celador abre el modal [`ModalRegisterMachine.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/components/AprendizUI/Modals/ModalRegisterMachine.vue).
2. El celador digita la marca (ej. *Lenovo*) y el número de serial del equipo (ej. *PF123456*).
3. El servicio backend `checkDuplicate` verifica que el equipo no se encuentre activo actualmente (`estado_equipo != 'dentro'`).
4. El servicio `checksBorroweds` detecta que el serial *PF123456* está registrado como propiedad de otro aprendiz (*Carlos Pérez*).
5. El sistema suspende el registro directo y abre [`ModalConfirmMachine.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/components/AprendizUI/Modals/ModalConfirmMachine.vue), alertando: *"El computador pertenece a Carlos Pérez. ¿Desea registrar el préstamo?"*.
6. El celador consulta al aprendiz y confirma la advertencia.
7. El aprendiz plasma su firma digital de ingreso en el componente `SignaturePad.vue`.
8. El celador presiona *"Guardar registro de equipo"*.
9. El backend inserta en `detalles_maquinas` con `firma_ingreso`, marca `estado_equipo = 'dentro'`, guarda la relación en `computadores_prestados` y vincula el `id_detallemaquina` a `detalles_ingreso`.
10. La tabla operativa actualiza el estado a *"Máquina registrada (Préstamo)"*.

### Flujos Alternativos:
- **FA-1 (Equipo propio nuevo o habitual)**:
  1. En el paso 4, el equipo no pertenece a terceros.
  2. El sistema omite la alerta de préstamo y pasa directamente a la captura de firma y guardado.

### Flujos de Excepción:
- **FE-1 (Equipo con sesión activa en el CTA)**:
  1. En el paso 3, `checkDuplicate` detecta que el equipo ya está registrado con estado `'dentro'` por otro usuario que no ha firmado salida.
  2. El backend retorna error `400 Bad Request`.
  3. El sistema muestra alerta roja: *"Este equipo ya se encuentra dentro del centro"*.

- **Postcondiciones**:
  - El activo queda registrado con firma de ingreso y marcado dentro de las instalaciones.

---

## CU-ACT-02: Retiro Físico y Firma Digital de Salida del Equipo

- **Actor Principal**: Celador de turno
- **Precondiciones**:
  - El aprendiz está registrado con un equipo en estado `'dentro'`.
- **Disparador**: El aprendiz registra su salida del centro portando el equipo.

### Flujo Principal:
1. Al escanear el carné o tramitar la salida del aprendiz, el sistema detecta el activo activo.
2. Se despliega automáticamente el modal [`ModalExitComputer.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/components/AprendizUI/Modals/ModalExitComputer.vue).
3. El celador coteja el serial físico del portátil contra el mostrado en pantalla.
4. El aprendiz dibuja su firma digital de salida en el lienzo táctil.
5. El celador presiona *"Confirmar retiro"*.
6. El sistema envía `POST /api/registroSalidas/retirarEquipo/:id_detallemaquina`.
7. El backend actualiza `detalles_maquinas.firma_salida`, fija `estado_equipo = 'retirado'` y almacena la hora exacta de retiro.
8. Se completa la salida del aprendiz en `detalles_salida`.

- **Postcondiciones**:
  - El equipo queda formalmente marcado como `'retirado'`, cerrando la doble firma digital.
