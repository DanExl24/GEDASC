Documentación de Nuevas Implementaciones

1. Introducción

Con el objetivo de ampliar las capacidades del sistema de control de acceso y adaptarlo a escenarios reales del Centro de Tecnología de la Amazonía (CTA), se proponen nuevas funcionalidades que permiten gestionar situaciones no contempladas en la versión inicial del proyecto.

Estas implementaciones responden a casos en los que un aprendiz puede ingresar varias veces durante el mismo día, pertenecer a múltiples formaciones, desempeñarse como monitor del centro y registrar de forma más segura el ingreso y salida de equipos mediante evidencia de firma digital.

2. Registro de múltiples ingresos diarios
   Descripción

En la operación diaria del centro es común que un aprendiz ingrese y salga en diferentes momentos del mismo día, por ejemplo:

Asistir a formación durante la mañana.
Salir durante el almuerzo.
Reingresar en la tarde para continuar con otra actividad.

Para soportar este comportamiento, el sistema deja de considerar un único registro diario y adopta un modelo basado en sesiones.

Cada ingreso genera una nueva sesión y esta permanece activa hasta que el aprendiz registra su salida.

Funcionamiento

Cuando el aprendiz escanea su carné:

El sistema verifica si existe una sesión activa.
Si no existe una sesión abierta, se registra un nuevo ingreso.
Si existe una sesión activa, el sistema registra automáticamente la salida y finaliza dicha sesión.

Este mecanismo elimina la necesidad de seleccionar manualmente entre "Entrada" y "Salida", reduciendo errores operativos y agilizando el proceso de registro.

Beneficios
Permite múltiples ingresos durante un mismo día.
Calcula el tiempo de permanencia de cada sesión.
Facilita la generación de reportes detallados.
Mantiene un historial cronológico completo de la actividad del aprendiz. 3. Gestión de múltiples formaciones
Descripción

Actualmente un aprendiz puede estar matriculado en más de un programa de formación simultáneamente.

Para soportar esta condición, el sistema incorpora la posibilidad de asociar múltiples formaciones a un mismo aprendiz mediante una relación de muchos a muchos.

Cada formación conserva su propio estado y periodo de vigencia.

Beneficios
Permite registrar cualquier cantidad de programas asociados a un aprendiz.
Facilita futuras integraciones con sistemas académicos.
Evita la duplicidad de registros de aprendices. 4. Inferencia automática de jornada
Problema

Actualmente el sistema no dispone de acceso a los horarios oficiales administrados por Coordinación Académica, por lo que no es posible identificar de forma directa la jornada (mañana, tarde o noche) correspondiente a cada ingreso.

Para solucionar esta limitación se implementa un mecanismo de inferencia automática basado en el comportamiento histórico del aprendiz.

Funcionamiento

El sistema analiza el historial reciente de sesiones registradas para cada aprendiz y calcula una jornada predominante utilizando dos indicadores:

Frecuencia de ingresos por jornada.
Tiempo acumulado de permanencia en cada jornada.

Cada jornada obtiene un puntaje calculado mediante la siguiente expresión:

P=(I×0.4)+(H×0.6)

Donde:

P = Puntaje de la jornada.
I = Cantidad de ingresos registrados.
H = Horas acumuladas de permanencia.
0.4 y 0.6 corresponden a los pesos asignados a cada criterio.

La jornada con mayor puntaje será considerada la jornada predominante del aprendiz.

Ejemplo
Jornada Ingresos Horas Puntaje
Mañana 18 92 62.4
Tarde 5 20 14.0
Noche 0 0 0

Resultado:

Jornada predominante: Mañana.

Consideraciones

Este mecanismo constituye una estimación basada en el historial de actividad y no reemplaza la información oficial de horarios académicos.

La arquitectura del sistema permite sustituir este algoritmo por datos provenientes del sistema institucional cuando dichos recursos se encuentren disponibles.

5. Gestión de aprendices monitores
   Descripción

Algunos aprendices desempeñan simultáneamente funciones como monitores del Centro de Tecnología de la Amazonía.

Las actividades de monitoría poseen horarios independientes a la formación académica, por lo que un mismo aprendiz puede ingresar varias veces durante el día con propósitos distintos.

Para representar correctamente esta situación, el sistema incorpora la clasificación de cada sesión según el tipo de actividad realizada.

Tipos de sesión

Cada sesión podrá clasificarse como:

Formación.
Monitoría.

De esta manera un mismo día puede registrarse, por ejemplo:

Entrada Salida Tipo
07:00 12:00 Formación
13:00 17:00 Monitoría
Beneficios
Separa las horas académicas de las horas laborales.
Mejora la generación de reportes.
Permite obtener estadísticas independientes para cada actividad.
Facilita futuras integraciones con procesos administrativos del centro. 6. Implementación de doble firma para control de equipos
Descripción

En la versión inicial del sistema únicamente se almacenaba la firma del aprendiz durante el ingreso del equipo.

Con el fin de fortalecer la trazabilidad de los activos y disponer de evidencia tanto del ingreso como del retiro, se implementa un mecanismo de doble firma digital.

Funcionamiento
Ingreso

Cuando el aprendiz registra un computador o vehículo:

Se captura la firma digital.
Se almacena como evidencia de ingreso.
El equipo queda marcado como "Dentro del centro".
Salida

Cuando el aprendiz abandona el centro con el equipo:

El sistema identifica el registro activo del equipo.
Solicita nuevamente la firma digital.
Almacena la firma de salida.
Actualiza el estado del equipo como "Retirado".
Información registrada

Cada movimiento del equipo almacena:

Fecha de ingreso.
Hora de ingreso.
Firma digital de ingreso.
Fecha de salida.
Hora de salida.
Firma digital de salida.
Estado del registro.
Beneficios
Mayor transparencia sobre los equipos que ingresan al centro.
Evidencia jurídica del ingreso y retiro de activos.
Disminución del riesgo de pérdida de equipos.
Mejor control de préstamos entre aprendices.
Incremento de la trazabilidad administrativa. 7. Escalabilidad de las implementaciones

Las funcionalidades propuestas fueron diseñadas siguiendo un enfoque escalable, permitiendo incorporar futuras integraciones sin modificar la arquitectura principal del sistema.

Entre las posibles ampliaciones se encuentran:

Integración con el sistema académico institucional para obtener horarios oficiales.
Determinación automática de la formación correspondiente a cada sesión.
Validación de actividades de monitoría mediante programación institucional.
Generación de indicadores de ocupación por jornada.
Analítica avanzada sobre permanencia, asistencia y utilización de equipos.

Gracias a este diseño, el sistema evoluciona desde un control básico de acceso hacia una plataforma integral de gestión administrativa, preparada para adaptarse a las necesidades futuras del Centro de Tecnología de la Amazonía.
