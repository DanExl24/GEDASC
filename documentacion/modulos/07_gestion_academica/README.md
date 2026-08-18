# Módulo 07: Gestión Curricular y Horarios Académicos

## 1. Descripción General

El **Módulo de Gestión Curricular y Horarios Académicos** incorpora la estructura formativa institucional del **Centro de Tecnología de la Amazonía (CTA)** al sistema **GEDASC**. Permite parametrizar los programas de formación, los horarios reutilizables de clase, los días operativos de la semana y las fichas de formación académica (grupos/cohortes).

Este módulo es el motor que alimenta la **validación contextual inteligente de accesos**, garantizando que el sistema conozca en todo momento a qué programa y horario pertenece cada aprendiz matriculado.

Capacidades principales:
- **Gestión Curricular de Programas**: Catálogo institucional de programas formativos con versión, nivel de titulación y estado.
- **Gestión de Horarios Reutilizables**: Definición de rangos de horas y días habilitados (`horario_dia`) con cálculo automático de jornada (*Mañana*, *Tarde*, *Noche*).
- **Gestión de Fichas de Formación**: Registro y administración de fichas asociadas a un programa curricular y a un horario.
- **Vinculación Rápida de Aprendices**: Asignación masiva y desvinculación de aprendices por ficha académica.
- **Inmutabilidad Histórica**: Preservación estricta de la trazabilidad horaria histórica.

---

## 2. Arquitectura y Componentes del Módulo

### 2.1 Backend (Node.js / Express / TypeScript)
- **Rutas**: [`database/src/routes/admin.routes.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/routes/admin.routes.ts)
- **Controladores**: [`database/src/controllers/admin.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/controllers/admin.controller.ts)
- **Middlewares**: [`database/src/middlewares/admin.middleware.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/middlewares/admin.middleware.ts)
- **Base de Datos**: Tablas `programa`, `horario`, `horario_dia`, `formaciones`, `aprendiz_formacion`, `aprendiz`.

### 2.2 Frontend (Vue 3 / TypeScript / Pinia)
- **Vistas**:
  - [`src/views/AdminProgramasView.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/views/AdminProgramasView.vue)
  - [`src/views/AdminHorariosView.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/views/AdminHorariosView.vue)
- **Modales Curriculares**:
  - Modales de Programas (`ModalAddProgram.vue`, `ModalEditProgram.vue`)
  - Modales de Horarios (`ModalAddHorario.vue`, `ModalEditHorario.vue`)
  - Modales de Fichas/Formaciones (`ModalAddFormation.vue`, `ModalEditFormation.vue`)
  - Modal de Aprendices por Ficha (`ModalLearnersByFormation.vue`)

---

## 3. Endpoints del Módulo

| Método | Endpoint | Descripción | Roles Permitidos |
|---|---|---|---|
| `GET` | `/api/admin/programas` | Lista los programas curriculares registrados | `ADMIN` |
| `POST` | `/api/admin/programas` | Crea un nuevo programa curricular | `ADMIN` |
| `PUT` | `/api/admin/programas/:id_programa` | Actualiza un programa curricular existente | `ADMIN` |
| `GET` | `/api/admin/horarios` | Obtiene el catálogo de horarios con sus días asociados | `ADMIN` |
| `POST` | `/api/admin/horarios` | Crea un nuevo horario y normaliza sus días en `horario_dia` | `ADMIN` |
| `GET` | `/api/admin/formaciones` | Consulta las fichas de formación con su programa y horario | `ADMIN` |
| `POST` | `/api/admin/formaciones` | Registra una nueva ficha de formación | `ADMIN` |
| `PUT` | `/api/admin/formaciones/:id_formacion` | Actualiza los datos o el horario de una ficha | `ADMIN` |
| `DELETE` | `/api/admin/formaciones/:id_formacion` | Elimina una ficha de formación si no tiene restricciones | `ADMIN` |
| `GET` | `/api/admin/formaciones/:id_formacion/aprendices` | Lista todos los aprendices vinculados a la ficha | `ADMIN` |

---

## 4. Estructura de Documentación del Módulo

- [`historias_usuario.md`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/documentacion/modulos/07_gestion_academica/historias_usuario.md): Historias de usuario completas con criterios de aceptación y trazabilidad.
- [`reglas_negocio.md`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/documentacion/modulos/07_gestion_academica/reglas_negocio.md): Catálogo de reglas de integridad curricular, horarios e inmutabilidad.
- [`casos_uso.md`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/documentacion/modulos/07_gestion_academica/casos_uso.md): Casos de uso de creación de oferta académica y vinculación de aprendices.
