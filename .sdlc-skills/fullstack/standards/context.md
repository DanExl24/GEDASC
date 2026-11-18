# Contexto compartido: `.sdlc/context.md`

Un archivo en la raíz del proyecto donde las skills dejan lo que la siguiente necesita saber: stack, convenciones, decisiones, objetivo en curso, hallazgos abiertos y handoffs pendientes. Evita que cada skill (o cada sesión) vuelva a descubrir lo mismo.

## Cuándo se usa

- **Si existe**, toda skill lo lee en su Paso 0 y respeta sus convenciones y decisiones (o explica por qué las cambia).
- **Se crea** al empezar una tarea encadenada (`feature`, `audit`, una cadena de handoffs) o si el usuario lo pide; nunca en una consulta puntual. Al crearlo, dilo en una línea.
- **Se actualiza** al terminar la tarea, no en cada paso intermedio (salvo en `feature`, que marca el avance del plan).

## Reglas

1. **Breve:** menos de ~150 líneas. Se reescriben las secciones, no se acumula un historial infinito; lo cerrado sale.
2. **Hechos con evidencia:** rutas, versiones, decisiones con su motivo. Nada de opiniones sin fuente.
3. **Sin secretos ni datos personales:** ni claves, ni tokens, ni datos de usuarios, ni contenido de `.env`.
4. **Fechado:** cada decisión y hallazgo lleva fecha y skill de origen; lo que contradice el código actual se marca como obsoleto y se corrige.
5. **El código manda:** si el contexto y el código discrepan, gana el código y se actualiza el contexto.
6. **Versionarlo o no es decisión del usuario:** sugiérelo (útil para el equipo) sin hacerlo por tu cuenta, y no lo añadas a `.gitignore` sin preguntar.

## Plantilla

```markdown
# Contexto SDLC — <proyecto>
Actualizado: YYYY-MM-DD por <plugin:skill>

## Proyecto
- Frontend: <framework y versión> · `<ruta>`
- Backend: <lenguaje, framework y versión> · `<ruta>`
- Base de datos / infraestructura: <…>
- Contrato: <OpenAPI en `<ruta>` | esquemas en `shared/` | ninguno>
- Convenciones: <casing del cable, formato de error, fechas, dinero, estructura de módulos>

## Decisiones
| Fecha | Skill | Decisión | Motivo |
| :--- | :--- | :--- | :--- |

## Objetivo en curso
<feature u objetivo · modo · plan con estado por paso: ✅ hecho, ⏳ en curso, ⬜ pendiente>

## Hallazgos abiertos
| Código | Severidad | Ubicación | Estado |
| :--- | :--- | :--- | :--- |

## Handoffs pendientes
| Origen → destino | Disparador | Alcance |
| :--- | :--- | :--- |

## Skills aplicadas recientemente
| Fecha | Skill | Modo | Alcance |
| :--- | :--- | :--- | :--- |
```
