# MANUAL DE USUARIO — GEDASC

> **Gestión de Entradas y Salidas de Aprendices con Autenticación de Equipos y Doble Firma**  
> **Centro de Tecnología de la Amazonía (CTA) — SENA Regional Caquetá**  
> **Guía Práctica e Instructivo Paso a Paso para Operadores y Administradores**

---

# 1. Introducción

### 1.1 Objetivo del Manual
Este manual es una **guía práctica y sencilla** diseñada para que los operadores de portería (celadores), coordinadores académicos y administradores del Centro de Tecnología de la Amazonía (CTA) aprendan a utilizar todas las funciones del sistema **GEDASC** de forma rápida, eficiente y sin necesidad de conocimientos técnicos de programación.

### 1.2 Alcance
El manual cubre paso a paso todos los procedimientos del día a día:
- Inicio y cierre de sesión.
- Control de ingreso y salida peatonal de aprendices con carné.
- Registro y retiro de computadores portátiles y vehículos con firma en pantalla.
- Uso del teléfono móvil como validador inalámbrico de apoyo en portería.
- Consultas de historial y descarga de reportes oficiales en PDF y Excel.
- Administración de aprendices, horarios, fichas formativas y celadores.

### 1.3 Descripción General del Sistema
**GEDASC** es el sistema digital oficial que controla la entrada y salida del Centro de Tecnología de la Amazonía. Con este sistema:
1. **Se agiliza el paso en portería**: El escaneo del carné toma menos de 2 segundos.
2. **Se protegen los computadores y vehículos**: Cada equipo queda registrado con la firma digital del aprendiz al entrar y solo puede salir cuando vuelve a firmar.
3. **Se valida la formación**: El sistema avisa si el aprendiz tiene clases en ese horario o si asiste en una jornada diferente.
4. **Se previenen deserciones**: El sistema avisa automáticamente a coordinación si un aprendiz completa 3 días seguidos sin asistir a sus clases.

---

# 2. Requisitos de Acceso

### 2.1 Requisitos del Dispositivo
- **En Portería (Puesto Principal)**: Computador de escritorio o portátil con monitor, teclado, mouse y pistola lectora de códigos de barra conectada por USB (o cámara web).
- **En la Fila de Ingreso (Apoyo Móvil)**: Cualquier teléfono inteligente o tablet con pantalla táctil y cámara trasera funcional, conectado a la red Wi-Fi del CTA.

### 2.2 Navegadores Compatibles
El sistema funciona en cualquier navegador web moderno:
- **Google Chrome** (Recomendado).
- **Microsoft Edge**.
- **Mozilla Firefox**.
- **Safari** (en dispositivos Apple).

### 2.3 Acceso al Sistema
Abra el navegador e ingrese la dirección web interna suministrada por el equipo de sistemas del centro (por ejemplo: `http://192.168.1.50:5173` o `http://localhost:5173`).

---

# 3. Acceso y Autenticación

### 3.1 Inicio de Sesión
1. Ingrese a la pantalla de bienvenida de GEDASC.
2. Escriba su **correo electrónico institucional** (ejemplo: `celador@gedasc.com` o `admin@gedasc.com`).
3. Digite su **contraseña personal**.
4. Haga clic en el botón verde **"Iniciar Sesión"**.

```text
┌─────────────────────────────────────────────────────────────┐
│                      SENA CTA — GEDASC                      │
│                  Control de Acceso y Equipos                │
├─────────────────────────────────────────────────────────────┤
│  Correo Electrónico:  [ celador@gedasc.com                ] │
│  Contraseña:          [ ••••••••••••                      ] │
│                                                             │
│                 [ INICIAR SESIÓN ]                          │
└─────────────────────────────────────────────────────────────┘
```

> 💡 **Nota**: Si los datos son correctos, el sistema lo dirigirá automáticamente a la pantalla de trabajo correspondiente a su rol.

### 3.2 Olvido o Cambio de Contraseña
Por políticas de seguridad de la institución, los celadores no pueden restablecer su contraseña por sí mismos. Si olvida su contraseña o requiere cambiarla, solicite la actualización directamente al **Administrador del Sistema / Coordinación**.

### 3.3 Cierre de Sesión Seguro
Al finalizar su turno de vigilancia o labor administrativa:
1. Diríjase a la esquina superior derecha de la pantalla.
2. Haga clic en el botón rojo **"Cerrar Sesión"**.
3. El sistema cerrará su cuenta y volverá a la pantalla de inicio para el siguiente turno.

---

# 4. Navegación del Sistema

### 4.1 Panel Principal
- **Para el Celador**: La pantalla principal muestra el panel de **Registro de Ingresos**, el campo de escaneo de carné, el reloj oficial del centro y la jornada actual (Mañana, Tarde o Noche).
- **Para el Administrador**: Muestra el menú lateral con acceso a Aprendices, Horarios, Fichas, Alertas de Inasistencia, Control de Registros y Reportes.

### 4.2 Menú de Navegación
- **Entradas**: Pantalla de escaneo y registro de acceso peatonal y equipos.
- **Salidas**: Pantalla de consulta de aprendices que se encuentran actualmente dentro del centro.
- **Historial**: Búsqueda de registros pasados con filtros por fecha, aprendiz o ficha.
- **Validador Móvil**: Enlace para sincronizar un teléfono celular en portería.
- **Administración** *(Solo Coordinación)*: Gestión de fichas, horarios, alertas y celadores.

### 4.3 Alertas y Mensajes en Pantalla
- 🟢 **Verde (Éxito)**: El ingreso o salida fue registrado correctamente.
- 🟡 **Amarillo (Atención)**: El aprendiz reingresa en el día, viene fuera de su horario habitual o porta un equipo prestado.
- 🔴 **Rojo (Alerta / Bloqueo)**: El aprendiz no está activo en el sistema, no puede salir porque no ha firmado el retiro de su computador, o acumula ausentismo crítico.

---

# 5. Operación en el Puesto de Control de Portería

### 5.1 Selección y Visualización de la Jornada
El sistema calcula automáticamente la jornada según la hora oficial del centro:
- **Jornada Mañana**: Ingresos antes de las 12:00 del mediodía.
- **Jornada Tarde**: Ingresos entre las 12:00 p.m. y las 5:59 p.m.
- **Jornada Noche**: Ingresos a partir de las 6:00 p.m.

### 5.2 Vinculación del Validador Móvil (Teléfono en la Fila)
Si hay fila extensa de aprendices en la portería:
1. En el computador principal, haga clic en **"Validador Móvil"** en la barra superior.
2. El sistema mostrará un código QR o botón de vinculación.
3. Abra la cámara del teléfono celular del celador y apunte al QR, o ingrese al enlace en el navegador del teléfono.
4. ¡Listo! Todo carné que escanee con la cámara del celular o toda firma que el aprendiz haga en la pantalla del teléfono **se reflejará de inmediato en la pantalla del computador de portería**.

---

# 6. Gestión de Usuarios y Celadores (Solo Administradores)

### 6.1 Crear una Cuenta para un Nuevo Celador
1. Inicie sesión con perfil de **Administrador**.
2. En el menú lateral, ingrese a **"Gestión de Celadores"**.
3. Presione el botón **"Nuevo Celador"**.
4. Complete los datos:
   - Nombre completo del operador.
   - Correo electrónico institucional.
   - Contraseña inicial de acceso.
5. Presione **"Guardar"**. La cuenta quedará activa de inmediato.

### 6.2 Desactivar o Suspender a un Celador
Si un celador finaliza su contrato o es trasladado de puesto:
1. Busque al celador en la lista de usuarios.
2. Presione el botón de estado para cambiarlo a **"Inactivo"**.
3. El celador ya no podrá ingresar al sistema, pero todos los registros de ingreso que realizó en el pasado se conservarán intactos para auditorías.

---

# 7. Gestión de Aprendices y Carga Masiva

### 7.1 Registrar un Aprendiz Manualmente
1. Ingrese a **"Gestión de Aprendices"**.
2. Haga clic en **"Nuevo Aprendiz"**.
3. Ingrese el número de documento de identidad, nombres completos y apellidos.
4. Seleccione la ficha de formación a la que pertenece y presione **"Guardar"**.

### 7.2 Carga Masiva de Aprendices desde Archivo Excel
Para matricular a todo un grupo nuevo en pocos segundos:
1. Ingrese a **"Gestión de Horarios y Fichas"**.
2. Seleccione la ficha de formación deseada (ejemplo: Ficha `2823456`).
3. Haga clic en el botón **"Importar Aprendices (Excel)"**.
4. Seleccione el archivo `.xlsx` de su computador que contenga la lista de aprendices con las columnas: `Documento`, `Nombre`, `Apellido`.
5. Presione **"Procesar Importación"**.
6. El sistema registrará a todos los aprendices automáticamente y mostrará un resumen confirmando cuántos fueron matriculados exitosamente.

### 7.3 Designar a un Aprendiz Monitor
1. En la lista de aprendices, busque al estudiante por su número de documento.
2. Active la casilla o interruptor **"Es Monitor"**.
3. A partir de ese momento, cada vez que el aprendiz ingrese al centro, el sistema le permitirá al celador clasificar si asiste a sus clases de formación o a prestar sus horas de monitoría.

---

# 8. Gestión de Horarios y Prevención de Deserción

### 8.1 Configurar Horarios y Días de Clase
1. Ingrese al módulo **"Horarios"**.
2. Cree una franja horaria indicando la hora de inicio y de fin (ejemplo: `07:00 a 13:00`).
3. Marque los días de la semana en que asiste el grupo (Lunes a Viernes).
4. Asigne el horario a la ficha formativa correspondiente.

### 8.2 Regla de Tolerancia de 30 Minutos
- Los aprendices pueden ingresar hasta **30 minutos antes** de iniciar su clase para preparar talleres y laboratorios.
- Tienen hasta **30 minutos después** de finalizada la clase para retirarse del centro sin generar alertas.
- Si un aprendiz se presenta fuera de este rango de tolerancia, el sistema solicitará obligatoriamente ingresar el **Motivo de Visita** (ejemplo: *Asesoría de proyecto*, *Trámite en biblioteca*, *Citación de bienestar*).

### 8.3 Centro de Alertas por Inasistencia Prolongada (3 Días)
1. En el menú del Administrador, ingrese a **"Alertas de Ausentismo"**.
2. El sistema analiza automáticamente el calendario lectivo y muestra en tarjetas rojas a todos los aprendices que lleven **3 o más días continuos sin registrar entrada al CTA** en sus días de clase obligatoria.
3. El coordinador puede presionar **"Exportar Reporte de Alertas"** para remitir los casos a Bienestar al Aprendiz o citar a Comité de Evaluación.

---

# 9. Control Operativo Diario en Portería (Paso a Paso)

```text
┌─────────────────────────────────────────────────────────────┐
│               FLUJO DE TRABAJO DIARIO EN PORTERÍA           │
│                                                             │
│   1. Escanear Carné ──► 2. ¿Tiene Equipos? ──► 3. Confirmar │
│         (2 seg)             (Firma Táctil)         Entrada  │
└─────────────────────────────────────────────────────────────┘
```

### 9.1 Registro de Ingreso Ordinario (Con Carné)
1. El aprendiz presenta su carné físico institucional en la ventanilla.
2. El celador apunta la pistola lectora de códigos de barra al carné.
3. El sistema emite un pitido y muestra inmediatamente en pantalla:
   - Nombre y foto del aprendiz.
   - Número de documento.
   - Ficha y programa de formación.
   - Estado: **AUTORIZADO**.
4. Presione **"Confirmar Ingreso"** (o se confirma automáticamente si no porta equipos).

### 9.2 Registro de Ingreso con Computador Portátil o Vehículo
1. Si el aprendiz ingresa con un computador portátil o vehículo:
2. En la pantalla de ingreso, marque la casilla **"Registrar Equipo / Vehículo"**.
3. Digite el número de serial del computador (o la placa del vehículo) y la marca.
4. Solicite al aprendiz que **estampa su firma manuscrita con el dedo o lápiz óptico** en el recuadro de firma de la pantalla (o en el teléfono validador móvil).
5. Presione **"Guardar y Registrar Entrada"**.
6. El activo queda oficialmente bajo custodia en el sistema con estado **"Dentro"**.

### 9.3 Detección de Equipos Prestados
Si el serial del computador ya está registrado a nombre de otro compañero de clase:
- El sistema mostrará un aviso amarillo indicando: *"Atención: Equipo registrado a nombre de [Nombre del Propietario]"*.
- El sistema registrará el ingreso como **Préstamo Autorizado**, vinculando a ambos aprendices para garantizar que nadie pueda adueñarse de un equipo ajeno.

### 9.4 Registro de Salida de Aprendices (Toggle Automático)
Para registrar la salida de un aprendiz:
1. El aprendiz presenta nuevamente su carné al salir.
2. El celador escanea el carné en la **misma pantalla de portería**.
3. El sistema reconoce automáticamente que el aprendiz ya estaba dentro del centro y registra su hora oficial de egreso en un solo paso.

### 9.5 Retiro de Equipos Portados (Firma Obligatoria de Salida)
Si el aprendiz ingresó con un computador portátil o vehículo:
1. Al escanear su salida, el sistema **bloqueará el egreso temporalmente** y abrirá la ventana de **"Retiro de Equipos"**.
2. El celador verifica físicamente que el serial del portátil o la placa coincidan con el registrado en pantalla.
3. El aprendiz debe **estampar su segunda firma manuscrita digital** en el recuadro para confirmar que retira su equipo a satisfacción.
4. El sistema libera el activo a estado **"Retirado"** y autoriza la salida del aprendiz.

> ⚠️ **IMPORTANTE**: Ningún aprendiz puede abandonar el centro si no ha firmado el retiro físico de todos los equipos que ingresó a su nombre.

### 9.6 Registro de Reingreso en el Mismo Día
Si un aprendiz salió a almorzar o a una diligencia médica y regresa en la misma tarde:
1. Al escanear su carné, el sistema detecta que es su segundo ingreso del día (`Reingreso`).
2. Se abrirá una ventana solicitando el **Motivo de Reingreso** (ejemplo: *Regreso de almuerzo*, *Permiso institucional*).
3. Escriba el motivo brevemente y presione **"Autorizar Reingreso"**.

### 9.7 Anulación de un Registro Erróneo (Solo Administradores)
Si por error se registró la entrada de un aprendiz equivocado:
1. El Administrador ingresa a **"Control de Registros"**.
2. Localiza el registro en la tabla y presiona el botón **"Anular Registro"**.
3. El sistema solicitará por seguridad **volver a escribir el número de documento exacto** del aprendiz y redactar el **motivo de la anulación**.
4. Al confirmar, el registro quedará anulado y liberará el estado del aprendiz.

---

# 10. Consultas, Historial y Reportes

### 10.1 Consultar el Historial de Accesos
1. Ingrese a la pestaña **"Historial"**.
2. Puede filtrar la búsqueda por:
   - Rango de fechas (Desde - Hasta).
   - Número de documento o nombre del aprendiz.
   - Número de ficha o programa de formación.
   - Jornada (Mañana, Tarde, Noche).
3. La tabla mostrará todos los movimientos detallando: fecha, hora de entrada, hora de salida, ficha y si portó equipos.

### 10.2 Ver las Firmas Digitales de un Activo
1. En la tabla de historial, localice el registro del ingreso que posea equipos portados.
2. Haga clic en el ícono de **"Ver Detalle de Máquina / Firmas"**.
3. Se abrirá una ventana mostrando la **firma digital estampada al entrar** y la **firma digital estampada al salir**, junto con los seriales y marcas para respaldo probatorio.

### 10.3 Descargar Reportes Oficiales en PDF y Excel
1. Aplique los filtros deseados en la pantalla de historial.
2. Para reporte impreso: Haga clic en el botón rojo **"Exportar a PDF"**. Se descargará un documento con membrete oficial del SENA, listo para imprimir y presentar en comités.
3. Para análisis en hoja de cálculo: Haga clic en el botón verde **"Exportar a Excel"**. Se descargará un archivo `.xlsx` con todos los datos tabulados.

---

# 11. Mensajes de Error Frecuentes y Cómo Resolverlos

| Mensaje en Pantalla | ¿Por qué ocurre? | ¿Cómo solucionarlo? |
| :--- | :--- | :--- |
| *"Aprendiz no encontrado en el sistema"* | El documento digitado no está registrado o el aprendiz fue dado de baja. | Verifique que el número de cédula/TI esté bien digitado o matricúlelo en la ficha correspondiente. |
| *"El equipo con serial [XXX] ya se encuentra dentro"* | Se intenta ingresar un portátil que figura como 'dentro' y no ha sido retirado. | Verifique en el historial si el equipo fue ingresado previamente por otro aprendiz y no firmó la salida. |
| *"Debe registrar la firma de salida antes de retirarse"* | El aprendiz intenta salir pero tiene un computador registrado en estado 'dentro'. | Abra el modal de retiro de equipos y solicite al aprendiz firmar la entrega de su portátil. |
| *"Acceso fuera de horario: Ingrese motivo de visita"* | El aprendiz asiste un día u hora en que su ficha no tiene clases programadas. | Pregunte al aprendiz el motivo de su visita (ej. *Biblioteca*, *Asesoría*) y digítelo en el campo de texto. |
| *"Correo o contraseña incorrectos"* | Las credenciales de acceso están mal digitadas. | Revise que las mayúsculas/minúsculas de la contraseña sean correctas. |

---

# 12. Buenas Prácticas y Recomendaciones

1. **Nunca preste su cuenta de celador**: Cada registro de ingreso y salida queda grabado con la fecha y hora exacta. Trabaje siempre con su propio usuario.
2. **Exija la firma en pantalla**: No firme usted en lugar del aprendiz. La firma manuscrita es la única prueba legal que respalda que el aprendiz ingresó o retiró su equipo personal.
3. **Cierre su sesión al entregar el puesto**: Al terminar su turno de portería, presione siempre **"Cerrar Sesión"** para que el compañero entrante ingrese con su propio usuario.
4. **Mantenga limpio el lector de código de barras**: Para evitar demoras, asegúrese de que el lente de la pistola lectora esté limpio y pida a los aprendices presentar su carné sin dobleces sobre el código.

---

# 13. Canales de Soporte y Ayuda

Si presenta fallas técnicas en el sistema (el escáner no responde, la pantalla se queda cargando o la red local se desconecta):

1. **Paso 1**: Recargue la página en el navegador presionando la tecla `F5` o el botón de refrescar.
2. **Paso 2**: Si el problema continúa, verifique que el cable de red del computador de portería esté bien conectado.
3. **Paso 3**: Comuníquese con la oficina de **Sistemas y Soporte TI del CTA** o reporte la novedad al **Coordinador Académico de Turno**, indicando el mensaje exacto que aparece en pantalla y la hora del suceso.
