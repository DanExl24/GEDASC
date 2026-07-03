# Documentación Técnica — GEDASC V2

## 1. Introducción

Con el objetivo de ampliar las capacidades del sistema de control de acceso y adaptarlo a escenarios reales del **Centro de Tecnología de la Amazonía (CTA)**, se han implementado nuevas funcionalidades que permiten gestionar situaciones no contempladas en la versión inicial del proyecto.

Estas implementaciones responden a casos en los que un aprendiz puede ingresar varias veces durante el mismo día, pertenecer a múltiples formaciones, desempeñarse como monitor del centro, registrar de forma más segura el ingreso y salida de equipos mediante evidencia de firma digital, y ser validado contra los horarios oficiales de sus formaciones activas.

---

## 2. Fase 1 — Doble Firma de Equipos y Vehículos 🖊️

### Objetivo

Asegurar que cada ingreso de equipo (computador) o vehículo cuente con una firma digital al entrar y una firma de salida para validar su retiro físico del centro.

En la versión inicial del sistema únicamente se almacenaba la firma del aprendiz durante el ingreso del equipo. Con el fin de fortalecer la trazabilidad de los activos y disponer de evidencia tanto del ingreso como del retiro, se implementa un mecanismo de **doble firma digital**.

### Cambios en Base de Datos

- Se modificó la tabla `detalles_maquinas` añadiendo campos para `firma_salida`, `estado_equipo` (`'dentro'`, `'retirado'`) y `hora_retiro_equipo`.
- Se crearon rutas en `/api/registroSalidas/retirarEquipo/:id_detallemaquina` para firmar el retiro del equipo por parte del aprendiz.

### Funcionamiento

#### Ingreso

Cuando el aprendiz registra un computador o vehículo:

1. Se captura la firma digital.
2. Se almacena como evidencia de ingreso.
3. El equipo queda marcado como *"Dentro del centro"*.

#### Salida

Cuando el aprendiz abandona el centro con el equipo:

1. El sistema identifica el registro activo del equipo.
2. Solicita nuevamente la firma digital.
3. Almacena la firma de salida.
4. Actualiza el estado del equipo como *"Retirado"*.

### Información Registrada

Cada movimiento del equipo almacena:

| Campo                  | Descripción                           |
|------------------------|---------------------------------------|
| Fecha de ingreso       | Fecha en que el equipo fue registrado |
| Hora de ingreso        | Hora en que el equipo fue registrado  |
| Firma digital ingreso  | Evidencia del ingreso                 |
| Fecha de salida        | Fecha en que el equipo fue retirado   |
| Hora de salida         | Hora en que el equipo fue retirado    |
| Firma digital salida   | Evidencia del retiro                  |
| Estado del registro    | Dentro del centro / Retirado          |

### Interfaz

- Modal dinámico de detalle de equipos/vehículos que muestra el estado de retiro en tiempo real.
- Firma táctil integrada usando un lienzo de firmas (`SignaturePad.vue`) para capturar el retiro físico de equipos.

### Beneficios

- Mayor transparencia sobre los equipos que ingresan al centro.
- Evidencia jurídica del ingreso y retiro de activos.
- Disminución del riesgo de pérdida de equipos.
- Mejor control de préstamos entre aprendices.
- Incremento de la trazabilidad administrativa.

---

## 3. Fase 2 — Gestión de Aprendices Monitores 👥

### Objetivo

Clasificar a los aprendices designados como monitores, permitiéndoles indicar la actividad académica o de monitoría al momento de ingresar.

Algunos aprendices desempeñan simultáneamente funciones como monitores del Centro de Tecnología de la Amazonía. Las actividades de monitoría poseen horarios independientes a la formación académica, por lo que un mismo aprendiz puede ingresar varias veces durante el día con propósitos distintos.

### Cambios en Base de Datos

- Se añadió la columna `es_monitor` (boolean) a la tabla `aprendiz`.
- Se configuró la columna `tipo_sesion` (`'formacion'`, `'monitoria'`) en `detalles_ingreso`.

### Tipos de Sesión

Cada sesión podrá clasificarse como:

- **Formación** — Actividad académica regular.
- **Monitoría** — Actividad laboral como monitor del centro.

De esta manera un mismo día puede registrarse, por ejemplo:

| Entrada | Salida | Tipo       |
|---------|--------|------------|
| 07:00   | 12:00  | Formación  |
| 13:00   | 17:00  | Monitoría  |

### Interfaz

- Al escanear el carné o digitar el DNI manualmente, si el aprendiz es monitor, se despliega una ventana interactiva (`ModalConfirm`) preguntando si el acceso corresponde a **"Monitoría"** o **"Formación"**.

### Beneficios

- Separa las horas académicas de las horas laborales.
- Mejora la generación de reportes.
- Permite obtener estadísticas independientes para cada actividad.
- Facilita futuras integraciones con procesos administrativos del centro.

---

## 4. Fase 3 — Doble Formación y Panel de Asociaciones 🎓

### Objetivo

Permitir que un aprendiz esté inscrito en más de un programa de formación activo y gestionar de forma centralizada todas sus asociaciones académicas.

### Cambios en Base de Datos

- Creación de la tabla pivote `aprendiz_formacion` para romper la relación 1:N y permitir N programas por aprendiz con estados independientes (`'activo'`, `'inactivo'`).
- Migración segura para preservar la formación previa y normalizarla en la nueva tabla pivote.

### Interfaz

- Creación del panel **"Asociaciones"** en la administración de aprendices (`ModalAsociaciones.vue`).
- Permite a los administradores buscar aprendices, marcar/desmarcar su estado como Monitor, y asociar o remover programas de formación activos de manera interactiva.
- Visualización en la tabla de aprendices de etiquetas identificadoras en tiempo real: `[Monitor]` en morado y `[Doble Formación]` en rosa.

### Beneficios

- Permite registrar cualquier cantidad de programas asociados a un aprendiz.
- Facilita futuras integraciones con sistemas académicos.
- Evita la duplicidad de registros de aprendices.

---

## 5. Fase 4 — Sesiones Múltiples Diarias y Control Unificado de Celador 🔄

### Objetivo

Permitir múltiples ingresos y salidas de un aprendiz en un mismo día sin romper el historial, solicitando justificación al reingresar, y unificando el control de acceso del celador.

En la operación diaria del centro es común que un aprendiz ingrese y salga en diferentes momentos del mismo día, por ejemplo:

- Asistir a formación durante la mañana.
- Salir durante el almuerzo.
- Reingresar en la tarde para continuar con otra actividad.

Para soportar este comportamiento, el sistema deja de considerar un único registro diario y adopta un **modelo basado en sesiones**. Cada ingreso genera una nueva sesión y esta permanece activa hasta que el aprendiz registra su salida.

### Cambios en Base de Datos y Lógica

- Reemplazo de la clave única de ingreso diario para permitir múltiples tuplas de `detalles_ingreso` del mismo aprendiz por día.
- Tabla de control y almacenamiento del campo `motivo_reingreso` en `detalles_ingreso`.
- El sistema detecta mediante la base de datos si el aprendiz ya cuenta con una sesión activa hoy. Si ya salió, se activa la bandera `isReentry: true`, forzando al celador a seleccionar el motivo en el modal (`ModalReentryReason.vue`).

### Funcionamiento

Cuando el aprendiz escanea su carné:

1. El sistema verifica si existe una sesión activa.
2. Si **no** existe una sesión abierta, se registra un nuevo ingreso.
3. Si **existe** una sesión activa, el sistema registra automáticamente la salida y finaliza dicha sesión.

Este mecanismo elimina la necesidad de seleccionar manualmente entre "Entrada" y "Salida", reduciendo errores operativos y agilizando el proceso de registro.

### Control Unificado del Celador

- Diseño premium en `GeneralEntryView.vue` con una pestaña de toggle (**Ingresos** / **Salidas**) con contadores en tiempo real.
- Incorporación de la columna de **Acción** en la tabla del celador, permitiendo un botón explícito de **"Registrar Salida"** manual (que consume el lector de firmas de salida del equipo si porta uno).

### Gestión de Máquinas Concurrentes

- La verificación de duplicados evalúa el estado del equipo: si la máquina ya se encuentra con una sesión activa dentro del centro, el sistema bloquea el registro e informa quién la tiene actualmente en uso: `[Nombre Completo] ([C.C. DNI])`.
- Si la máquina fue devuelta en una sesión previa del día (sesión cerrada con firma de salida), el sistema permite re-registrarla a otro o al mismo aprendiz.

### Beneficios

- Permite múltiples ingresos durante un mismo día.
- Calcula el tiempo de permanencia de cada sesión.
- Facilita la generación de reportes detallados.
- Mantiene un historial cronológico completo de la actividad del aprendiz.

---

## 6. Fase 5 — Inferencia Automática de Jornada Académica 📊

### Objetivo

Estimar de forma inteligente la jornada preponderante del aprendiz con base en su historial acumulado de ingresos utilizando un algoritmo ponderado.

En la versión inicial, el sistema no disponía de acceso a los horarios oficiales administrados por Coordinación Académica, por lo que no era posible identificar de forma directa la jornada (mañana, tarde o noche) correspondiente a cada ingreso.

### Funcionamiento (Método Histórico — Legado)

El sistema analiza el historial reciente de sesiones registradas para cada aprendiz y calcula una jornada predominante utilizando dos indicadores:

- **Frecuencia** de ingresos por jornada.
- **Tiempo acumulado** de permanencia en cada jornada.

Clasificación de las horas de ingreso:

| Jornada  | Rango Horario        |
|----------|----------------------|
| Diurna   | 06:00 – 12:00        |
| Tarde    | 12:00 – 18:00        |
| Noche    | 18:00 – 22:00        |

Cada jornada obtiene un puntaje calculado mediante la siguiente expresión:

> **P = (I × 0.4) + (H × 0.6)**

| Variable | Significado                          |
|----------|--------------------------------------|
| P        | Puntaje de la jornada                |
| I        | Cantidad de ingresos registrados     |
| H        | Horas acumuladas de permanencia      |
| 0.4      | Peso asignado a la frecuencia        |
| 0.6      | Peso asignado al tiempo acumulado    |

La jornada con mayor puntaje es considerada la jornada predominante del aprendiz.

#### Ejemplo

| Jornada | Ingresos | Horas | Puntaje |
|---------|----------|-------|---------|
| Mañana  | 18       | 92    | 62.4    |
| Tarde   | 5        | 20    | 14.0    |
| Noche   | 0        | 0     | 0       |

**Resultado:** Jornada predominante → Mañana.

En la tabla de aprendices del celador se muestra un Badge con la jornada inferida de manera dinámica.

### Actualización (V2.8 — Detección Automática por Horario)

Con la incorporación de la Gestión Académica (Fase 6), la jornada ahora se **calcula automáticamente** a partir de la hora de inicio y fin del horario asignado a cada formación:

| Rango Horario         | Jornada  |
|-----------------------|----------|
| Antes de las 12:00    | Mañana   |
| De 12:00 a 18:00      | Tarde    |
| Después de las 18:00  | Noche    |

Este método reemplaza la inferencia histórica para las formaciones que tienen horarios asignados.

### Consideraciones

- El mecanismo histórico se conserva como respaldo para aprendices sin formación asignada.
- La arquitectura del sistema permite sustituir ambos algoritmos por datos provenientes del sistema institucional cuando dichos recursos se encuentren disponibles.

---

## 7. Fase 6 — Gestión Académica y Validación Inteligente de Horarios 📅

### Objetivo

Incorporar la estructura académica del centro de formación al sistema de control de acceso, permitiendo que cada ingreso sea validado contra los horarios oficiales de las formaciones activas del aprendiz.

Con esta implementación el sistema deja de considerar únicamente la identidad del aprendiz y comienza a **evaluar el contexto académico** en el que ocurre cada acceso.

### Cambios en Base de Datos

#### Nueva tabla: `programa`

Almacena la información de cada programa de formación ofrecido por la institución.

| Campo             | Descripción                                  |
|-------------------|----------------------------------------------|
| `id_programa`     | Identificador único                          |
| `nombre_programa` | Nombre oficial del programa                  |
| `version`         | Versión curricular del programa              |
| `estado`          | Activo / Inactivo                            |
| `nivel`           | Nivel de programa (Técnico, Tecnólogo, etc.) |

#### Nueva tabla: `horario`

Representa un horario reutilizable que puede ser compartido entre varias formaciones.

| Campo         | Descripción                             |
|---------------|-----------------------------------------|
| `id_horario`  | Identificador                           |
| `hora_inicio` | Hora oficial de inicio                  |
| `hora_fin`    | Hora oficial de finalización            |
| `jornada`     | Mañana / Tarde / Noche (auto-calculada) |

#### Nueva tabla: `horario_dia`

Normaliza los días de funcionamiento del horario.

| Campo        | Descripción                    |
|--------------|--------------------------------|
| `id_horario` | Horario asociado               |
| `dia_semana` | Día habilitado (Lunes–Domingo) |

> Esta implementación reemplaza el almacenamiento de días mediante JSON, facilitando consultas, reportes y futuras ampliaciones.

#### Modificación de `formaciones`

La formación (ficha) pasa a representar una ejecución específica de un programa académico.

| Campo           | Descripción               |
|-----------------|---------------------------|
| `id_formacion`  | Número oficial de ficha   |
| `id_programa`   | Programa asociado         |
| `id_horario`    | Horario asignado          |
| `fecha_inicio`  | Inicio de la ficha        |
| `fecha_fin`     | Finalización de la ficha  |
| `estado`        | Activa / Finalizada       |

> Una formación pertenece a un único programa y utiliza un único horario, mientras que un mismo horario puede ser reutilizado por múltiples formaciones.

### Validación Inteligente de Accesos

Al registrar un ingreso, el sistema ejecuta automáticamente el siguiente proceso:

1. Obtiene todas las formaciones activas del aprendiz.
2. Recupera los horarios asociados.
3. Compara el **día de la semana** y la **hora del ingreso**.
4. Determina si el acceso corresponde a alguna programación académica vigente.

- ✅ Si existe al menos una coincidencia, el ingreso continúa normalmente.
- ⚠️ Si ninguna formación coincide con el momento del ingreso, el sistema solicitará obligatoriamente el **motivo de la visita**.

### Registro del Motivo de Visita

Cuando el ingreso ocurra fuera del horario académico del aprendiz, el sistema solicitará una justificación antes de permitir el acceso.

Ejemplos de motivos:

- Biblioteca
- Proyecto de formación
- Monitoría
- Bienestar al Aprendiz
- Reunión con instructor
- Evento institucional
- Trámite administrativo
- Otro

> Esta información permite realizar análisis posteriores sobre el uso del centro fuera del horario académico.

### Selección de Formación Activa

Cuando un aprendiz posea múltiples formaciones cuyos horarios sean compatibles con el momento del ingreso, el sistema solicitará cuál de ellas corresponde a la actividad que realizará.

La formación seleccionada quedará registrada dentro de la sesión de acceso, permitiendo generar **estadísticas independientes** por ficha y programa de formación.

### Gestión Histórica de Horarios

Los horarios no serán modificados cuando exista un cambio de programación académica. En su lugar:

1. Se crea un nuevo registro de horario.
2. La formación pasa a utilizar el nuevo horario.
3. Los accesos históricos conservan la referencia al horario vigente al momento en que fueron registrados.

> Esta estrategia garantiza la integridad histórica de la información.

### Gestión de Formaciones (Panel Administrativo)

El módulo **Gestión de Formaciones** permite a los administradores:

- **CRUD completo de Fichas de Formación** — Crear, editar y eliminar fichas con su programa, horario y fechas.
- **CRUD completo de Programas Curriculares** — Gestionar los programas académicos del catálogo.
- **CRUD completo de Horarios** — Crear horarios con días de la semana y rango horario (la jornada se calcula automáticamente).
- **Vinculación rápida de aprendices** — Mediante el botón "Ver Aprendices" se accede a un modal que permite:
  - Visualizar los aprendices vinculados a la ficha.
  - Vincular nuevos aprendices rápidamente.
  - Desvincular aprendices existentes.

---

## 8. Reglas de Negocio

| Código     | Descripción                                                                                                                                       |
|------------|---------------------------------------------------------------------------------------------------------------------------------------------------|
| **RN-031** | Un programa de formación puede estar asociado a múltiples formaciones (fichas).                                                                   |
| **RN-032** | Toda formación debe estar asociada a un único programa académico.                                                                                |
| **RN-033** | Toda formación debe tener exactamente un horario asignado.                                                                                       |
| **RN-034** | Un mismo horario podrá ser utilizado por múltiples formaciones.                                                                                  |
| **RN-035** | El sistema validará cada ingreso utilizando el día y la hora del acceso contra todas las formaciones activas del aprendiz.                        |
| **RN-036** | Si el ingreso no coincide con ningún horario activo del aprendiz, el sistema solicitará obligatoriamente el motivo de la visita.                  |
| **RN-037** | Cuando un aprendiz posea múltiples formaciones compatibles con el horario del ingreso, el sistema deberá registrar la formación correspondiente.  |
| **RN-038** | No se permitirá asociar a un aprendiz dos formaciones activas cuyos horarios presenten superposición temporal.                                    |
| **RN-039** | Los cambios de horario no modificarán registros históricos; se deberá crear un nuevo horario y actualizar la formación correspondiente.            |

---

## 9. Especificaciones del Diseño e Interfaz UI 🎨

1. **Unificación de Vistas**:
   - En lugar de pantallas separadas, el celador opera desde un dashboard unificado con pestañas animadas mediante transiciones CSS.

2. **Historial por Sesiones Independientes**:
   - Al dar clic en el botón de **"Sesión X"** en la tabla de ingresos o salidas, se abre una ventana modal con los metadatos específicos de esa sesión: DNI del aprendiz, programa asignado en esa sesión, tipo de actividad (Monitoría/Formación), y el motivo justificado de reingreso.
   - El detalle de salida y firma de equipos respeta estrictamente el `id_detallemaquina` de la fila seleccionada, eliminando el error de sobreescribir firmas de sesiones anteriores.

3. **Flujo de Registro Manual Equivalente**:
   - El registro manual a través del modal ejecuta las mismas validaciones de reingreso, monitoría y equipos que el lector de códigos de barra (carné), garantizando consistencia funcional al 100%.

---

## 10. Escalabilidad

Las funcionalidades implementadas fueron diseñadas siguiendo un enfoque escalable, permitiendo incorporar futuras integraciones sin modificar la arquitectura principal del sistema.

Entre las posibles ampliaciones se encuentran:

- Integración con el sistema académico institucional para obtener horarios oficiales.
- Determinación automática de la formación correspondiente a cada sesión.
- Validación de actividades de monitoría mediante programación institucional.
- Generación de indicadores de ocupación por jornada.
- Analítica avanzada sobre permanencia, asistencia y utilización de equipos.

> Gracias a este diseño, el sistema evoluciona desde un control básico de acceso hacia una plataforma integral de gestión administrativa, preparada para adaptarse a las necesidades futuras del Centro de Tecnología de la Amazonía.

---

## 11. Notas para Futuras Versiones (V3)

En lugar de que el celador tenga que decidir si un ingreso está "dentro" o "fuera" del horario, el sistema podría calcular un **estado de asistencia automáticamente**:

| Estado                   | Descripción                                                                 |
|--------------------------|-----------------------------------------------------------------------------|
| **Puntual**              | Ingreso dentro de un margen permitido (por ejemplo, ±15 minutos del inicio) |
| **Tardanza**             | Ingreso posterior al margen establecido                                     |
| **Fuera de horario**     | Ingreso sin coincidencia con ninguna formación activa                       |
| **Acceso extraordinario**| Ingreso autorizado mediante un motivo de visita                             |
