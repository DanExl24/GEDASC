# Casos de Uso — Módulo 05: Historial y Reportes Exportables

---

## CU-HIST-01: Generación y Descarga de Reporte Institucional en PDF

- **Actor Principal**: Celador / Administrador
- **Precondiciones**:
  - El usuario está autenticado con sesión activa.
  - Existen registros de movimientos en la base de datos para los criterios seleccionados.
- **Disparador**: El usuario accede al centro de reportes ([`RecordHistory.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/views/RecordHistory.vue)) para generar un informe.

### Flujo Principal:
1. El usuario selecciona la tarjeta *"Registro Histórico Consolidado"*.
2. El usuario selecciona el lapso de fechas: *"Este mes"* y filtra por el programa de formación *"ADSO (Análisis y Desarrollo de Software)"*.
3. El panel de resumen a la derecha muestra en tiempo real los parámetros aplicados y el total preliminar de registros.
4. El usuario presiona el botón *"Exportar a PDF"*.
5. El frontend envía la petición `POST /api/historico/historialGeneral` con los filtros.
6. El backend ejecuta la consulta relacional combinada y retorna el dataset ordenado.
7. El servicio [`usePdfExport.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/Services/exports/usePdfExport.ts) procesa los datos, genera el diseño con membrete oficial, tabla de aprendices, horarios y firmas, e inicia la descarga automática del archivo `Reporte_Historico_ADSO_[FECHA].pdf`.

### Flujos Alternativos:
- **FA-1 (Exportación a Excel)**:
  1. En el paso 4, el usuario presiona *"Exportar a Excel"*.
  2. El sistema procesa el dataset y genera un archivo `.xlsx` estructurado con columnas y formatos numéricos adecuados.

### Flujos de Excepción:
- **FE-1 (Sin datos para exportar)**:
  1. En el paso 5, la consulta retorna cero registros.
  2. El sistema muestra una alerta informativa: *"No hay información disponible para exportar con los filtros seleccionados"* y no genera el archivo.

- **Postcondiciones**:
  - Se genera y descarga el documento oficial de reporte.
