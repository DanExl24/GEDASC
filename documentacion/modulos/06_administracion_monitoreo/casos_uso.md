# Casos de Uso — Módulo 06: Administración, Monitoreo y Alertas

---

## CU-ADM-01: Corrección y Eliminación Controlada de un Registro de Ingreso

- **Actor Principal**: Administrador del sistema
- **Precondiciones**:
  - El usuario está autenticado con rol `ADMIN`.
  - Existe un registro de ingreso erróneo (por ejemplo, duplicado o marcado por equivocación).
- **Disparador**: El administrador detecta una anomalía y accede a [`AdminRecordControlView.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/views/AdminRecordControlView.vue).

### Flujo Principal:
1. El administrador busca el registro por el documento o nombre del aprendiz.
2. La tabla muestra la fila del ingreso con su hora, aprendiz y estado.
3. El administrador presiona el botón *"Eliminar ingreso"*.
4. Se despliega una ventana modal de confirmación obligatoria.
5. El administrador escribe el documento o nombre completo del aprendiz tal como figura en el registro para verificar identidad.
6. El administrador digita el motivo de la corrección (ej. *"Marcación de prueba en portería"*).
7. El administrador presiona *"Confirmar eliminación"*.
8. El frontend envía la petición `DELETE /api/admin/ingresos/:id`.
9. El backend valida el token de administrador, elimina en cascada las salidas y máquinas vinculadas a la sesión y retorna status `200 OK`.
10. La tabla se actualiza de inmediato y el registro desaparece de la vista.

### Flujos de Excepción:
- **FE-1 (Documento de verificación no coincide)**:
  1. En el paso 5, el texto digitado no coincide con el aprendiz del registro.
  2. El botón de confirmación permanece deshabilitado.
- **FE-2 (Motivo vacío o insuficiente)**:
  1. En el paso 6, el motivo tiene menos de 5 caracteres.
  2. El sistema muestra un mensaje de error y no permite confirmar.

- **Postcondiciones**:
  - El registro de acceso erróneo es eliminado de la base de datos sin alterar al aprendiz maestro.

---

## CU-ADM-02: Monitoreo y Gestión del Panel de Alertas

- **Actor Principal**: Administrador del sistema
- **Precondiciones**:
  - Existen aprendices con inasistencia $\ge 3$ días o préstamos de activos registrados.
- **Disparador**: El administrador ingresa a [`AdminAlertsView.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/views/AdminAlertsView.vue).

### Flujo Principal:
1. La vista carga automáticamente las alertas desde `GET /api/admin/track`.
2. El sistema clasifica visualmente las alertas:
   - Alertas rojas / advertencia: *Inasistencia prolongada (3+ días)*.
   - Alertas amarillas: *Préstamo de activos entre aprendices*.
3. El administrador revisa el detalle de un aprendiz con 5 días de inasistencia.
4. El administrador presiona el enlace del aprendiz para acceder a su ficha completa y coordinar con el instructor o coordinación académica.

- **Postcondiciones**:
  - El administrador obtiene un panorama claro de las alertas críticas para la toma de decisiones.

---

## CU-ADM-04: Gestión Individual y Masiva del Directorio de Aprendices

- **Actor Principal**: Administrador del sistema
- **Precondiciones**:
  - El usuario está autenticado con rol `ADMIN`.
- **Disparador**: El administrador ingresa a [`AdminAprendicesView.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/views/AdminAprendicesView.vue).

### Flujo Principal A (Registro Individual):
1. El administrador presiona el botón **`+ Registrar Aprendiz`**.
2. Se despliega el modal [`ModalAprendizForm.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/components/Modals/ModalAprendizForm.vue).
3. El administrador ingresa Documento de identidad, Nombre(s) y Apellido(s).
4. Opcionalmente, selecciona la cohorte/ficha de formación inicial a la que pertenece el aprendiz.
5. Presiona **`Registrar Aprendiz`**.
6. El frontend envía `POST /api/admin/aprendices`.
7. El backend inserta en `aprendiz` (y opcionalmente en `aprendiz_formacion`), confirmando con HTTP 201.
8. La tabla de aprendices se actualiza reactivamente.

### Flujo Principal B (Importación Masiva desde XLSX o JSON):
1. El administrador presiona **`📥 Importar Masivo (.xlsx / .json)`**.
2. Se despliega el modal [`ModalImportAprendicesGeneral.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/components/Modals/ModalImportAprendicesGeneral.vue).
3. (Opcional) El administrador descarga la plantilla de muestra `plantilla_aprendices_general.xlsx` o `.json`.
4. El administrador arrastra o selecciona su archivo estructurado.
5. El sistema previsualiza los primeros registros leídos y el total detectado.
6. El administrador presiona **`Registrar N Aprendices`**.
7. El backend procesa el lote (`POST /api/admin/aprendices/masivo`), discriminando nuevos vs ya existentes.
8. El modal muestra el panel de resultados (*Total*, *Creados*, *Ya Registrados*, *Errores*) con tabla de novedades filtrable.
9. El administrador presiona **`Finalizar y Volver`** y la tabla se actualiza.

### Flujo Alternativo (Eliminación con Protección de Integridad):
1. En la fila de un aprendiz, el administrador presiona el botón 🗑️ (Eliminar).
2. El sistema solicita confirmación en diálogo de seguridad.
3. El backend verifica si el aprendiz tiene historial en `detalles_ingreso`.
4. Si tiene historial, realiza una baja lógica (`estado = false`) protegiendo los registros históricos y notifica al administrador (`RN-ADM-008`).
5. Si no tiene historial, elimina las asociaciones accesorias y borra el registro de la base de datos.

