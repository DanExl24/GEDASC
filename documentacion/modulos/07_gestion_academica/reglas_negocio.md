# Reglas de Negocio — Módulo 07: Gestión Curricular y Horarios Académicos

---

## 1. Integridad Curricular y Cardinalidad

### RN-ACAD-001: Relación de Programas Curriculares y Fichas
- **Descripción**: Un programa de formación curricular (`programa`) puede estar asociado a múltiples formaciones o fichas (`formaciones`). Sin embargo, toda formación debe pertenecer obligatoriamente a un único programa académico.
- **Motivo**: Respetar el modelo relacional institucional del SENA donde cada ficha es una cohorte de un diseño curricular específico.
- **Módulos afectados**: `07_gestion_academica`, `02_control_ingreso`.
- **Archivos donde se implementa**: [`database/src/controllers/admin.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/controllers/admin.controller.ts), [`database/migrations/fase6_horarios_academicos.sql`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/migrations/fase6_horarios_academicos.sql).
- **Endpoints relacionados**: `POST /api/admin/formaciones`, `PUT /api/admin/formaciones/:id_formacion`.
- **Historias de usuario relacionadas**: `HU-ACAD-001`, `HU-ACAD-003`.

---

### RN-ACAD-002: Unicidad del Identificador de Ficha
- **Descripción**: El identificador de formación (`id_formacion`), correspondiente al número oficial de ficha, debe ser único en la base de datos. No se permiten fichas duplicadas.
- **Motivo**: Garantizar que no existan colisiones entre cohortes académicas.
- **Módulos afectados**: `07_gestion_academica`.
- **Archivos donde se implementa**: [`database/src/controllers/admin.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/controllers/admin.controller.ts).
- **Endpoints relacionados**: `POST /api/admin/formaciones`.
- **Historias de usuario relacionadas**: `HU-ACAD-003`.

---

## 2. Horarios y Días Operativos

### RN-ACAD-003: Reutilización de Horarios Académicos
- **Descripción**: Toda formación debe tener exactamente un horario asignado (`id_horario`), mientras que un mismo horario puede ser reutilizado por múltiples formaciones activas o históricas.
- **Motivo**: Evitar la duplicación innecesaria de definiciones horarias idénticas en la base de datos.
- **Módulos afectados**: `07_gestion_academica`, `02_control_ingreso`.
- **Archivos donde se implementa**: [`database/src/controllers/admin.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/controllers/admin.controller.ts).
- **Endpoints relacionados**: `GET /api/admin/horarios`, `POST /api/admin/horarios`.
- **Historias de usuario relacionadas**: `HU-ACAD-002`, `HU-ACAD-003`.

---

### RN-ACAD-004: Cálculo Automático de Jornada por Rango Horario
- **Descripción**: La jornada del horario se infiere y almacena automáticamente en el backend a partir de la hora de inicio:
  - **Mañana**: `hora_inicio < 12:00:00`
  - **Tarde**: `hora_inicio >= 12:00:00 AND hora_inicio < 18:00:00`
  - **Noche**: `hora_inicio >= 18:00:00`
- **Motivo**: Estandarizar la categorización sin requerir selección manual susceptible a errores del usuario.
- **Módulos afectados**: `07_gestion_academica`, `02_control_ingreso`.
- **Archivos donde se implementa**: [`database/src/controllers/admin.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/controllers/admin.controller.ts#L88-L92).
- **Endpoints relacionados**: `POST /api/admin/horarios`.
- **Historias de usuario relacionadas**: `HU-ACAD-002`.

---

### RN-ACAD-005: Normalización Relacional de Días de Funcionamiento
- **Descripción**: Los días habilitados para un horario no se almacenan como cadenas o JSON desnormalizados, sino como tuplas individuales en la tabla relacional `horario_dia (id_horario, dia_semana)`.
- **Motivo**: Permitir consultas relacionales directas mediante `JOIN` en la validación en tiempo real del ingreso en portería.
- **Módulos afectados**: `07_gestion_academica`, `02_control_ingreso`.
- **Archivos donde se implementa**: [`database/src/controllers/admin.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/controllers/admin.controller.ts), [`database/src/controllers/entry.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/controllers/entry.controller.ts#L180-L203).
- **Endpoints relacionados**: `POST /api/admin/horarios`.
- **Historias de usuario relacionadas**: `HU-ACAD-002`, `HU-ING-007`.

---

## 3. Integridad Histórica

### RN-ACAD-006: Inmutabilidad Histórica de Horarios
- **Descripción**: Los cambios en la programación horaria de una formación no modifican registros históricos de ingresos ya consumados; la formación pasa a apuntar a una nueva tupla de horario a partir del cambio.
- **Motivo**: Preservar la verdad histórica de los accesos pasados del aprendiz.
- **Módulos afectados**: `07_gestion_academica`, `02_control_ingreso`, `05_historial_reportes`.
- **Archivos donde se implementa**: [`database/src/controllers/admin.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/controllers/admin.controller.ts).
- **Endpoints relacionados**: `PUT /api/admin/formaciones/:id_formacion`.
- **Historias de usuario relacionadas**: `HU-ACAD-005`.
 
---
 
## 4. Desvinculación y Matrícula

### RN-ACAD-007: Desvinculación Masiva Atómica de Aprendices
- **Descripción**: La operación de desvincular a todos los aprendices de una ficha formativa debe ejecutarse en una sola operación atómica en la base de datos (`DELETE FROM aprendiz_formacion WHERE id_formacion = $1 AND estado = 'activo'`), removiendo únicamente las asociaciones activas de dicha ficha sin alterar los registros maestros de los aprendices ni sus vinculaciones con otras fichas (en caso de doble formación o monitoría).
- **Motivo**: Permitir la depuración ágil de cohortes académicas de forma segura e inmediata, garantizando la integridad de datos de los aprendices en el sistema.
- **Módulos afectados**: `07_gestion_academica`, `06_administracion_monitoreo`.
- **Archivos donde se implementa**: [`database/src/controllers/admin.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/controllers/admin.controller.ts), [`src/Services/adminAcademic.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/Services/adminAcademic.ts), [`src/views/AdminHorariosView.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/views/AdminHorariosView.vue).
- **Endpoints relacionados**: `DELETE /api/admin/formaciones/:id_formacion/aprendices/todos`.
- **Historias de usuario relacionadas**: `HU-ACAD-004`.

---

### RN-ACAD-008: Bloqueo Estricto por Conflicto de Cruce de Horario en Doble Formación
- **Descripción**: Al actualizar las horas y días de un horario (`PUT /api/admin/horarios/:id_horario`) o reasignar el horario de una ficha (`PUT /api/admin/formaciones/:id_formacion`), el backend verifica si algún aprendiz matriculado en la cohorte posee otra formación activa que coincida en día de la semana y franja horaria (`hora_inicio < hora_fin_otra AND hora_fin > hora_inicio_otra`). En caso de detectarse solapamiento, la operación se rechaza con `HTTP 409 Conflict`, detallando el aprendiz, las fichas y los horarios en conflicto.
- **Motivo**: Prevenir inconsistencias académicas institucionales donde un aprendiz quede matriculado en dos ambientes presenciales simultáneos en el mismo rango de horas.
- **Módulos afectados**: `07_gestion_academica`, `06_administracion_monitoreo`.
- **Archivos donde se implementa**: [`database/src/controllers/admin.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/controllers/admin.controller.ts), [`src/views/AdminHorariosView.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/views/AdminHorariosView.vue).
- **Endpoints relacionados**: `PUT /api/admin/horarios/:id_horario`, `PUT /api/admin/formaciones/:id_formacion`.
- **Historias de usuario relacionadas**: `HU-ACAD-002`, `HU-ACAD-003`.

