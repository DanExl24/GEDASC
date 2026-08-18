# Historias de Usuario — Módulo 07: Gestión Curricular y Horarios Académicos

---

# HU-ACAD-001

## Historia
**Como** administrador del sistema  
**Quiero** gestionar el catálogo de programas curriculares (crear, editar, listar)  
**Para** registrar los programas académicos oficiales ofertados por el CTA (ej. ADSO, Gestión Empresarial, etc.).

## Descripción
En [`AdminProgramasView.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/views/AdminProgramasView.vue), el administrador administra el catálogo maestro de programas. Permite registrar el nombre oficial, versión curricular, nivel formativo (Técnico, Tecnólogo, Especialización) y estado (Activo / Inactivo).

## Criterios de Aceptación
- La tabla consume `GET /api/admin/programas`.
- Permite abrir el formulario de creación (`POST /api/admin/programas`) con campos: `nombre_programa`, `version`, `nivel`, `estado`.
- Permite editar programas existentes mediante `PUT /api/admin/programas/:id_programa`.
- Valida que el nombre del programa no esté vacío.
- Los programas activos quedan disponibles inmediatamente para ser asociados a fichas de formación.

## Metadatos
- **Prioridad**: Alta
- **Roles involucrados**: `ADMIN`
- **Reglas de negocio relacionadas**: `RN-ACAD-001`, `RN-ACAD-002`
- **Endpoints relacionados**: `GET /api/admin/programas`, `POST /api/admin/programas`, `PUT /api/admin/programas/:id_programa`
- **Componentes frontend relacionados**: `src/views/AdminProgramasView.vue`
- **Controllers/Services relacionados**: `database/src/controllers/admin.controller.ts`

---

# HU-ACAD-002

## Historia
**Como** administrador del sistema  
**Quiero** crear y configurar horarios reutilizables seleccionando los días de la semana y rango de horas  
**Para** que el sistema calcule automáticamente la jornada y los horarios puedan ser reutilizados por múltiples fichas.

## Descripción
En [`AdminHorariosView.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/views/AdminHorariosView.vue), el administrador gestiona los horarios de clase. Define la hora de inicio, hora de finalización y marca los días de funcionamiento (Lunes a Domingo). El sistema calcula automáticamente la jornada (*Mañana*, *Tarde* o *Noche*) a partir del rango horario y normaliza los días en la tabla `horario_dia`.

## Criterios de Aceptación
- El modal solicita: `hora_inicio`, `hora_fin` y selección múltiple de días (`dias: ['Lunes', 'Martes', ...]`).
- El backend evalúa la `hora_inicio` y `hora_fin` para inferir la jornada:
  - *Mañana*: Inicio antes de las 12:00
  - *Tarde*: Inicio entre 12:00 y 18:00
  - *Noche*: Inicio posterior a las 18:00
- `POST /api/admin/horarios` inserta el horario y crea los registros hijos en `horario_dia`.
- El nuevo horario queda disponible en el listado para ser seleccionado en las fichas.

## Metadatos
- **Prioridad**: Alta
- **Roles involucrados**: `ADMIN`
- **Reglas de negocio relacionadas**: `RN-ACAD-003`, `RN-ACAD-004`, `RN-ACAD-005`
- **Endpoints relacionados**: `GET /api/admin/horarios`, `POST /api/admin/horarios`
- **Componentes frontend relacionados**: `src/views/AdminHorariosView.vue`
- **Controllers/Services relacionados**: `database/src/controllers/admin.controller.ts`

---

# HU-ACAD-003

## Historia
**Como** administrador del sistema  
**Quiero** gestionar las fichas de formación académica vinculándolas a su programa curricular y horario asignado  
**Para** establecer las programaciones oficiales de cada grupo de aprendices en el CTA.

## Descripción
Permite administrar las formaciones (fichas). Cada formación representa una cohorte específica de un programa curricular y cuenta con un número único de ficha (`id_formacion`), un programa asociado (`id_programa`), un horario asignado (`id_horario`), fecha de inicio, fecha de fin y estado (*Activa* / *Finalizada*).

## Criterios de Aceptación
- La vista lista las formaciones combinadas con los nombres de programa y horarios (`GET /api/admin/formaciones`).
- Permite crear una nueva ficha (`POST /api/admin/formaciones`) validando que el número de ficha no exista previamente.
- Permite editar las fechas, estado o reasignar horario (`PUT /api/admin/formaciones/:id_formacion`).
- Permite eliminar una ficha si no tiene registros históricos o aprendices activos (`DELETE /api/admin/formaciones/:id_formacion`).

## Metadatos
- **Prioridad**: Alta
- **Roles involucrados**: `ADMIN`
- **Reglas de negocio relacionadas**: `RN-ACAD-001`, `RN-ACAD-002`, `RN-ACAD-003`, `RN-ACAD-006`
- **Endpoints relacionados**: `GET /api/admin/formaciones`, `POST /api/admin/formaciones`, `PUT /api/admin/formaciones/:id_formacion`, `DELETE /api/admin/formaciones/:id_formacion`
- **Componentes frontend relacionados**: `src/views/AdminHorariosView.vue`
- **Controllers/Services relacionados**: `database/src/controllers/admin.controller.ts`

---

# HU-ACAD-004

## Historia
**Como** administrador del sistema  
**Quiero** consultar, vincular y desvincular aprendices rápidamente desde el modal de una ficha de formación  
**Para** matricular grupos completos de aprendices o dar de baja a quienes cambian de ficha.

## Descripción
En la tabla de formaciones, al presionar el botón *"Ver Aprendices"* en una ficha, se abre una ventana modal que lista todos los aprendices inscritos en esa cohorte (`GET /api/admin/formaciones/:id_formacion/aprendices`). Permite buscar aprendices no matriculados para vincularlos rápidamente o retirar a un aprendiz con un solo clic.

## Criterios de Aceptación
- El modal muestra la lista de aprendices matriculados con su nombre y documento.
- Dispone de un buscador para incorporar nuevos aprendices mediante `POST /api/admin/aprendices/:id_aprendiz/formaciones`.
- Dispone de una acción individual para desvincular mediante `DELETE /api/admin/aprendices/:id_aprendiz/formaciones/:id_formacion`.
- **Desvinculación Masiva**: Dispone del botón *"Desvincular Todos"* con diálogo de confirmación que elimina todas las asociaciones activas de la ficha de forma atómica mediante `DELETE /api/admin/formaciones/:id_formacion/aprendices/todos`.
- La lista se actualiza reactivamente sin necesidad de recargar la página.

## Metadatos
- **Prioridad**: Alta
- **Roles involucrados**: `ADMIN`
- **Reglas de negocio relacionadas**: `RN-ACAD-001`, `RN-ING-009`
- **Endpoints relacionados**: `GET /api/admin/formaciones/:id_formacion/aprendices`, `POST /api/admin/aprendices/:id_aprendiz/formaciones`, `DELETE /api/admin/aprendices/:id_aprendiz/formaciones/:id_formacion`, `DELETE /api/admin/formaciones/:id_formacion/aprendices/todos`
- **Componentes frontend relacionados**: `src/views/AdminHorariosView.vue`
- **Controllers/Services relacionados**: `database/src/controllers/admin.controller.ts`

---

# HU-ACAD-005

## Historia
**Como** sistema de gestión académica y control de acceso  
**Quiero** preservar la inmutabilidad histórica de los horarios asociados a las formaciones  
**Para** garantizar que una modificación en el horario de una ficha no altere la evaluación de los accesos pasados ya registrados.

## Descripción
Establece la regla de inmutabilidad: cuando una formación cambia de horario en el CTA, el sistema no sobreescribe el horario anterior; en su lugar, se asocia el nuevo `id_horario` a la ficha a partir de la fecha de cambio, mientras que los registros de acceso históricos en `detalles_ingreso` conservan la validez de las horas en que ocurrieron.

## Criterios de Aceptación
- La edición de horario en una formación actualiza la clave foránea `formaciones.id_horario`.
- Las consultas históricas continúan evaluando la coherencia con base en la marca temporal grabada en cada sesión.
- No se produce recálculo retroactivo de visitas pasadas.

## Metadatos
- **Prioridad**: Media
- **Roles involucrados**: `ADMIN`
- **Reglas de negocio relacionadas**: `RN-ACAD-006`, `RN-HIST-002`
- **Endpoints relacionados**: `PUT /api/admin/formaciones/:id_formacion`
- **Componentes frontend relacionados**: `src/views/AdminHorariosView.vue`
- **Controllers/Services relacionados**: `database/src/controllers/admin.controller.ts`
