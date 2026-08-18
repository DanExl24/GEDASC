# Módulo 04: Gestión y Control de Equipos de Cómputo y Vehículos

## 1. Descripción General

El **Módulo de Gestión y Control de Equipos de Cómputo y Vehículos** garantiza la seguridad física y la cadena de custodia de los activos que ingresan y salen del **Centro de Tecnología de la Amazonía (CTA)**. Administra el registro de computadores portátiles y medios de transporte (bicicletas, motocicletas y automóviles) vinculados a la sesión de ingreso del aprendiz.

Incorpora características de alta seguridad:
- **Doble Firma Digital**: Firma táctil al ingresar y firma de verificación física al salir.
- **Detección Inteligente de Pertenencia y Préstamos**: Identificación automática del propietario titular vs receptor en préstamo con alertas operativas.
- **Control de Concurrencia de Activos**: Bloqueo estricto si un serial o placa ya se encuentra con sesión activa (`'dentro'`) en el centro.
- **Soporte de Doble Máquina / Equipo Secundario**: Permite registrar activos secundarios cuando un aprendiz porta más de un equipo.
- **Captura Móvil de Firma Digital**: Integración en tiempo real mediante WebSockets (`Socket.io`) con terminales móviles en portería.
- **Historial Unificado de Activos**: Consulta centralizada con alternancia entre Computadores y Vehículos, visualización de firmas y detalle de propietarios.

---

## 2. Arquitectura y Componentes del Módulo

### 2.1 Backend (Node.js / Express / TypeScript)
- **Rutas**: [`database/src/routes/computer.routes.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/routes/computer.routes.ts), [`database/src/routes/vehicle.routes.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/routes/vehicle.routes.ts), [`database/src/routes/entry.routes.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/routes/entry.routes.ts), [`database/src/routes/exit.routes.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/routes/exit.routes.ts)
- **Controladores**: [`database/src/controllers/computer.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/controllers/computer.controller.ts), [`database/src/controllers/vehicle.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/controllers/vehicle.controller.ts), [`database/src/controllers/entry.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/controllers/entry.controller.ts), [`database/src/controllers/exit.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/controllers/exit.controller.ts)
- **Servicios de Validación**:
  - [`database/src/services/machines/checkDuplicate.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/services/machines/checkDuplicate.ts) (Concurrencia)
  - [`database/src/services/machines/checkComputer.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/services/machines/checkComputer.ts) (Computadores)
  - [`database/src/services/machines/checkVehicle.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/services/machines/checkVehicle.ts) (Vehículos)
  - [`database/src/services/machines/checksBorroweds.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/services/machines/checksBorroweds.ts) (Préstamos)
- **Base de Datos**: Tablas `maquinas`, `computador`, `vehiculo`, `detalles_maquinas`, `computadores_prestados`, `vehiculos_prestados`.

### 2.2 Frontend (Vue 3 / TypeScript / Pinia)
- **Vistas**: [`src/views/AssetsHistoryView.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/views/AssetsHistoryView.vue), [`src/views/AdminBorrowedAssetsView.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/views/AdminBorrowedAssetsView.vue), [`src/mobile/SignatureMobileView.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/mobile/SignatureMobileView.vue)
- **Modales de Activos**:
  - [`src/components/AprendizUI/Modals/ModalRegisterMachine.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/components/AprendizUI/Modals/ModalRegisterMachine.vue)
  - [`src/components/AprendizUI/Modals/ModalConfirmMachine.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/components/AprendizUI/Modals/ModalConfirmMachine.vue)
  - [`src/components/AprendizUI/Modals/ModalMachineDetails.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/components/AprendizUI/Modals/ModalMachineDetails.vue)
  - [`src/components/AprendizUI/Modals/ModalHistoryMachineDetails.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/components/AprendizUI/Modals/ModalHistoryMachineDetails.vue)
  - [`src/components/AprendizUI/Modals/ModalAssetOwnerDetails.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/components/AprendizUI/Modals/ModalAssetOwnerDetails.vue)
  - [`src/components/Library/SignaturePad.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/components/Library/SignaturePad.vue)

---

## 3. Endpoints del Módulo

| Método | Endpoint | Descripción | Roles Permitidos |
|---|---|---|---|
| `POST` | `/api/registroIngresos/ingresoMaquina/:id` | Registra un activo (computador o vehículo) con su firma de ingreso | `CELADOR`, `ADMIN` |
| `POST` | `/api/registroIngresos/ingresoDobleMaquina/:id_aprendiz` | Registra una máquina secundaria para el aprendiz | `CELADOR`, `ADMIN` |
| `GET` | `/api/registroIngresos/detalleMaquinas/:id_aprendiz` | Obtiene el detalle de máquinas y firmas activas de la sesión | `CELADOR`, `ADMIN` |
| `GET` | `/api/registroIngresos/maquinaPrincipal/:id_aprendiz` | Consulta la máquina principal registrada para el aprendiz | `CELADOR`, `ADMIN` |
| `POST` | `/api/registroSalidas/retirarEquipo/:id_detallemaquina` | Registra la firma de salida del activo y actualiza su estado a 'retirado' | `CELADOR`, `ADMIN` |
| `GET` | `/api/HistorialComputadores/historial` | Consulta el historial consolidado de computadores con filtros | `CELADOR`, `ADMIN` |
| `GET` | `/api/HistorialComputadores/propietario/:id_detallemaquina`| Obtiene datos del propietario, firmas duales (ingreso y salida), horarios y estado del computador | `CELADOR`, `ADMIN` |
| `GET` | `/api/HistorialVehiculos/historial` | Consulta el historial consolidado de vehículos con filtros | `CELADOR`, `ADMIN` |
| `GET` | `/api/HistorialVehiculos/propietario/:id_detallemaquina` | Obtiene datos del propietario, firmas duales (ingreso y salida), horarios y estado del vehículo | `CELADOR`, `ADMIN` |

---

## 4. Estructura de Documentación del Módulo

- [`historias_usuario.md`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/documentacion/modulos/04_equipos_vehiculos/historias_usuario.md): Historias de usuario completas con criterios de aceptación y trazabilidad.
- [`reglas_negocio.md`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/documentacion/modulos/04_equipos_vehiculos/reglas_negocio.md): Catálogo de reglas de concurrencia, préstamos, pertenencia y doble firma.
- [`casos_uso.md`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/documentacion/modulos/04_equipos_vehiculos/casos_uso.md): Casos de uso de registro de equipos, gestión de préstamos y retiro físico.
