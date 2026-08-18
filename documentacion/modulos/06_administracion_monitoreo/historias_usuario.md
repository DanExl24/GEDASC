# Historias de Usuario — Módulo 06: Administración, Monitoreo y Alertas

---

# HU-ADM-001

## Historia
**Como** administrador del sistema GEDASC  
**Quiero** visualizar un dashboard interactivo con indicadores y estadísticas en tiempo real  
**Para** supervisar la dinámica de afluencia al CTA (total de ingresos y salidas hoy, mes, trimestre y año, y los 4 movimientos más recientes).

## Descripción
En [`DashboardView.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/views/DashboardView.vue), el administrador accede a tarjetas de resumen cuantitativo y widgets analíticos. El dashboard consume los servicios estadísticos para presentar:
- Conteo de ingresos y salidas del día.
- Acumulado del mes actual.
- Métricas trimestrales y anuales.
- Los últimos 4 movimientos registrados en portería en tiempo real.
- Accesos rápidos a los módulos operativos y de gestión.

## Criterios de Aceptación
- La vista realiza peticiones concurrentes a `GET /api/estadisticas/stats`, `GET /api/admin/statsQuarter` y `GET /api/admin/statsYear`.
- Si el usuario es `ADMIN`, se renderizan los widgets analíticos avanzados.
- La tabla de movimientos recientes muestra los 4 registros más recientes con foto/avatar, nombre, hora y tipo de movimiento.
- Los datos se refrescan reactivamente ante nuevos eventos.

## Metadatos
- **Prioridad**: Alta
- **Roles involucrados**: `ADMIN`
- **Reglas de negocio relacionadas**: `RN-ADM-001`, `RN-ADM-005`
- **Endpoints relacionados**: `GET /api/estadisticas/stats`, `GET /api/admin/statsQuarter`, `GET /api/admin/statsYear`
- **Componentes frontend relacionados**: `src/views/DashboardView.vue`
- **Controllers/Services relacionados**: `database/src/controllers/stats.controller.ts`, `database/src/controllers/admin.controller.ts`

---

# HU-ADM-002

## Historia
**Como** administrador del sistema  
**Quiero** eliminar de forma justificada un registro erróneo de ingreso o salida desde el módulo de corrección de registros  
**Para** depurar marcaciones indebidas garantizando la verificación obligatoria de la identidad del aprendiz y el motivo de la anulación.

## Descripción
En [`AdminRecordControlView.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/views/AdminRecordControlView.vue), el administrador consulta los movimientos y puede ejecutar la eliminación de un ingreso o salida erróneo. Para evitar borrados accidentales, el sistema despliega un modal de confirmación donde se debe escribir el número de documento o nombre completo del aprendiz y detallar una justificación obligatoria.

## Criterios de Aceptación
- La tabla muestra los movimientos con su estado operativo: *"Completo"* (tiene salida) o *"Pendiente"* (sesión aún abierta).
- Al presionar *"Eliminar ingreso"*, se abre el modal de verificación.
- El administrador debe digitar el documento de identidad o nombre del aprendiz coincidente con la fila.
- El campo *"Observación / Motivo"* es de diligenciamiento obligatorio (mínimo 5 caracteres).
- Al confirmar, se envía `DELETE /api/admin/ingresos/:id`.
- El backend elimina en cascada las dependencias asociadas y confirma la acción con código HTTP 200.
- La tabla se recarga inmediatamente sin el registro eliminado.

## Metadatos
- **Prioridad**: Alta
- **Roles involucrados**: `ADMIN`
- **Reglas de negocio relacionadas**: `RN-ADM-002`, `RN-ADM-003`
- **Endpoints relacionados**: `GET /api/admin/ingresos`, `DELETE /api/admin/ingresos/:id`, `DELETE /api/admin/salidas/:id`
- **Componentes frontend relacionados**: `src/views/AdminRecordControlView.vue`, `src/components/Modals/BaseModal.vue`
- **Controllers/Services relacionados**: `database/src/controllers/admin.controller.ts`

---

# HU-ADM-003

## Historia
**Como** administrador del sistema  
**Quiero** supervisar el módulo de máquinas prestadas, alternando entre computadores y vehículos  
**Para** auditar quién tiene en posesión activos de terceros, el documento del receptor y el tiempo transcurrido desde el registro.

## Descripción
En [`AdminBorrowedAssetsView.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/views/AdminBorrowedAssetsView.vue), el administrador dispone de una vista especializada para monitorear todos los equipos y vehículos que fueron ingresados bajo modalidad de préstamo. Muestra: Titular propietario, Receptor actual, DNI del receptor, Serial/Placa y una columna inteligente de tiempo relativo (*"Hoy"*, *"Hace 1 día"*, *"Hace X días"*, etc.).

## Criterios de Aceptación
- Conmutador para alternar entre *Computadores prestados* (`GET /api/admin/borrowed/computers`) y *Vehículos prestados* (`GET /api/admin/borrowed/vehicles`).
- Filtro por rangos de fecha predefinidos y barra de búsqueda por serial, placa o nombres.
- Cada registro visualiza la trazabilidad: quién prestó el equipo y quién lo ingresó al CTA.
- La columna *"Tiempo"* calcula la antigüedad relativa desde el momento del ingreso.

## Metadatos
- **Prioridad**: Alta
- **Roles involucrados**: `ADMIN`
- **Reglas de negocio relacionadas**: `RN-ADM-001`, `RN-ACT-001`
- **Endpoints relacionados**: `GET /api/admin/borrowed/computers`, `GET /api/admin/borrowed/vehicles`
- **Componentes frontend relacionados**: `src/views/AdminBorrowedAssetsView.vue`
- **Controllers/Services relacionados**: `database/src/controllers/admin.controller.ts`

---

# HU-ADM-004

## Historia
**Como** administrador del sistema  
**Quiero** consultar la lista general de aprendices con sus horas acumuladas de permanencia, total de sesiones y días sin asistir  
**Para** realizar seguimiento a la asistencia académica y detectar casos de deserción o ausentismo.

## Descripción
En [`AdminAprendicesView.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/views/AdminAprendicesView.vue), se listan todos los aprendices del CTA. Permite buscar por nombre/DNI, aplicar un filtro por cantidad de días de inasistencia, consultar el detalle de máquinas vinculadas y acceder al panel de asociaciones curriculares.

## Criterios de Aceptación
- La tabla consume `GET /api/admin/aprendices`.
- Cada fila muestra: Foto/Avatar, Nombre y Apellidos, DNI, Total de Sesiones, Horas Acumuladas, Última Visita, Días sin Asistir y Badges de condición (`[Monitor]`, `[Doble Formación]`).
- Selector de filtro por inasistencia: *Todos*, *Más de 3 días*, *Más de 7 días*, *Más de 15 días*.
- Botón *"Ver máquinas"* que abre [`ModalMachineDetails.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/components/AprendizUI/Modals/ModalMachineDetails.vue) identificando máquina principal y secundaria.
- Botón *"Asociaciones"* que abre el panel de vinculación académica.

## Metadatos
- **Prioridad**: Alta
- **Roles involucrados**: `ADMIN`
- **Reglas de negocio relacionadas**: `RN-ADM-001`, `RN-ADM-004`
- **Endpoints relacionados**: `GET /api/admin/aprendices`, `GET /api/admin/allMachines/:id`
- **Componentes frontend relacionados**: `src/views/AdminAprendicesView.vue`, `src/components/AprendizUI/Modals/ModalMachineDetails.vue`
- **Controllers/Services relacionados**: `database/src/controllers/admin.controller.ts`

---

# HU-ADM-005

## Historia
**Como** administrador del sistema  
**Quiero** recibir y gestionar alertas automáticas en el Centro de Alertas por inasistencia prolongada y préstamos detectados  
**Para** intervenir oportunamente ante alertas tempranas de deserción o irregularidades con equipos.

## Descripción
En [`AdminAlertsView.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/views/AdminAlertsView.vue), el sistema recopila y muestra los eventos críticos detectados por el algoritmo de seguimiento (`GET /api/admin/track`):
1. **Alertas de Inasistencia**: Aprendices que acumulan 3 o más días consecutivos sin asistir al centro.
2. **Alertas de Préstamos**: Aprendices que registraron computadores o vehículos pertenecientes a otros compañeros.

## Criterios de Aceptación
- El endpoint `GET /api/admin/track` consolida ambas categorías de alertas.
- Cada tarjeta de alerta visualiza: Nombre del aprendiz, Documento de identidad, Tipo de alerta (Inasistencia / Préstamo), Resumen explicativo del evento, Datos contextuales (días transcurridos o datos del propietario) y Marca temporal.
- Las alertas de inasistencia solo se disparan para aprendices con $\ge 3$ días de ausencia.

## Metadatos
- **Prioridad**: Alta
- **Roles involucrados**: `ADMIN`
- **Reglas de negocio relacionadas**: `RN-ADM-004`
- **Endpoints relacionados**: `GET /api/admin/track`
- **Componentes frontend relacionados**: `src/views/AdminAlertsView.vue`
- **Controllers/Services relacionados**: `database/src/controllers/admin.controller.ts`

---

# HU-ADM-006

## Historia
**Como** administrador del sistema  
**Quiero** gestionar las asociaciones académicas de un aprendiz en un panel interactivo (marcar como Monitor y vincular/desvincular formaciones)  
**Para** mantener actualizada la estructura curricular del aprendiz y permitirle registrar múltiples actividades.

## Descripción
Al presionar *"Asociaciones"* en la vista de aprendices, se abre [`ModalAsociaciones.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/components/AprendizUI/Modals/ModalAsociaciones.vue). Permite conmutar el switch de condición de Monitor (`toggleMonitor`) y asignar o desvincular programas de formación activos sin duplicar registros de aprendices.

## Criterios de Aceptación
- El modal consulta `GET /api/admin/aprendices/:id_aprendiz/formaciones`.
- Dispone de un interruptor interactivo para activar/desactivar `es_monitor` (`POST /api/admin/aprendices/toggleMonitor/:id_aprendiz`).
- Permite seleccionar una nueva ficha de formación del catálogo y agregarla (`POST /api/admin/aprendices/:id_aprendiz/formaciones`).
- Permite desvincular una ficha activa previa confirmación (`DELETE /api/admin/aprendices/:id_aprendiz/formaciones/:id_formacion`).
- Los cambios se reflejan inmediatamente en las tablas de aprendices y portería con las etiquetas `[Monitor]` y `[Doble Formación]`.

## Metadatos
- **Prioridad**: Alta
- **Roles involucrados**: `ADMIN`
- **Reglas de negocio relacionadas**: `RN-ADM-001`, `RN-ING-006`, `RN-ACAD-001`
- **Endpoints relacionados**: `GET /api/admin/aprendices/:id_aprendiz/formaciones`, `POST /api/admin/aprendices/toggleMonitor/:id_aprendiz`, `POST /api/admin/aprendices/:id_aprendiz/formaciones`, `DELETE /api/admin/aprendices/:id_aprendiz/formaciones/:id_formacion`
- **Componentes frontend relacionados**: `src/components/AprendizUI/Modals/ModalAsociaciones.vue`, `src/views/AdminAprendicesView.vue`
- **Controllers/Services relacionados**: `database/src/controllers/admin.controller.ts`
