# Historias de Usuario — Módulo 04: Gestión y Control de Equipos de Cómputo y Vehículos

---

# HU-ACT-001

## Historia
**Como** celador de turno en la portería del CTA  
**Quiero** registrar el computador portátil que porta un aprendiz al ingresar, capturando marca, serial y su firma digital  
**Para** asegurar que el equipo quede formalmente inventariado bajo custodia del aprendiz durante su permanencia en el centro.

## Descripción
Permite asociar un computador al ingreso del aprendiz mediante el modal interactivo [`ModalRegisterMachine.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/components/AprendizUI/Modals/ModalRegisterMachine.vue). El celador registra la marca y serial, mientras el aprendiz dibuja su firma digital en el lienzo táctil integrado (`SignaturePad.vue`) o en la terminal móvil conectada. El sistema valida si el equipo es propio, principal, secundario o prestado, lo marca con `estado_equipo = 'dentro'` y actualiza la fila del aprendiz a *"Máquina registrada"*.

## Criterios de Aceptación
- El botón *"Registrar máquina"* en la fila del aprendiz abre el modal de registro de activos.
- El formulario solicita: Tipo de activo (*Computador*), Marca, Serial del computador y Lienzo de firma.
- El servicio backend `checkComputer` evalúa si el serial ya pertenece a otro aprendiz en el sistema.
- Se captura la firma digital como una cadena Base64 no vacía.
- Al confirmar, se envía `POST /api/registroIngresos/ingresoMaquina/:id`.
- Se inserta el registro en `detalles_maquinas` con `firma_ingreso`, `estado_equipo = 'dentro'`, `hora_ingreso_equipo = CURRENT_TIMESTAMP`.
- Se actualiza `detalles_ingreso.id_detallemaquina` con la tupla creada.
- El estado visual en la tabla del celador cambia inmediatamente a *"Máquina registrada"* (con indicador verde).

## Metadatos
- **Prioridad**: Alta
- **Roles involucrados**: `CELADOR`, `ADMIN`
- **Reglas de negocio relacionadas**: `RN-ACT-001`, `RN-ACT-002`, `RN-ACT-005`, `RN-ACT-006`
- **Endpoints relacionados**: `POST /api/registroIngresos/ingresoMaquina/:id`
- **Componentes frontend relacionados**: `src/components/AprendizUI/Modals/ModalRegisterMachine.vue`, `src/components/Library/SignaturePad.vue`, `src/views/GeneralEntryView.vue`
- **Controllers/Services relacionados**: `database/src/controllers/entry.controller.ts`, `database/src/services/machines/checkComputer.ts`

---

# HU-ACT-002

## Historia
**Como** celador de turno  
**Quiero** registrar el vehículo (bicicleta, motocicleta o automóvil) que ingresa un aprendiz al centro  
**Para** controlar el acceso vehicular en los parqueaderos del CTA y disponer de evidencia de su ingreso.

## Descripción
Permite asociar un vehículo al ingreso del aprendiz. El celador selecciona el tipo de vehículo, ingresa la marca y placa (o identificador en caso de bicicletas) y captura la firma digital del portador.

## Criterios de Aceptación
- El modal permite conmutar a tipo *Vehículo* con opciones de subtipo: *Moto*, *Bicicleta*, *Carro*.
- Solicita obligatoriamente: Subtipo, Marca, Placa/Identificador y Firma digital.
- El servicio `checkVehicle` valida el estado de la placa y su propietario titular.
- Al guardar, se vincula el activo a la sesión de ingreso con `estado_equipo = 'dentro'`.
- La tabla de ingresos refleja el registro del vehículo exitosamente.

## Metadatos
- **Prioridad**: Alta
- **Roles involucrados**: `CELADOR`, `ADMIN`
- **Reglas de negocio relacionadas**: `RN-ACT-001`, `RN-ACT-002`, `RN-ACT-005`
- **Endpoints relacionados**: `POST /api/registroIngresos/ingresoMaquina/:id`
- **Componentes frontend relacionados**: `src/components/AprendizUI/Modals/ModalRegisterMachine.vue`, `src/views/GeneralEntryView.vue`
- **Controllers/Services relacionados**: `database/src/controllers/entry.controller.ts`, `database/src/services/machines/checkVehicle.ts`

---

# HU-ACT-003

## Historia
**Como** celador de turno  
**Quiero** recibir una advertencia visual y requerir confirmación cuando un aprendiz intenta ingresar un equipo que pertenece a otro aprendiz  
**Para** documentar y auditar formalmente las situaciones de préstamo de equipos en el centro.

## Descripción
Si el serial o placa digitada ya se encuentra registrada en la base de datos a nombre de un aprendiz distinto al que está ingresando, el servicio `checksBorroweds` detecta la discrepancia. El sistema suspende el registro directo y despliega [`ModalConfirmMachine.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/components/AprendizUI/Modals/ModalConfirmMachine.vue) mostrando el nombre del propietario titular y solicitando confirmación explícita para registrar el préstamo.

## Criterios de Aceptación
- El backend evalúa la relación entre el serial/placa y el `id_aprendiz`.
- Si el equipo pertenece a un tercero, retorna `{ isBorrowed: true, ownerName: '...', ownerDni: '...' }`.
- El frontend abre [`ModalConfirmMachine.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/components/AprendizUI/Modals/ModalConfirmMachine.vue) informando: *"El equipo con serial [SERIAL] pertenece a [NOMBRE PROPIETARIO]. ¿Desea registrarlo como equipo prestado?"*.
- Al confirmar el celador, el registro se almacena en `detalles_maquinas` y se crea una entrada en `computadores_prestados` o `vehiculos_prestados`.
- El evento queda disponible inmediatamente en el módulo administrativo de *Máquinas Prestadas* y en el *Centro de Alertas*.

## Metadatos
- **Prioridad**: Alta
- **Roles involucrados**: `CELADOR`, `ADMIN`
- **Reglas de negocio relacionadas**: `RN-ACT-001`, `RN-ACT-003`, `RN-ACT-004`
- **Endpoints relacionados**: `POST /api/registroIngresos/ingresoMaquina/:id`
- **Componentes frontend relacionados**: `src/components/AprendizUI/Modals/ModalConfirmMachine.vue`, `src/views/GeneralEntryView.vue`
- **Controllers/Services relacionados**: `database/src/services/machines/checksBorroweds.ts`, `database/src/controllers/entry.controller.ts`

---

# HU-ACT-004

## Historia
**Como** sistema de control de acceso GEDASC  
**Quiero** bloquear el registro de un equipo si este ya se encuentra con una sesión activa dentro del centro  
**Para** evitar la duplicidad física imposible de un mismo computador o vehículo en instalaciones simultáneas.

## Descripción
El servicio `checkDuplicate` verifica si el serial o placa ingresada ya cuenta con una tupla en `detalles_maquinas` con `estado_equipo = 'dentro'`. Si es así, el sistema rechaza rotundamente la operación e informa al celador el nombre y documento del aprendiz que tiene actualmente la sesión activa con dicho equipo.

## Criterios de Aceptación
- `checkDuplicate` ejecuta una consulta sobre `detalles_maquinas` buscando coincidencias con `estado_equipo = 'dentro'`.
- Si existe una coincidencia activa, responde con código HTTP 400 y mensaje: *"El equipo ya se encuentra dentro del centro a nombre de [NOMBRE] ([DNI])"*.
- El sistema no permite continuar con el registro hasta que el portador anterior registre la salida y firma de retiro del activo.

## Metadatos
- **Prioridad**: Alta
- **Roles involucrados**: `CELADOR`, `ADMIN`
- **Reglas de negocio relacionadas**: `RN-ACT-003`
- **Endpoints relacionados**: `POST /api/registroIngresos/ingresoMaquina/:id`
- **Componentes frontend relacionados**: `src/components/AprendizUI/Modals/ModalRegisterMachine.vue`
- **Controllers/Services relacionados**: `database/src/services/machines/checkDuplicate.ts`

---

# HU-ACT-005

## Historia
**Como** celador de turno  
**Quiero** capturar la firma de salida del equipo al momento en que el aprendiz se retira del CTA  
**Para** completar el esquema de doble firma y certificar el retiro físico conforme del activo.

## Descripción
Al tramitar la salida de un aprendiz con equipo activo, el sistema abre el modal de firma de salida. El aprendiz dibuja su firma y el endpoint `POST /api/registroSalidas/retirarEquipo/:id_detallemaquina` almacena la `firma_salida`, marca `estado_equipo = 'retirado'` y guarda la hora exacta de retiro.

## Criterios de Aceptación
- El modal [`ModalExitComputer.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/components/AprendizUI/Modals/ModalExitComputer.vue) muestra el detalle del equipo (tipo, marca, serial/placa).
- El aprendiz firma en el componente táctil.
- Al presionar *"Confirmar retiro"*, se envía la firma en Base64.
- El backend actualiza `detalles_maquinas` estableciendo `firma_salida`, `estado_equipo = 'retirado'` y `hora_retiro_equipo = CURRENT_TIMESTAMP`.
- El equipo queda liberado para futuros ingresos por parte del mismo o de otro aprendiz.

## Metadatos
- **Prioridad**: Alta
- **Roles involucrados**: `CELADOR`, `ADMIN`
- **Reglas de negocio relacionadas**: `RN-ACT-004`, `RN-ACT-005`
- **Endpoints relacionados**: `POST /api/registroSalidas/retirarEquipo/:id_detallemaquina`
- **Componentes frontend relacionados**: `src/components/AprendizUI/Modals/ModalExitComputer.vue`, `src/components/Library/SignaturePad.vue`
- **Controllers/Services relacionados**: `database/src/controllers/exit.controller.ts`

---

# HU-ACT-006

## Historia
**Como** aprendiz y celador  
**Quiero** capturar la firma digital del aprendiz desde un dispositivo móvil o tablet sincronizado en tiempo real mediante WebSockets  
**Para** permitir que el aprendiz firme cómodamente en un dispositivo táctil de mano mientras el celador opera el computador principal.

## Descripción
Permite enlazar una vista móvil ([`SignatureMobileView.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/mobile/SignatureMobileView.vue)) al sistema mediante Socket.io. Cuando el celador abre un modal de firma en el PC, el evento se emite al dispositivo móvil; al firmar el aprendiz en la pantalla táctil, la firma en Base64 se transmite instantáneamente al PC y se guarda en la base de datos.

## Criterios de Aceptación
- La conexión WebSocket se establece de forma segura entre el PC de portería y la terminal móvil.
- Al solicitar firma, el móvil presenta el lienzo interactivo con los datos del aprendiz.
- Al presionar *"Aceptar"* en el móvil, el evento `signature:saved` envía la imagen Base64 al PC.
- El modal del PC recibe la firma y completa el guardado sin intervención manual adicional.

## Metadatos
- **Prioridad**: Media
- **Roles involucrados**: `CELADOR`, `ADMIN`
- **Reglas de negocio relacionadas**: `RN-ACT-006`
- **Endpoints relacionados**: Socket Events (`signature:request`, `signature:saved`)
- **Componentes frontend relacionados**: `src/mobile/SignatureMobileView.vue`, `src/socket.ts`, `src/components/Library/SignaturePad.vue`
- **Controllers/Services relacionados**: `database/src/sockets/index.ts`, `database/src/sockets/io.ts`

---

# HU-ACT-007

## Historia
**Como** celador o administrador  
**Quiero** consultar la vista unificada de historial de activos, alternando entre computadores y vehículos con filtros de fecha y búsqueda  
**Para** auditar los movimientos de equipos, consultar detalles de propietarios y visualizar las firmas de ingreso y salida.

## Descripción
Proporciona la vista [`AssetsHistoryView.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/views/AssetsHistoryView.vue) que unifica la trazabilidad de todos los activos que han ingresado al centro. Permite conmutar pestañas entre *Computadores* y *Vehículos*, filtrar por rangos de fecha predefinidos (*Hoy*, *Ayer*, *Esta semana*, etc.), buscar por serial/placa/propietario y abrir modales de detalle para inspeccionar las firmas digitales.

## Criterios de Aceptación
- Un interruptor superior permite conmutar entre *Computadores* (`GET /api/HistorialComputadores/historial`) y *Vehículos* (`GET /api/HistorialVehiculos/historial`).
- La tabla de computadores muestra: Marca, Serial, DNI del Aprendiz, Hora de Ingreso, Hora de Salida y Botón de Detalles.
- La tabla de vehículos muestra: Tipo, Marca, Placa, DNI del Aprendiz, Hora de Ingreso, Hora de Salida y Botón de Detalles.
- El botón de detalles abre [`ModalAssetOwnerDetails.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/components/AprendizUI/Modals/ModalAssetOwnerDetails.vue) mostrando:
  - Información completa del titular (Nombre, Apellido, Programa formativo, Ficha, Horario y Jornada).
  - Indicador de estado del activo (*RETIRADO DEL CENTRO* o *DENTRO DEL CENTRO*).
  - **Tarjeta Firma de Ingreso**: Hora exacta de ingreso y evidencia de la firma digital capturada en portería.
  - **Tarjeta Firma de Salida**: Hora exacta de salida/retiro y evidencia de la firma de retiro, o badge de *Activo Dentro del CTA* en caso de sesión activa sin retirar.

## Metadatos
- **Prioridad**: Alta
- **Roles involucrados**: `CELADOR`, `ADMIN`
- **Reglas de negocio relacionadas**: `RN-ACT-007`, `RN-ACT-008`
- **Endpoints relacionados**: `GET /api/HistorialComputadores/historial`, `GET /api/HistorialVehiculos/historial`, `GET /api/HistorialComputadores/propietario/:id_detallemaquina`, `GET /api/HistorialVehiculos/propietario/:id_detallemaquina`
- **Componentes frontend relacionados**: `src/views/AssetsHistoryView.vue`, `src/components/AprendizUI/AssetsHistoryTable.vue`, `src/components/AprendizUI/Modals/ModalAssetOwnerDetails.vue`
- **Controllers/Services relacionados**: `database/src/controllers/computer.controller.ts`, `database/src/controllers/vehicle.controller.ts`
