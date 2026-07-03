Documentación Técnica - GEDASC V2 6. Fase 6: Gestión Académica y Validación Inteligente de Horarios 📅
Objetivo

Incorporar la estructura académica del centro de formación al sistema de control de acceso, permitiendo que cada ingreso sea validado contra los horarios oficiales de las formaciones activas del aprendiz.

Con esta implementación el sistema deja de considerar únicamente la identidad del aprendiz y comienza a evaluar el contexto académico en el que ocurre cada acceso.

Base de Datos
Nueva tabla: programa

Almacena la información de cada programa de formación ofrecido por la institución.

Campo Descripción
id_programa Identificador único
nombre_programa Nombre oficial del programa
version Versión curricular del programa
estado Activo / Inactivo
nivel Nivel de programa (Técnico, Tecnólogo, etc.)
Nueva tabla: horario

Representa un horario reutilizable que puede ser compartido entre varias formaciones.

Campo Descripción
id_horario Identificador
hora_inicio Hora oficial de inicio
hora_fin Hora oficial de finalización
jornada Mañana / Tarde / Noche
Nueva tabla: horario_dia

Normaliza los días de funcionamiento del horario.

Campo Descripción
id_horario Horario asociado
dia_semana Día habilitado (Lunes-Domingo)

Esta implementación reemplaza el almacenamiento de días mediante JSON, facilitando consultas, reportes y futuras ampliaciones.

Modificación de formacion

La formación (ficha) pasa a representar una ejecución específica de un programa académico.

Campo Descripción
id_formacion Número oficial de ficha
id_programa Programa asociado
id_horario Horario asignado
fecha_inicio Inicio de la ficha
fecha_fin Finalización de la ficha
estado Activa / Finalizada

Una formación pertenece a un único programa y utiliza un único horario, mientras que un mismo horario puede ser reutilizado por múltiples formaciones.

Validación Inteligente de Accesos

Al registrar un ingreso, el sistema ejecutará automáticamente el siguiente proceso:

Obtiene todas las formaciones activas del aprendiz.
Recupera los horarios asociados.
Compara:
Día de la semana.
Hora del ingreso.
Determina si el acceso corresponde a alguna programación académica vigente.

Si existe al menos una coincidencia, el ingreso continúa normalmente.

Si ninguna formación coincide con el momento del ingreso, el sistema solicitará obligatoriamente el motivo de la visita.

Registro del Motivo de Visita

Cuando el ingreso ocurra fuera del horario académico del aprendiz, el sistema solicitará una justificación antes de permitir el acceso.

Ejemplos de motivos:

Biblioteca
Proyecto de formación
Monitoría
Bienestar al Aprendiz
Reunión con instructor
Evento institucional
Trámite administrativo
Otro

Esta información permitirá realizar análisis posteriores sobre el uso del centro fuera del horario académico.

Selección de Formación Activa

Cuando un aprendiz posea múltiples formaciones cuyos horarios sean compatibles con el momento del ingreso, el sistema solicitará cuál de ellas corresponde a la actividad que realizará.

La formación seleccionada quedará registrada dentro de la sesión de acceso.

Esto permitirá generar estadísticas independientes por ficha y programa de formación.

Gestión Histórica de Horarios

Los horarios no serán modificados cuando exista un cambio de programación académica.

En su lugar:

Se crea un nuevo registro de horario.
La formación pasa a utilizar el nuevo horario.
Los accesos históricos conservan la referencia al horario vigente al momento en que fueron registrados.

Esta estrategia garantiza la integridad histórica de la información.

Nuevas Reglas de Negocio
RN-031

Un programa de formación puede estar asociado a múltiples formaciones (fichas).

RN-032

Toda formación debe estar asociada a un único programa académico.

RN-033

Toda formación debe tener exactamente un horario asignado.

RN-034

Un mismo horario podrá ser utilizado por múltiples formaciones.

RN-035

El sistema validará cada ingreso utilizando el día y la hora del acceso contra todas las formaciones activas del aprendiz.

RN-036

Si el ingreso no coincide con ningún horario activo del aprendiz, el sistema solicitará obligatoriamente el motivo de la visita antes de registrar el acceso.

RN-037

Cuando un aprendiz posea múltiples formaciones compatibles con el horario del ingreso, el sistema deberá registrar la formación correspondiente a la sesión.

RN-038

No se permitirá asociar a un aprendiz dos formaciones activas cuyos horarios presenten superposición temporal.

RN-039

Los cambios de horario no modificarán registros históricos; se deberá crear un nuevo horario y actualizar la formación correspondiente.

Comentario

futura V3

En lugar de que el celador tenga que decidir si un ingreso está "dentro" o "fuera" del horario, el sistema podría calcular un estado de asistencia automáticamente:

Puntual: ingreso dentro de un margen permitido (por ejemplo, ±15 minutos del inicio).
Tardanza: ingreso posterior al margen establecido.
Fuera de horario: ingreso sin coincidencia con ninguna formación activa.
Acceso extraordinario: ingreso autorizado mediante un motivo de visita
