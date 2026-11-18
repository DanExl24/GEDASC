# Patrones de UX y formatos de propuesta

## Formato Antes/Después

```text
Actual:
[Descripción exacta del problema: dónde, qué ve el usuario, qué le cuesta]

Propuesta:
[Descripción concreta de la solución: qué se mueve, se elimina, se agrupa o se crea]

Motivo UX:
[Principio que se corrige (heurística, Gestalt, ley) y efecto esperado: menos clics, menos errores, lectura más rápida]
```

Ejemplo:

```text
Actual:
La tabla de facturas muestra 9 columnas. En 390 px el usuario debe desplazarse 600 px a la derecha
para llegar a "Pagar", y no ve a la vez el número de factura y el importe.

Propuesta:
En < 768 px, cada factura se muestra como tarjeta: número y estado arriba, importe destacado a la
derecha, vencimiento debajo y botón "Pagar" a todo el ancho. El resto de columnas, en "Ver detalle".

Motivo UX:
Ley de Fitts (acción principal grande y cercana al pulgar) y reconocer mejor que recordar
(los datos para decidir pagar están juntos). Elimina el scroll horizontal en la tarea principal.
```

## Wireframe textual

Para el modo Diseñar o para describir una propuesta de reestructuración:

```text
[Desktop ≥ 1024]
┌──────────────────────────────────────────────────────────┐
│ Header: título "Facturas" · buscador · [Nueva factura]   │
├───────────────┬──────────────────────────────────────────┤
│ Filtros       │ Resumen: Pendiente 1.240 € · Vencidas 2  │
│ (estado,      ├──────────────────────────────────────────┤
│  fechas)      │ Tabla: Nº · Cliente · Importe · Vence ·  │
│               │        Estado · [Pagar]                  │
└───────────────┴──────────────────────────────────────────┘

[Móvil < 768]
┌────────────────────────┐
│ Facturas        [+]    │
│ [Buscar…] [Filtros (2)]│  ← filtros en hoja inferior
│ Pendiente 1.240 €      │
│ ┌────────────────────┐ │
│ │ F-1023    Vencida  │ │
│ │ Acme SL   320,00 € │ │
│ │ [ Pagar ]          │ │
│ └────────────────────┘ │
└────────────────────────┘
```

## Tablas en móvil: elegir patrón

| Situación | Patrón |
| :--- | :--- |
| El usuario consulta registros uno a uno y actúa sobre ellos | Tarjetas apiladas con los 3–4 datos clave y la acción principal |
| Hay pocas columnas clave y muchas secundarias | Columnas prioritarias + fila expandible con el resto |
| La comparación entre filas y columnas es la tarea (hojas de cálculo, reportes) | Mantener tabla con scroll horizontal **dentro de su contenedor**, primera columna fija |
| Selección y acciones en lote | Tarjetas con checkbox y barra de acciones fija abajo |

El scroll horizontal no es malo en sí; lo malo es usarlo por defecto cuando la tarea no requiere comparar columnas.

## Estados

- **Carga:** skeleton con la forma del contenido para cargas de > ~300 ms; nada para cargas instantáneas (evita el parpadeo); spinner local en acciones puntuales (botón).
- **Vacío inicial:** explica qué aparecerá aquí y ofrece la acción para empezar.
- **Sin resultados:** muestra el filtro/búsqueda activo y cómo limpiarlo.
- **Error:** qué pasó en lenguaje humano, si los datos están a salvo, y "Reintentar".
- **Permisos:** explica por qué no puede ver/hacer algo y a quién pedir acceso, en lugar de esconder o mostrar un error genérico.

## Acciones destructivas

- Borrado de un elemento recuperable: acción directa + "Deshacer" durante unos segundos (mejor que confirmar).
- Borrado irreversible o masivo: confirmación que nombra lo que se borra ("Eliminar 12 facturas") y, si es muy grave, escribir el nombre para confirmar.
- El botón destructivo nunca tiene el estilo de la acción principal ni está en la posición habitual de "Aceptar" sin diferenciación.

## Navegación en móvil

- ≤ 5 destinos principales y uso frecuente: barra inferior.
- Más destinos o jerarquía profunda: menú en drawer con los destinos frecuentes también accesibles desde la pantalla.
- Acciones principales al alcance del pulgar (mitad inferior).

## Modal vs drawer vs página

| Caso | Mejor opción |
| :--- | :--- |
| Confirmación breve, una decisión | Modal pequeño |
| Editar algo sin perder de vista la lista | Drawer lateral (desktop) / hoja inferior o pantalla completa (móvil) |
| Formulario largo o flujo de varios pasos | Página propia (con URL) |
| Información de consulta rápida | Popover / tooltip / panel lateral |

## Formularios desde la UX

- Una columna para formularios de rellenar de arriba abajo; dos columnas solo para campos cortos relacionados (nombre/apellidos, ciudad/código postal).
- Etiqueta arriba del campo para lectura rápida.
- Más de ~8 campos o varios temas: secciones con título o wizard.
- Valores por defecto inteligentes y autocompletado; no pedir lo que el sistema ya sabe.

## Recomendaciones de sistema visual

Cuando la crítica revela falta de sistema, propone reglas concretas para que `design-system` las implemente:
- Escala de espaciado (múltiplos de 4 u 8 px).
- Escala tipográfica (5–6 tamaños con roles: display, título, subtítulo, cuerpo, pequeño).
- Paleta: primario, neutros, semánticos (éxito, aviso, error, info), cada uno con tonos para fondo, borde y texto.
- Variantes de botón (primario, secundario, terciario/ghost, destructivo) y cuándo usar cada una.
