# Módulo 03: Control Operativo de Salida de Aprendices

## 1. Descripción General

El **Módulo de Control Operativo de Salida de Aprendices** gestiona el registro del egreso físico de los aprendices del **Centro de Tecnología de la Amazonía (CTA)**. Cierra formalmente la sesión de acceso creada durante el ingreso, calcula el tiempo exacto de permanencia y garantiza el control sobre los activos vinculados (computadores y vehículos), exigiendo la verificación física y firma digital de salida antes de permitir el egreso.

Funciona de forma integrada tanto desde la vista dedicada de salidas ([`GeneralExitView.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/views/GeneralExitView.vue)) como a través de la pestaña unificada de control del celador en ([`GeneralEntryView.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/views/GeneralEntryView.vue)).

---

## 2. Arquitectura y Componentes del Módulo

### 2.1 Backend (Node.js / Express / TypeScript)
- **Rutas**: [`database/src/routes/exit.routes.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/routes/exit.routes.ts)
- **Controladores**: [`database/src/controllers/exit.controller.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/database/src/controllers/exit.controller.ts)
- **Base de Datos**: Tablas `detalles_salida`, `detalles_ingreso`, `detalles_maquinas`, `aprendiz`.

### 2.2 Frontend (Vue 3 / TypeScript / Pinia)
- **Vistas**: [`src/views/GeneralExitView.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/views/GeneralExitView.vue), [`src/views/GeneralEntryView.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/views/GeneralEntryView.vue) (Pestaña Salidas)
- **Composables**: [`src/composables/useExitAprendiz.ts`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/composables/useExitAprendiz.ts)
- **Modales Operativos**:
  - `ModalScanExit.vue` (Escaneo de código de barras para salida)
  - [`src/components/AprendizUI/Modals/ModalRegisterExitManual.vue`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/components/AprendizUI/Modals/ModalRegisterExitManual.vue) (Registro manual de salida por DNI)
  - `ModalExitComputer.vue` / `SignaturePad.vue` (Captura de firma de salida y retiro de equipo)

---

## 3. Endpoints del Módulo

| Método | Endpoint | Descripción | Roles Permitidos |
|---|---|---|---|
| `POST` | `/api/registroSalidas/addExit/:documento` | Registra la salida del aprendiz cerrando su sesión activa de hoy | `CELADOR`, `ADMIN` |
| `GET` | `/api/registroSalidas/verificarSalida/:documento` | Valida si el aprendiz tiene ingreso activo y si porta equipos pendientes por retirar | `CELADOR`, `ADMIN` |
| `POST` | `/api/registroSalidas/retirarEquipo/:id_detallemaquina` | Registra la firma digital de salida y actualiza el estado del equipo a 'retirado' | `CELADOR`, `ADMIN` |
| `GET` | `/api/registroSalidas/historial` | Obtiene el listado de todas las salidas registradas en la fecha actual | `CELADOR`, `ADMIN` |
| `GET` | `/api/registroSalidas/buscar` | Búsqueda reactiva por documento, nombre o apellido en las salidas de hoy | `CELADOR`, `ADMIN` |

---

## 4. Estructura de Documentación del Módulo

- [`historias_usuario.md`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/documentacion/modulos/03_control_salida/historias_usuario.md): Historias de usuario completas con criterios de aceptación y trazabilidad.
- [`reglas_negocio.md`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/documentacion/modulos/03_control_salida/reglas_negocio.md): Catálogo de reglas de validación, tiempos mínimos y retiro de activos.
- [`casos_uso.md`](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/documentacion/modulos/03_control_salida/casos_uso.md): Casos de uso detallados del flujo de salida y retiro de activos.
