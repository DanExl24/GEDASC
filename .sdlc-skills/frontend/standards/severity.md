# Escala de severidad (frontend)

Toda skill del plugin clasifica sus hallazgos con esta escala. Se juzga el **impacto real para el usuario o el negocio**, no lo feo que se vea el código.

| Nivel | Criterio | Ejemplos frontend | Acción |
| :--- | :--- | :--- | :--- |
| 🔴 **CRITICAL** | Pérdida o corrupción de datos, fuga de información sensible, la app queda inutilizable. | Doble envío que crea cobros duplicados; token de acceso expuesto en el bundle; loop infinito de render; datos de un usuario visibles para otro por caché compartida en SSR. | Detener el despliegue hasta corregir. |
| 🟠 **HIGH** | Un flujo principal falla o se degrada gravemente para muchos usuarios. | Refresh token sin cola que desloguea al usuario en ráfagas de 401; fuga de memoria al navegar entre vistas; respuestas fuera de orden que muestran datos de otro filtro; errores 422 tragados sin feedback. | Corregir antes de liberar el módulo afectado. |
| 🟡 **MEDIUM** | Deuda técnica que ya causa fricción o hará que el próximo cambio falle. | `any` en contratos de API; llamadas HTTP directas en componentes; datos del servidor duplicados a mano en un store global; dependencias circulares entre features. | Planificar en el siguiente ciclo. |
| 🔵 **LOW** | Mejora de mantenibilidad sin impacto actual. | Nombres inconsistentes; tipos locales poco precisos; barrel files que podrían simplificarse. | Corregir de forma oportunista. |
| ℹ️ **INFO** | Observación u oportunidad, sin defecto. | Valorar migrar a TanStack Query; activar `noUncheckedIndexedAccess`. | Informativo. |

### Ejemplos en la capa visual (UX, design system, accesibilidad, responsive)

| Nivel | Ejemplos |
| :--- | :--- |
| 🔴 **CRITICAL** | El usuario no puede completar la tarea principal: botón de pago fuera de pantalla en `1366 × 768` sin scroll posible; trampa de teclado que impide salir de un modal; formulario de login inoperable con lector de pantalla. |
| 🟠 **HIGH** | La tarea se completa con mucha dificultad o error frecuente: scroll horizontal global en móvil; contraste de texto principal por debajo de 4.5:1; acción destructiva sin confirmación junto a la acción principal; modo oscuro con texto invisible. |
| 🟡 **MEDIUM** | Fricción notable pero hay alternativa: jerarquía confusa con varios CTAs primarios; estados vacíos en blanco; colores hardcodeados que rompen el tema; foco visible ausente en componentes secundarios. |
| 🔵 **LOW** | Inconsistencias menores: radios o sombras dispares; espaciados irregulares sin impacto en la lectura. |
| ℹ️ **INFO** | Sugerencias de refinamiento estético sin problema actual. |

## Reglas de clasificación

1. **Impacto × alcance.** Un defecto grave en una pantalla interna poco usada puede bajar un nivel; uno leve en el checkout puede subir uno. Justifica el ajuste en una línea.
2. **Sin evidencia no hay hallazgo.** Si no puedes señalar archivo y líneas, o reproducir el escenario, es una pregunta abierta, no un hallazgo.
3. **No infles.** Si dudas entre dos niveles, elige el menor y explica qué haría falta para subirlo.
4. **Todo CRITICAL está verificado** y el informe dice cómo (archivo y líneas, comando, prueba en el navegador).

## Calibración en casos frontera

| Situación | Severidad | Sube a CRITICAL si… |
| :--- | :--- | :--- |
| Problema visual, de UX o de accesibilidad que dificulta pero **no impide** completar la tarea | Como mucho HIGH | impide completar un flujo principal (pago, login, registro) |
| Ausencia total de tests, manejo de errores u observabilidad | HIGH (con tope de área en la rúbrica de `audit`) | — (es riesgo de detección, no un daño directo) |
| Token o dato sensible en `localStorage` | HIGH (MEDIUM si el access token es de vida corta) | es un secreto de servidor o un token de larga duración con privilegios altos |
| Secreto en el bundle o en variables públicas | CRITICAL si es un secreto real de servidor o de terceros | — · si es una clave publicable por diseño, no es hallazgo |
| Registros duplicados o inválidos **sin impacto económico ni legal** (doble envío o validación saltada en un formulario de asistencia, actividad o registro interno) | HIGH | crea cobros, pedidos, reservas de stock, cambios de permisos o tiene consecuencias legales |
| Fallo en una pantalla interna poco usada | Un nivel menos que el mismo fallo en un flujo principal | — |
| Vulnerabilidad de una dependencia | Según su explotabilidad en el uso real, no solo la severidad del aviso | es explotable en el navegador con datos de usuarios |
