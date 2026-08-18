# Historias de Usuario — Módulo 05: Historial y Reportes Exportables

---

# HU-HIST-001

## Historia
**Como** celador o administrador  
**Quiero** consultar la tabla de registro histórico de ingresos y salidas de los aprendices  
**Para** revisar los movimientos pasados y auditar las sesiones de acceso al centro.

## Descripción
Permite visualizar la cronología completa de accesos en [`HistoryView.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/views/HistoryView.vue). Cada registro muestra: Nombres, Apellidos, DNI, Programa de Formación, Hora de Ingreso, Hora de Salida, Indicador de Posesión de Máquina y Botón para ver el Detalle de Sesión.

## Criterios de Aceptación
- La vista realiza una petición inicial a `GET /api/historico/historial`.
- La tabla muestra la información ordenada cronológicamente de forma descendente.
- Los campos de hora se formatean en estándar de 12 horas con indicador AM/PM.
- Si el aprendiz ingresó con una máquina, se muestra la etiqueta *"Posee máquina"* en verde; de lo contrario, *"Sin máquina"* en gris.
- El módulo opera en modo de solo lectura (no permite crear ni eliminar registros desde esta vista).

## Metadatos
- **Prioridad**: Alta
- **Roles involucrados**: `CELADOR`, `ADMIN`
- **Reglas de negocio relacionadas**: `RN-HIST-001`, `RN-HIST-002`
- **Endpoints relacionados**: `GET /api/historico/historial`
- **Componentes frontend relacionados**: `src/views/HistoryView.vue`, `src/components/AprendizUI/HistoryAprendizTable.vue`
- **Controllers/Services relacionados**: `database/src/controllers/history.controller.ts`

---

# HU-HIST-002

## Historia
**Como** celador o administrador  
**Quiero** filtrar el historial de movimientos mediante un rango de fechas, programa curricular y términos de búsqueda de aprendiz  
**Para** localizar con precisión los accesos de grupos formativos o aprendices específicos en períodos determinados.

## Descripción
Dispone de un panel de filtros avanzados en la cabecera del historial:
- Selector de lapsos temporales (*Hoy*, *Ayer*, *Esta semana*, *Semana pasada*, *Este mes*, *Mes pasado*, *Este trimestre* o rango personalizado).
- Selector dinámico de programas de formación (poblado vía `GET /api/historico/opcionesFiltros`).
- Buscador textual interactivo por nombre, apellido o DNI.

## Criterios de Aceptación
- Al modificar cualquier filtro, se envía `POST /api/historico/historialGeneral` con el payload de criterios.
- El backend construye dinámicamente la consulta relacional con `QueryBuilder` aplicando las cláusulas `WHERE`.
- La tabla se actualiza mostrando únicamente los registros coincidentes.
- Si no hay resultados, se muestra un mensaje informativo: *"No se encontraron movimientos para los filtros seleccionados"*.
- El botón *"Limpiar filtros"* restaura la vista a los valores por defecto.

## Metadatos
- **Prioridad**: Alta
- **Roles involucrados**: `CELADOR`, `ADMIN`
- **Reglas de negocio relacionadas**: `RN-HIST-002`, `RN-HIST-004`
- **Endpoints relacionados**: `POST /api/historico/historialGeneral`, `GET /api/historico/opcionesFiltros`
- **Componentes frontend relacionados**: `src/composables/History/useHistoryFilters.ts`, `src/views/HistoryView.vue`
- **Controllers/Services relacionados**: `database/src/controllers/history.controller.ts`

---

# HU-HIST-003

## Historia
**Como** celador o administrador  
**Quiero** abrir el modal de detalle de una sesión histórica específica  
**Para** inspeccionar los metadatos completos del acceso: número de sesión del día, tipo de sesión (Formación/Monitoría), motivo de reingreso, motivo de visita y horas exactas de permanencia.

## Descripción
Al hacer clic en el botón de sesión o de detalle en la tabla de historial, el sistema despliega una ventana modal que recopila la trazabilidad detallada de esa sesión en particular, incluyendo el detalle de activos y firmas si los hubo.

## Criterios de Aceptación
- Al presionar *"Ver detalle"* o el botón de sesión, se consulta `GET /api/historico/historialMaquinas/:id_detallemaquina` si posee máquina.
- El modal visualiza:
  - DNI y nombre del aprendiz.
  - Programa académico o Motivo de visita extraordinario.
  - Tipo de actividad (*Formación Regular* o *Monitoría*).
  - Justificación de reingreso (si fue un reingreso en el día).
  - Hora de entrada, hora de salida y tiempo total de permanencia (calculado en horas y minutos).
  - Si hubo equipo: Marca, serial/placa, imagen de firma de entrada y firma de salida con sus marcas de tiempo.

## Metadatos
- **Prioridad**: Alta
- **Roles involucrados**: `CELADOR`, `ADMIN`
- **Reglas de negocio relacionadas**: `RN-HIST-002`, `RN-ACT-007`
- **Endpoints relacionados**: `GET /api/historico/historialMaquinas/:id_detallemaquina`
- **Componentes frontend relacionados**: `src/components/AprendizUI/Modals/ModalHistoryMachineDetails.vue`, `src/views/HistoryView.vue`
- **Controllers/Services relacionados**: `database/src/controllers/history.controller.ts`

---

# HU-HIST-004

## Historia
**Como** celador o administrador  
**Quiero** generar y exportar informes institucionales en formato PDF y Excel (`.xlsx`) desde el centro de reportes  
**Para** entregar soportes de asistencia y control de acceso a la coordinación académica y directivas del CTA.

## Descripción
En la vista [`RecordHistory.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/views/RecordHistory.vue), el usuario selecciona entre 4 tipos de reporte:
1. **Reporte de Ingresos**: Lista detallada de accesos con hora y estado.
2. **Reporte de Salidas**: Registro de egresos con tiempos de permanencia.
3. **Registro Histórico Consolidado**: Trazabilidad completa entrada/salida.
4. **Reporte de Activos**: Inventario de movimientos de computadores y vehículos.

Permite configurar los filtros, visualizar un resumen dinámico de los parámetros activos y descargar el archivo generado en PDF o Excel con membrete institucional.

## Criterios de Aceptación
- El usuario selecciona el tipo de informe mediante tarjetas interactivas.
- El formulario adapta dinámicamente sus campos de filtro según el reporte elegido.
- Un panel lateral muestra el resumen en tiempo real de la configuración elegida.
- Al presionar *"Exportar a PDF"*, se genera el documento con diseño corporativo SENA/CTA, cabeceras de columnas y numeración de páginas.
- Al presionar *"Exportar a Excel"*, se descarga un archivo `.xlsx` estructurado listo para análisis estadístico.
- El botón *"Limpiar configuración"* reinicia los parámetros del reporte actual sin alterar los otros tipos.

## Metadatos
- **Prioridad**: Alta
- **Roles involucrados**: `CELADOR`, `ADMIN`
- **Reglas de negocio relacionadas**: `RN-HIST-003`, `RN-HIST-004`
- **Endpoints relacionados**: `POST /api/historico/historialGeneral`, `POST /api/historico/historialMaquinas`
- **Componentes frontend relacionados**: `src/views/RecordHistory.vue`, `src/composables/History/useRecordReport.ts`, `src/Services/exports/usePdfExport.ts`
- **Controllers/Services relacionados**: `database/src/controllers/history.controller.ts`
