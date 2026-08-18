# Módulo 02: Control Operativo de Ingreso y Reingreso de Aprendices

## 1. Descripción General

El **Módulo de Control Operativo de Ingreso y Reingreso** es el componente neurálgico del control de acceso en portería del **Centro de Tecnología de la Amazonía (CTA)**. Gestiona el registro fluido, seguro e inteligente de los aprendices mediante lectura óptica de código de barras (carné institucional con `Quagga.js`) o digitación manual del documento de identidad (DNI).

Implementa un **modelo basado en sesiones dinámicas** que soporta:
- Detección automática de sesión activa (cierre automático de sesión / salida inteligente).
- Múltiples reingresos en el mismo día con justificación obligatoria.
- Validación de jornadas operativas en tiempo real (Diurna, Tarde, Noche).
- Clasificación de actividad para Aprendices Monitores (Formación vs Monitoría).
- Validación contextual contra horarios académicos oficiales con margen de tolerancia (±30 min).
- Registro obligatorio del motivo de visita para ingresos extraordinarios fuera de horario.
- Selección interactiva de formación cuando el aprendiz cuenta con doble titulación compatible.
- Simulación horaria para auditoría y pruebas operativas.

---

## 2. Arquitectura y Componentes del Módulo

### 2.1 Backend (Node.js / Express / TypeScript)
- **Rutas**: [`database/src/routes/entry.routes.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/routes/entry.routes.ts), [`database/src/routes/jornada.routes.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/routes/jornada.routes.ts)
- **Controladores**: [`database/src/controllers/entry.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/controllers/entry.controller.ts), [`database/src/controllers/jornada.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/controllers/jornada.controller.ts), [`database/src/controllers/admin.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/controllers/admin.controller.ts)
- **Base de Datos**: Tablas `aprendiz`, `detalles_ingreso`, `detalles_salida`, `aprendiz_formacion`, `formaciones`, `programa`, `horario`, `horario_dia`.

### 2.2 Frontend (Vue 3 / TypeScript / Pinia)
- **Vistas**: [`src/views/GeneralEntryView.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/views/GeneralEntryView.vue)
- **Composables**: [`src/composables/useAprendiz.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/composables/useAprendiz.ts), [`src/composables/useScan.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/composables/useScan.ts), [`src/composables/useJornada.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/composables/useJornada.ts)
- **Modales Operativos**:
  - [`src/components/AprendizUI/Modals/ModalRegisterManual.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/components/AprendizUI/Modals/ModalRegisterManual.vue) (Ingreso manual por DNI)
  - [`src/components/AprendizUI/Modals/ModalConfirm.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/components/AprendizUI/Modals/ModalConfirm.vue) (Confirmación de tipo de sesión para monitores)
  - [`src/components/AprendizUI/Modals/ModalSelectFormation.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/components/AprendizUI/Modals/ModalSelectFormation.vue) (Selección de ficha activa)
  - [`src/components/AprendizUI/Modals/ModalVisitReason.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/components/AprendizUI/Modals/ModalVisitReason.vue) (Motivo de visita fuera de horario)
  - [`src/components/AprendizUI/Modals/ModalReentryReason.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/components/AprendizUI/Modals/ModalReentryReason.vue) (Motivo justificado de reingreso)
  - [`src/components/Modals/ModalSimularHora.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/components/Modals/ModalSimularHora.vue) (Simulación temporal de entorno)

---

## 3. Endpoints del Módulo

| Método | Endpoint | Descripción | Roles Permitidos |
|---|---|---|---|
| `GET` | `/api/registroIngresos/verificarEntrada/:documento` | Evalúa el estado del aprendiz (sesión activa, reingreso, monitor, horarios coincidentes) | `CELADOR`, `ADMIN` |
| `POST` | `/api/registroIngresos/addEntry/:documento` | Registra el ingreso formal del aprendiz o ejecuta salida si tenía sesión abierta | `CELADOR`, `ADMIN` |
| `GET` | `/api/registroIngresos/ingresoManual/:documento` | Consulta datos personales y formativos del aprendiz para precargar el modal manual | `CELADOR`, `ADMIN` |
| `GET` | `/api/registroIngresos/historial` | Lista todos los ingresos registrados en la jornada de hoy | `CELADOR`, `ADMIN` |
| `GET` | `/api/registroIngresos/buscar` | Búsqueda en tiempo real por documento, nombre o apellido en ingresos de hoy | `CELADOR`, `ADMIN` |
| `GET` | `/api/jornadaTime/tiempoJornada` | Consulta la hora del servidor y la jornada operativa vigente (Diurna/Tarde/Noche) | `CELADOR`, `ADMIN` |
| `POST` | `/api/admin/simularHora` | Permite fijar una hora virtual para validaciones y pruebas de horarios | `ADMIN` |
| `GET` | `/api/admin/simularHora` | Obtiene la hora simulada actual o null si se usa la hora real | `ADMIN`, `CELADOR` |

---

## 4. Estructura de Documentación del Módulo

- [`historias_usuario.md`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/documentacion/modulos/02_control_ingreso/historias_usuario.md): Historias de usuario completas con criterios de aceptación y trazabilidad.
- [`reglas_negocio.md`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/documentacion/modulos/02_control_ingreso/reglas_negocio.md): Catálogo de reglas de validación, jornadas, horarios y reingresos.
- [`casos_uso.md`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/documentacion/modulos/02_control_ingreso/casos_uso.md): Casos de uso detallados de ingresos regulares, reingresos y accesos extraordinarios.
