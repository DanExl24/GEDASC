# Heurísticas y principios para fundamentar la crítica

Cita el principio que se viola en cada problema. Convierte una opinión ("está feo") en un diagnóstico ("la acción destructiva tiene el mismo peso visual que la principal: viola la prevención de errores").

## Las 10 heurísticas de usabilidad (Nielsen)

| # | Heurística | Señales de violación |
| :-: | :--- | :--- |
| 1 | **Visibilidad del estado del sistema** | Botones que no reaccionan al pulsarlos; guardados sin confirmación; cargas sin indicador. |
| 2 | **Correspondencia con el mundo real** | Jerga técnica o interna ("Entidad", "Registro 0x"), iconos sin significado para el usuario, orden ilógico para el dominio. |
| 3 | **Control y libertad del usuario** | Sin deshacer ni cancelar; modales sin salida clara; flujos que obligan a empezar de cero. |
| 4 | **Consistencia y estándares** | El mismo concepto con nombres o iconos distintos; botones primarios que cambian de lugar entre pantallas. |
| 5 | **Prevención de errores** | Borrar junto a guardar con el mismo estilo; campos sin restricciones evidentes; acciones irreversibles sin confirmación. |
| 6 | **Reconocer mejor que recordar** | Obligar a recordar un código de otra pantalla; filtros activos que no se ven; placeholders como única etiqueta. |
| 7 | **Flexibilidad y eficiencia** | Usuarios intensivos sin atajos, acciones en lote ni filtros guardados. |
| 8 | **Diseño estético y minimalista** | Decoración que compite con el contenido; información irrelevante para la tarea. |
| 9 | **Ayudar a reconocer, diagnosticar y recuperarse de errores** | "Error 500", "Algo salió mal" sin explicación ni salida; errores lejos del campo que los causa. |
| 10 | **Ayuda y documentación** | Funciones complejas sin ayuda contextual; tooltips ausentes en iconos ambiguos. |

## Gestalt (percepción visual)

- **Proximidad:** lo cercano se percibe como relacionado. Etiquetas más cerca del campo anterior que del suyo, o secciones sin separación, rompen la lectura.
- **Similitud:** lo que se parece se percibe como de la misma clase. Si un enlace y un texto normal se ven igual, el enlace no existe para el usuario.
- **Región común:** los contenedores (cards, fondos) agrupan. Demasiadas cajas anidadas generan ruido.
- **Continuidad y alineación:** una rejilla clara permite escanear; elementos desalineados obligan a releer.
- **Figura y fondo:** el contenido principal debe separarse claramente del fondo y de los elementos secundarios.

## Leyes y efectos útiles

- **Von Restorff (aislamiento):** lo diferente se recuerda y destaca. La acción principal debe ser la única con ese tratamiento visual.
- **Hick:** más opciones = más tiempo de decisión. Menús de 20 elementos planos, toolbars con 12 botones.
- **Fitts:** el tiempo para alcanzar un objetivo depende de su tamaño y distancia. Botones pequeños, acciones frecuentes en esquinas lejanas, objetivos táctiles diminutos.
- **Jakob:** los usuarios pasan la mayor parte del tiempo en otras webs; esperan que la tuya funcione igual (logo arriba a la izquierda lleva al inicio, carrito arriba a la derecha…).
- **Carga cognitiva:** la memoria de trabajo es limitada; agrupa (chunking), muestra progresivamente, elimina lo innecesario.
- **Efecto estético-usabilidad:** las interfaces atractivas se perciben como más usables, lo que puede ocultar problemas reales en pruebas superficiales.
- **Peak-end:** se recuerda el momento de mayor intensidad y el final. Cuida el final de los flujos (confirmaciones, pantalla de éxito).

## Tipografía y legibilidad

- Longitud de línea cómoda: 45–75 caracteres en textos largos.
- Interlineado del texto de lectura: ~1.4–1.6.
- Escala tipográfica con pocos tamaños y una progresión clara; más de 5–6 tamaños distintos en una pantalla suele indicar falta de sistema.
- Texto de cuerpo en web: 16 px como referencia; nunca por debajo de 12 px para contenido.

## Color

- El color debe comunicar (estado, jerarquía, acción), no decorar al azar.
- Colores semánticos consistentes: un solo rojo para error/destrucción, un verde para éxito, etc.
- Nunca el color como único indicador (también icono o texto).
- Saturación: los colores muy saturados en grandes superficies cansan en uso prolongado.

## Patrones oscuros (dark patterns) a señalar siempre

Confirmshaming ("No, prefiero pagar más"), casillas premarcadas para consentimientos, cancelaciones escondidas, urgencia falsa, costes que aparecen al final. Son problemas de UX **y** a menudo legales.
