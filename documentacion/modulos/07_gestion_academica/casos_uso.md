# Casos de Uso — Módulo 07: Gestión Curricular y Horarios Académicos

---

## CU-ACAD-01: Creación de Horario Académico con Días Operativos

- **Actor Principal**: Administrador del sistema
- **Precondiciones**:
  - El usuario está autenticado con rol `ADMIN`.
- **Disparador**: El administrador ingresa a [`AdminHorariosView.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/views/AdminHorariosView.vue) para configurar una franja horaria.

### Flujo Principal:
1. El administrador presiona el botón *"Crear Horario"*.
2. Se abre el formulario modal.
3. El administrador ingresa la hora de inicio: `07:00` y la hora de finalización: `13:00`.
4. El administrador marca los días de clase: *Lunes*, *Martes*, *Miércoles*, *Jueves*, *Viernes*.
5. El administrador presiona *"Guardar Horario"*.
6. El frontend envía la petición `POST /api/admin/horarios` con el payload `{ hora_inicio: '07:00', hora_fin: '13:00', dias: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'] }`.
7. El backend calcula la jornada (`'Mañana'` debido a inicio antes de las 12:00), inserta en la tabla `horario` y crea las 5 tuplas en `horario_dia`.
8. El sistema responde con status `201 Created` y la tabla de horarios se actualiza inmediatamente.

- **Postcondiciones**:
  - El nuevo horario queda disponible para ser asignado a una o más fichas de formación.

---

## CU-ACAD-02: Vinculación Masiva de Aprendices a una Ficha de Formación

- **Actor Principal**: Administrador del sistema
- **Precondiciones**:
  - La ficha de formación (ej. *2823456 - ADSO*) y los aprendices ya existen en el sistema.
- **Disparador**: El administrador necesita matricular nuevos aprendices en una cohorte.

### Flujo Principal:
1. En [`AdminHorariosView.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/views/AdminHorariosView.vue), el administrador presiona el botón *"Ver Aprendices"* en la fila de la ficha deseada.
2. Se despliega el modal interactivo listando los aprendices actualmente vinculados (`GET /api/admin/formaciones/:id_formacion/aprendices`).
3. En el buscador del modal, el administrador escribe el documento o nombre del aprendiz a vincular.
4. El administrador selecciona el aprendiz y presiona *"Vincular a Ficha"*.
5. El frontend envía `POST /api/admin/aprendices/:id_aprendiz/formaciones` con `{ id_formacion: '2823456' }`.
6. El backend inserta la tupla en `aprendiz_formacion` con `estado = 'activo'`.
7. El modal actualiza la lista de aprendices matriculados.

- **Postcondiciones**:
  - El aprendiz queda formalmente matriculado en la ficha y sus ingresos en portería serán evaluados contra el horario de dicha formación.
