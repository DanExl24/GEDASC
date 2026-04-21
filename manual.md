# Manual de Usuario - GEDASC

## 1. Objetivo del sistema

GEDASC es un sistema de control de acceso para registrar y consultar:

- ingresos de aprendices
- salidas de aprendices
- equipos y vehiculos asociados al ingreso
- historial de movimientos
- reportes exportables
- seguimiento administrativo
- alertas por prestamos e inasistencias

El sistema tiene dos perfiles principales:

- `CELADOR`
- `ADMIN`

## 2. Inicio de sesion

Al ingresar al sistema, la ruta principal abre la pantalla de login.

### Pasos para iniciar sesion

1. Ingrese el usuario asignado en el campo `Usuario`.
2. Ingrese la clave en el campo `Contraseña`.
3. Presione `Acceder al sistema`.
4. Si las credenciales son correctas, el sistema lo llevara al `Dashboard`.

### Recomendaciones

- Verifique que el usuario este escrito correctamente.
- Si aparece un mensaje de credenciales invalidas, revise usuario y contraseña antes de intentar otra vez.
- Si ya tiene una sesion activa y entra a la ruta de login, el sistema lo redirige automaticamente al dashboard.

## 3. Cerrar sesion

En el encabezado superior aparece el boton `Cerrar sesion` cuando hay una sesion activa.

### Pasos

1. Haga clic en `Cerrar sesion`.
2. El sistema eliminara la sesion actual.
3. Sera redirigido nuevamente al login.

## 4. Dashboard

El `Dashboard` es el punto de entrada principal despues del login.

### Que muestra

- resumen operativo del dia
- accesos directos a los modulos
- estadisticas basicas
- para administradores, widgets adicionales de control y seguimiento

### Diferencia por rol

#### Celador

Ve los modulos operativos del dia:

- Ingreso general
- Salida general
- Historial general
- Equipos y vehiculos
- Reportes y estadisticas

#### Administrador

Ve los modulos administrativos:

- Historial general
- Equipos y vehiculos
- Reportes y estadisticas
- Correccion de registros
- Maquinas prestadas
- Aprendices y actividad
- Centro de alertas

## 5. Uso para celadores

El perfil `CELADOR` se enfoca en registrar movimientos y consultar informacion operativa.

### 5.1 Ingreso general

Modulo para registrar la entrada de aprendices al centro.

#### Formas de registrar un ingreso

- Escaneando el aprendiz
- Ingreso manual

#### Escanear aprendiz

1. Entre al modulo `Ingreso general`.
2. Presione `Escanear aprendiz`.
3. Capture el codigo o documento segun el flujo configurado.
4. El sistema validara si:
   - el aprendiz existe
   - ya tiene ingreso registrado
5. Si todo es correcto, el ingreso queda guardado.

#### Ingreso manual

1. Presione `Ingreso manual`.
2. Digite el `Documento de identidad`.
3. El sistema intentara completar automaticamente:
   - nombre
   - apellido
   - programa de formacion
4. Presione `Añadir ingreso`.

#### Registro de maquina en ingreso

Despues del ingreso, el aprendiz puede quedar pendiente de registrar maquina.

Desde la tabla operativa:

- se puede asociar un computador o vehiculo
- se registra:
  - tipo de maquina
  - tipo de vehiculo, si aplica
  - marca
  - placa o serial
  - firma, si corresponde

#### Casos especiales del registro de maquina

El sistema puede advertir situaciones como:

- la maquina ya pertenece a otro aprendiz
- el aprendiz ya tiene maquina principal
- la maquina esta siendo prestada

En esos casos, el sistema pide confirmacion antes de continuar.

### 5.2 Salida general

Modulo para registrar la salida de aprendices.

#### Formas de registrar una salida

- Escaneando el aprendiz
- Salida manual

#### Escanear salida

1. Entre a `Salida general`.
2. Presione `Escanear aprendiz`.
3. El sistema verificara:
   - si el aprendiz existe
   - si tiene ingreso registrado
   - si ya habia registrado salida
4. Si la validacion es correcta, la salida se registra.

#### Salida manual

1. Presione `Salida manual`.
2. Digite el documento.
3. Revise que el sistema complete correctamente:
   - nombre
   - apellido
   - programa
4. Presione `Añadir salida`.

### 5.3 Historial general

Modulo para consultar movimientos historicos de aprendices.

#### Filtros disponibles

- programa de formacion
- fecha
- busqueda por nombre, apellido o documento

#### Que puede hacer aqui

- revisar ingresos y salidas historicas
- consultar registros con maquina asociada
- abrir el detalle de maquinas vinculadas a un movimiento

Este modulo es de consulta. No registra ni elimina movimientos.

### 5.4 Equipos y vehiculos

Vista unificada del historial de activos registrados.

#### Permite

- alternar entre `Computadores` y `Vehiculos`
- filtrar por fecha con rangos comunes
- buscar por:
  - serial
  - placa
  - propietario
  - receptor
  - documento

#### Uso recomendado

- validar que un equipo o vehiculo si fue registrado
- revisar propietario asociado
- consultar detalle del activo segun el historial

### 5.5 Reportes y estadisticas

Modulo para preparar exportaciones a PDF o Excel.

#### Tipos de reporte

- Reporte de ingresos
- Reporte de salidas
- Registro historico
- Reporte de activos

#### Flujo para generar un reporte

1. Entre a `Reportes y estadisticas`.
2. Seleccione el tipo de reporte.
3. Configure los filtros que necesite.
4. Revise el resumen de configuracion.
5. Presione:
   - `Exportar a PDF`
   - o `Exportar a Excel`

#### Filtros segun el reporte

Segun el reporte, puede usar:

- fecha
- programa
- busqueda por nombre, apellido o documento
- estado de relacion con maquina
- tipo de activo

## 6. Uso para administradores

El perfil `ADMIN` tiene acceso a modulos de supervision, correccion y analitica.

### 6.1 Correccion de registros

Modulo para eliminar ingresos o salidas de forma controlada.

#### Importante

Este modulo debe usarse solo para correcciones justificadas.

#### Filtros y consulta

- busqueda por aprendiz
- filtro de fecha por rangos comunes
- boton `Actualizar` para recargar resultados

#### Como eliminar un ingreso o salida

1. Entre a `Correccion de registros`.
2. Busque el registro objetivo.
3. Presione:
   - `Eliminar ingreso`
   - o `Eliminar salida`
4. En la ventana de confirmacion diligencie:
   - documento o nombre completo del aprendiz
   - observacion o motivo
5. Verifique la fecha del movimiento mostrada por el sistema.
6. Confirme la eliminacion.

#### Recomendaciones

- Nunca elimine un registro sin validar antes el aprendiz correcto.
- Siempre escriba un motivo claro.
- Revise si el movimiento esta completo o pendiente antes de decidir que eliminar.

### 6.2 Maquinas prestadas

Modulo para revisar prestamos detectados entre aprendices.

#### Que muestra

- quien presta la maquina
- quien la recibe
- documento del receptor
- identificador del activo
- tiempo transcurrido desde el registro

#### Filtros disponibles

- vista de `Computadores` o `Vehiculos`
- filtro de fecha:
  - Hoy
  - Ayer
  - Esta semana
  - Semana pasada
  - Este mes
  - Mes pasado
  - Este trimestre
- busqueda por serial, placa, propietario, receptor o documento

#### Interpretacion de la columna Tiempo

La columna `Tiempo` muestra:

- `Hoy`
- `Hace 1 dia`
- `Hace X dias`
- o una fecha tipo `4 de abril`

Esto indica cuando se registro el prestamo en el sistema.

### 6.3 Aprendices y actividad

Modulo administrativo para seguimiento de aprendices y actividad acumulada.

#### Permite

- buscar por nombre, apellido o documento
- filtrar por dias sin asistir
- consultar sesiones y horas activas
- ver la ultima visita registrada
- abrir el detalle de maquinas del aprendiz

#### Uso recomendado

Sirve para:

- detectar aprendices con baja asistencia
- validar actividad acumulada
- revisar maquinas principales y secundarias
- confirmar si existen registros de firma asociados

### 6.4 Centro de alertas

Modulo de monitoreo administrativo.

#### Tipos de alerta

- prestamos de maquinas entre aprendices
- inasistencia prolongada

#### Que incluye cada alerta

- nombre del aprendiz
- documento
- resumen del evento
- detalles del prestador o receptor
- fecha y hora del evento

#### Uso recomendado

- revisar prestamos no esperados
- identificar aprendices con varios dias sin actividad
- priorizar validaciones o seguimientos

## 7. Funcionalidad comun: busquedas y filtros

En la mayoria de vistas existen controles de busqueda y filtro.

### Busquedas

Normalmente permiten encontrar informacion por:

- documento
- nombre
- apellido
- serial
- placa

### Filtros de fecha

El sistema usa rangos comunes para varias consultas:

- Hoy
- Ayer
- Esta semana
- Semana pasada
- Este mes
- Mes pasado
- Este trimestre

### Recomendacion de uso

Si no encuentra un dato:

1. limpie la busqueda
2. revise el filtro de fecha
3. revise el tipo de vista activa
4. actualice la tabla o recargue la consulta

## 8. Exportacion de reportes

Los reportes pueden exportarse desde el modulo `Reportes y estadisticas`.

### Formatos disponibles

- PDF
- Excel

### Buenas practicas antes de exportar

- seleccione el tipo de reporte correcto
- confirme la fecha
- confirme el programa si aplica
- revise la busqueda escrita
- verifique el resumen de configuracion actual

## 9. Buenas practicas operativas

- Use `Ingreso manual` o `Salida manual` solo cuando el escaneo no sea posible.
- Revise siempre el documento antes de confirmar un movimiento.
- Si el sistema completa nombre y programa, confirme que correspondan al aprendiz correcto.
- Registre la maquina asociada al ingreso cuando aplique.
- En administracion, use la eliminacion de registros solo para corregir errores reales.
- Antes de generar un reporte, verifique filtros y rango de fecha.
- Cierre sesion cuando termine su jornada.

## 10. Solucion de problemas comunes

### No puedo iniciar sesion

- Revise usuario y contraseña.
- Asegurese de que su cuenta este habilitada.

### El aprendiz no aparece al escanear

- Verifique que el documento o codigo sea correcto.
- Si persiste, use ingreso o salida manual para confirmar si existe en la base de datos.

### El sistema dice que el aprendiz ya esta registrado

Significa que ya existe un movimiento activo o que el flujo no corresponde al estado actual del aprendiz.

Ejemplos:

- en ingreso, ya tiene entrada registrada
- en salida, no tiene ingreso valido o ya registro salida

### No encuentro un registro en tablas historicas

- Revise la fecha seleccionada.
- Revise el programa.
- Limpie la busqueda.
- Cambie la vista entre computadores y vehiculos si esta buscando un activo.

### No puedo eliminar un registro

Revise que haya completado:

- verificacion por documento o nombre completo
- motivo de eliminacion
- registro correcto seleccionado

## 11. Resumen rapido por rol

### Celador

Usa principalmente:

- Ingreso general
- Salida general
- Historial general
- Equipos y vehiculos
- Reportes y estadisticas

### Administrador

Usa principalmente:

- Correccion de registros
- Maquinas prestadas
- Aprendices y actividad
- Centro de alertas
- Reportes y estadisticas
- Historial general

## 12. Cierre

GEDASC esta diseñado para mantener trazabilidad de acceso, maquinas y actividad de aprendices dentro del centro. El uso correcto del sistema depende de:

- registrar los movimientos en el modulo correcto
- validar siempre la identidad del aprendiz
- aplicar filtros antes de consultar o exportar
- usar las herramientas administrativas con criterio y respaldo operativo

