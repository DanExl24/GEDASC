# Reglas de Negocio — Módulo 04: Gestión y Control de Equipos de Cómputo y Vehículos

---

## 1. Pertenencia y Tipos de Activos

### RN-ACT-001: Distinción entre Equipo Propio y Préstamo
- **Descripción**: Todo activo que ingresa al centro se evalúa contra el historial de titularidad. Si el serial o placa ya está vinculado a un aprendiz distinto al actual portador, el registro se marca obligatoriamente como **préstamo** y se almacena la relación `{ id_aprendiz_propietario, id_aprendiz_receptor }`.
- **Motivo**: Mantener la trazabilidad de la custodia de los activos institucionales y personales en el centro.
- **Módulos afectados**: `04_equipos_vehiculos`, `06_administracion_monitoreo`.
- **Archivos donde se implementa**: [`database/src/services/machines/checksBorroweds.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/services/machines/checksBorroweds.ts), [`database/src/controllers/entry.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/controllers/entry.controller.ts).
- **Endpoints relacionados**: `POST /api/registroIngresos/ingresoMaquina/:id`.
- **Historias de usuario relacionadas**: `HU-ACT-001`, `HU-ACT-002`, `HU-ACT-003`.

---

### RN-ACT-002: Jerarquía de Máquina Principal vs Secundaria
- **Descripción**: El primer computador o vehículo registrado por un aprendiz se establece como su **máquina principal**. Si el aprendiz ingresa un equipo adicional en la misma sesión o en sesiones posteriores, este se gestiona mediante la lógica de **máquina secundaria / doble máquina** (`UpdateMachine`).
- **Motivo**: Permitir que aprendices técnicos que portan herramientas de desarrollo adicionales (ej. dos portátiles para redes o prácticas) puedan registrarlos sin perder la referencia a su equipo base.
- **Módulos afectados**: `04_equipos_vehiculos`, `06_administracion_monitoreo`.
- **Archivos donde se implementa**: [`database/src/controllers/entry.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/controllers/entry.controller.ts#L18-L23), [`database/src/services/machines/checkNonPrincipal.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/services/machines/checkNonPrincipal.ts).
- **Endpoints relacionados**: `POST /api/registroIngresos/ingresoDobleMaquina/:id_aprendiz`, `GET /api/registroIngresos/maquinaPrincipal/:id_aprendiz`.
- **Historias de usuario relacionadas**: `HU-ACT-001`.

---

## 2. Concurrencia y Bloqueos

### RN-ACT-003: Bloqueo de Máquina Concurrente Activa en el CTA
- **Descripción**: Un computador o vehículo que tenga un registro en `detalles_maquinas` con `estado_equipo = 'dentro'` no puede ser ingresado nuevamente por ningún aprendiz (ni por su titular ni por un tercero).
- **Motivo**: Evitar inconsistencias físicas donde un mismo activo figure dentro de las instalaciones dos veces simultáneamente.
- **Módulos afectados**: `04_equipos_vehiculos`, `02_control_ingreso`.
- **Archivos donde se implementa**: [`database/src/services/machines/checkDuplicate.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/services/machines/checkDuplicate.ts).
- **Endpoints relacionados**: `POST /api/registroIngresos/ingresoMaquina/:id`.
- **Historias de usuario relacionadas**: `HU-ACT-004`.

---

### RN-ACT-004: Reutilización de Activo tras Retiro Firmado
- **Descripción**: Una vez que un equipo ha completado su ciclo y su registro en `detalles_maquinas` pasa al estado `estado_equipo = 'retirado'` con `firma_salida` válida, el serial o placa queda inmediatamente disponible para futuros ingresos en el mismo día o en días posteriores.
- **Motivo**: Permitir la dinámica de aprendices que salen a almorzar con su equipo y reingresan en la jornada de la tarde.
- **Módulos afectados**: `04_equipos_vehiculos`, `02_control_ingreso`, `03_control_salida`.
- **Archivos donde se implementa**: [`database/src/controllers/exit.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/controllers/exit.controller.ts#L320-L360).
- **Endpoints relacionados**: `POST /api/registroSalidas/retirarEquipo/:id_detallemaquina`.
- **Historias de usuario relacionadas**: `HU-ACT-005`.

---

## 3. Doble Firma y Evidencia Digital

### RN-ACT-005: Obligatoriedad de Doble Firma Digital
- **Descripción**: Todo ingreso de activo requiere capturar la firma digital de entrada (`firma_ingreso`), y todo retiro físico del activo requiere capturar la firma digital de salida (`firma_salida`).
- **Motivo**: Proveer valor probatorio y garantía jurídica tanto para el aprendiz (que demuestra que no retiró el equipo antes de tiempo) como para el CTA (que demuestra que el equipo fue entregado físicamente).
- **Módulos afectados**: `04_equipos_vehiculos`, `03_control_salida`.
- **Archivos donde se implementa**: [`database/src/controllers/entry.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/controllers/entry.controller.ts), [`database/src/controllers/exit.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/controllers/exit.controller.ts).
- **Endpoints relacionados**: `POST /api/registroIngresos/ingresoMaquina/:id`, `POST /api/registroSalidas/retirarEquipo/:id_detallemaquina`.
- **Historias de usuario relacionadas**: `HU-ACT-001`, `HU-ACT-002`, `HU-ACT-005`.

---

### RN-ACT-006: Persistencia y Formato de Firmas Digitales
- **Descripción**: Las firmas capturadas deben almacenarse en formato Base64 (Data URL `image/png`) en la base de datos PostgreSQL, garantizando su integridad visual sin dependencias externas de almacenamiento de archivos.
- **Motivo**: Asegurar portabilidad y disponibilidad inmediata para la generación de reportes y consultas históricas.
- **Módulos afectados**: `04_equipos_vehiculos`, `05_historial_reportes`.
- **Archivos donde se implementa**: [`src/components/Library/SignaturePad.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/components/Library/SignaturePad.vue), [`database/src/controllers/entry.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/controllers/entry.controller.ts).
- **Endpoints relacionados**: `POST /api/registroIngresos/ingresoMaquina/:id`, `POST /api/registroSalidas/retirarEquipo/:id_detallemaquina`.
- **Historias de usuario relacionadas**: `HU-ACT-001`, `HU-ACT-006`.

---

## 4. Trazabilidad

### RN-ACT-007: Visibilidad de Propietario en Historial de Activos
- **Descripción**: Al consultar el historial de activos, el sistema debe indicar si el registro correspondió a un equipo propio o a un préstamo, permitiendo ver el detalle completo de ambos aprendices (titular y portador).
- **Motivo**: Facilitar investigaciones en caso de incidentes o reportes de pérdidas de activos dentro de las instalaciones.
- **Módulos afectados**: `04_equipos_vehiculos`, `05_historial_reportes`.
- **Archivos donde se implementa**: [`database/src/controllers/computer.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/controllers/computer.controller.ts), [`database/src/controllers/vehicle.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/controllers/vehicle.controller.ts).
- **Endpoints relacionados**: `GET /api/HistorialComputadores/propietario/:id_detallemaquina`, `GET /api/HistorialVehiculos/propietario/:id_detallemaquina`.
- **Historias de usuario relacionadas**: `HU-ACT-007`.

### RN-ACT-008: Evidencia Dual de Custodia (Firmas de Ingreso y Retiro)
- **Descripción**: Al consultar el detalle de un movimiento de activo en el módulo de gestión de máquinas, el sistema debe proveer obligatoriamente la evidencia gráfica completa del ciclo de custodia:
  1. Firma digital de ingreso y hora de entrada (`hora_ingreso`).
  2. Firma digital de salida/retiro y hora efectiva de retiro (`hora_salida`), calculada dinámicamente a partir de la hora de retiro específica del equipo (`hora_retiro_equipo`) o la salida general de la sesión (`detalles_salida.hora_salida`).
  3. Si el activo aún no ha sido retirado (`estado_equipo = 'dentro'`), el sistema debe indicarlo visualmente sin fallos por firmas nulas.
- **Motivo**: Garantizar el respaldo probatorio institucional ante cualquier reclamo o auditoría de seguridad sobre equipos y vehículos en el CTA.
- **Módulos afectados**: `04_equipos_vehiculos`, `05_historial_reportes`, `06_administracion_monitoreo`.
- **Archivos donde se implementa**: [`database/src/controllers/computer.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/controllers/computer.controller.ts), [`database/src/controllers/vehicle.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/controllers/vehicle.controller.ts), [`src/components/AprendizUI/Modals/ModalAssetOwnerDetails.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/components/AprendizUI/Modals/ModalAssetOwnerDetails.vue).
- **Endpoints relacionados**: `GET /api/HistorialComputadores/propietario/:id_detallemaquina`, `GET /api/HistorialVehiculos/propietario/:id_detallemaquina`.
- **Historias de usuario relacionadas**: `HU-ACT-007`.

