# Checklist de revisión de UX

Evalúa desde la perspectiva del usuario final. Cero análisis de código. Severidad según [severity.md](../../../standards/severity.md) (sección de capa visual).

## 1. Jerarquía visual y foco

- [ ] ¿Qué atrae la mirada en los primeros 3 segundos? ¿Coincide con lo que la pantalla necesita que el usuario haga?
- [ ] ¿Hay una sola acción principal evidente, o varios botones primarios compiten entre sí?
- [ ] ¿Títulos, subtítulos y datos secundarios se diferencian por tamaño, peso y color?
- [ ] ¿Las acciones destructivas o secundarias están claramente subordinadas a la principal?

## 2. Densidad y carga cognitiva

- [ ] ¿La pantalla agobia con demasiadas cards, widgets, números o botones a la vez?
- [ ] ¿Cada elemento aporta valor para la tarea, o hay decoración que distrae?
- [ ] ¿El espaciado permite una lectura descansada? ¿Hay zonas comprimidas o vacíos sin sentido?
- [ ] ¿Se usa la revelación progresiva (detalles bajo demanda) en lugar de mostrarlo todo?
- [ ] Para uso intensivo (8 h/día): ¿la densidad es adecuada o es una interfaz pensada para una demo?

## 3. Arquitectura de información y navegación

- [ ] ¿El usuario sabe dónde está (título claro, navegación activa marcada, migas de pan si hay profundidad)?
- [ ] ¿Las secciones del menú tienen nombres que el usuario entiende (no la jerga interna del equipo)?
- [ ] ¿La navegación es consistente entre pantallas?
- [ ] ¿Se puede volver atrás sin perder el contexto (filtros, scroll, selección)?

## 4. Coherencia del sistema visual

- [ ] ¿Los colores comunican significado de forma consistente (éxito, error, aviso, acción)?
- [ ] ¿La paleta es armónica y cómoda para uso prolongado, o chillona/apagada?
- [ ] ¿Escala tipográfica coherente, textos largos legibles (longitud de línea, interlineado)?
- [ ] ¿Radios, bordes y sombras uniformes, o parecen piezas de librerías distintas?
- [ ] ¿Iconografía consistente (estilo, tamaño, peso) y con significado inequívoco?

## 5. Responsive (matriz de [viewports.md](../../../standards/viewports.md))

- [ ] **Móvil (320–414):** ¿el contenido se reorganiza o solo se encoge? ¿Textos legibles sin zoom? ¿Objetivos táctiles cómodos (≥ 44 px) y separados? ¿Se puede usar con una mano?
- [ ] **Móvil:** ¿la navegación principal sigue siendo accesible (drawer, barra inferior) sin ocupar media pantalla?
- [ ] **Tablet (768–1024):** ¿se aprovecha el ancho (2 columnas, panel lateral) o queda un desktop apretado o un móvil estirado?
- [ ] **Laptop (1280–1440):** ¿con 720–768 px de alto se ve lo importante sin scroll? ¿Modales y CTAs caben?
- [ ] **Widescreen (1920):** ¿el contenido mantiene un ancho legible o se estira de forma grotesca?

## 6. Tablas y datos

- [ ] En móvil, ¿el usuario tiene que arrastrar horizontalmente muchas columnas para leer un registro?
- [ ] ¿Sería mejor una vista de tarjetas, columnas prioritarias con detalle expandible, o el scroll horizontal es aceptable porque la comparación tabular es esencial?
- [ ] ¿Las acciones por fila están siempre al alcance (no al final de 500 px de scroll horizontal)?
- [ ] ¿Ordenación, filtros y búsqueda son evidentes y muestran su estado activo?

## 7. Formularios

- [ ] ¿Etiquetas visibles y permanentes (no solo placeholder)?
- [ ] ¿Campos agrupados en bloques con sentido y en un orden lógico?
- [ ] Si es largo, ¿se divide en pasos o secciones para reducir la carga?
- [ ] ¿Los mensajes de error dicen qué falló y cómo arreglarlo, junto al campo?
- [ ] ¿Se piden solo los datos necesarios?

## 8. Estados de interfaz

- [ ] **Carga:** ¿skeletons con la forma del contenido, o un spinner que bloquea toda la vista?
- [ ] **Vacío:** ¿mensaje útil con acción ("Crea tu primer proyecto") o pantalla en blanco? ¿Se distingue "no hay datos aún" de "tu filtro no tiene resultados"?
- [ ] **Error:** ¿mensaje humano con opción de reintentar?
- [ ] **Éxito:** ¿confirmación clara tras acciones importantes?
- [ ] **Interactivos:** hover, focus, activo, seleccionado y deshabilitado visualmente distinguibles.
- [ ] **Destructivos:** confirmación proporcional al riesgo, con el botón de confirmar diferenciado y texto que diga qué se va a borrar.

## 9. Flujos y fricción

- [ ] ¿Cuántos pasos lleva la tarea principal? ¿Sobra alguno?
- [ ] ¿Hay cambios de contexto innecesarios (abrir otra pantalla para consultar un dato que cabría en un panel o tooltip)?
- [ ] ¿Dónde puede equivocarse el usuario y cómo se recupera?
- [ ] ¿El final del flujo deja claro qué ha pasado y qué hacer después?

## 10. Microcopy

- [ ] ¿Los botones dicen lo que hacen ("Guardar cambios", no "Aceptar" / "OK")?
- [ ] ¿Tono consistente y lenguaje del usuario, sin jerga técnica?
- [ ] ¿Sin patrones oscuros (ver [heuristics.md](heuristics.md#patrones-oscuros-dark-patterns-a-señalar-siempre))?

## 11. Propuestas

- [ ] ¿Cada problema CRITICAL/HIGH tiene una propuesta Antes/Después/Motivo UX?
- [ ] ¿Se ha valorado la reconstrucción completa de las pantallas con problemas estructurales?
