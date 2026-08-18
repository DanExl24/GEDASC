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
