# Documentación Técnica - GEDASC V2 (Versión 2.0)

Esta documentación describe la especificación, arquitectura y detalles de implementación de la versión 2 (V2) del sistema **GEDASC**, el cual extiende el control de accesos de aprendices para soportar múltiples programas de formación, sesiones múltiples por día con control unificado de ingresos/salidas, motivos de reingreso, asignación temporal de máquinas concurrentes e inferencia inteligente de jornada preponderante.

---

## 🛠️ Arquitectura de Fases Implementadas

### 1. Fase 1: Doble Firma de Equipos y Vehículos 🖊️
* **Objetivo**: Asegurar que cada ingreso de equipo (computador) o vehículo cuente con una firma digital al entrar y una firma de salida para validar su retiro físico del centro.
* **Base de Datos**: 
  - Se modificó la tabla `detalles_maquinas` añadiendo campos para `firma_salida`, `estado_equipo` (`'dentro'`, `'retirado'`) y `hora_retiro_equipo`.
  - Se crearon rutas en `/api/registroSalidas/retirarEquipo/:id_detallemaquina` para firmar el retiro del equipo por parte del aprendiz.
* **Interfaz**:
  - Modal dinámico de detalle de equipos/vehículos que muestra el estado de retiro en tiempo real.
  - Firma táctil integrada usando un lienzo de firmas (`SignaturePad.vue`) para capturar el retiro físico de equipos.

### 2. Fase 2: Gestión de Monitores 👥
* **Objetivo**: Clasificar a los aprendices designados como monitores, permitiéndoles indicar la actividad académica o de monitoría al momento de ingresar.
* **Base de Datos**:
  - Se añadió la columna `es_monitor` boolean a la tabla `aprendiz`.
  - Se configuró la columna `tipo_sesion` (`'formacion'`, `'monitoria'`) en `detalles_ingreso`.
* **Interfaz**:
  - Al escanear el carné o digitar el DNI manualmente, si el aprendiz es monitor, se despliega una ventana interactiva (`ModalConfirm`) preguntando si el acceso corresponde a **"Monitoría"** o **"Formación"**.

### 3. Fase 3: Doble Formación y Panel de Asociaciones 🎓
* **Objetivo**: Permitir que un aprendiz esté inscrito en más de un programa de formación activo y gestionar de forma centralizada todas sus asociaciones académicas.
* **Base de Datos**:
  - Creación de la tabla pivote `aprendiz_formacion` para romper la relación 1:N y permitir N programas por aprendiz con estados independientes (`'activo'`, `'inactivo'`).
  - Migración segura para preservar la formación previa y normalizarla en la nueva tabla pivote.
* **Interfaz**:
  - Creación del panel **"Asociaciones"** en la administración de aprendices (`ModalAsociaciones.vue`).
  - Permite a los administradores buscar aprendices, marcar/desmarcar su estado como Monitor, y asociar o remover programas de formación activos de manera interactiva.
  - Visualización en la tabla de aprendices de etiquetas identificadoras en tiempo real: `[Monitor]` en morado y `[Doble Formación]` en rosa.

### 4. Fase 4: Sesiones Múltiples Diarias y Control Unificado de Celador 🔄
* **Objetivo**: Permitir múltiples ingresos y salidas de un aprendiz en un mismo día sin romper el historial, solicitando justificación al reingresar, y unificando el control de acceso del celador.
* **Base de Datos & Lógica**:
  - Reemplazo de la clave única de ingreso diario para permitir múltiples tuplas de `detalles_ingreso` del mismo aprendiz por día.
  - Tabla de control y almacenamiento del campo `motivo_reingreso` en `detalles_ingreso`.
  - El sistema detecta mediante la base de datos si el aprendiz ya cuenta con una sesión activa hoy. Si ya salió, se activa la bandera `isReentry: true`, forzando al celador a seleccionar el motivo en el modal (`ModalReentryReason.vue`).
* **Control Unificado**:
  - Diseño premium en [GeneralEntryView.vue](file:///c:/Users/alejo/Downloads/primerProyecto/GEDASC/src/views/GeneralEntryView.vue) con una pestaña de toggle (**Ingresos** / **Salidas**) con contadores en tiempo real.
  - Incorporación de la columna de **Acción** en la tabla del celador, permitiendo un botón explícito de **"Registrar Salida"** manual (que consume el lector de firmas de salida del equipo si porta uno).
* **Gestión de Máquinas Concurrentes**:
  - La verificación de duplicados evalúa el estado del equipo: si la máquina ya se encuentra con una sesión activa dentro del centro, el sistema bloquea el registro e informa quién la tiene actualmente en uso: `[Nombre Completo] ([C.C. DNI])`.
  - Si la máquina fue devuelta en una sesión previa del día (sesión cerrada con firma de salida), el sistema permite re-registrarla a otro o al mismo aprendiz.

### 5. Fase 5: Inferencia Automática de Jornada Académica 5️⃣
* **Objetivo**: Estimar de forma inteligente la jornada preponderante del aprendiz con base en su historial acumulado de ingresos utilizando un algoritmo ponderado.
* **Algoritmo**:
  - Clasifica las horas de ingreso en: **Diurna** (06:00 - 12:00), **Tarde** (12:00 - 18:00) o **Noche** (18:00 - 22:00).
  - Calcula la jornada predominante calculando un puntaje de relevancia por jornada:
    $$P = (I \times 0.4) + (H \times 0.6)$$
    *Donde $I$ es la frecuencia de ingresos y $H$ son las horas totales transcurridas en el centro.*
  - En la tabla de aprendices del celador se muestra el Badge con la jornada inferida de manera dinámica.

---

## 🎨 Especificaciones del Diseño e Interfaz UI

1. **Unificación de Vistas**:
   - En lugar de pantallas separadas, el celador opera desde un dashboard unificado con pestañas animadas mediante transiciones CSS.
2. **Historial por Sesiones Independientes**:
   - Al dar clic en el botón de **"Sesión X"** en la tabla de ingresos o salidas, se abre una ventana modal con los metadatos específicos de esa sesión: DNI del aprendiz, programa asignado en esa sesión, tipo de actividad (Monitoría/Formación), y el motivo justificado de reingreso.
   - El detalle de salida y firma de equipos respeta estrictamente el `id_detallemaquina` de la fila seleccionada, eliminando el error de sobreescribir firmas de sesiones anteriores.
3. **Flujo de Registro Manual Equivalente**:
   - El registro manual a través del modal ejecuta las mismas validaciones de reingreso, monitoría y equipos que el lector de códigos de barra (carné), garantizando consistencia funcional al 100%.
