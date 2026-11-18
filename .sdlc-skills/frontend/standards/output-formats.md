# Formatos de entrega

Cada skill trabaja en dos modos. Este archivo define qué entrega cada uno.

---

## Modo Construir

Cuando el usuario pide crear, implementar o refactorizar algo:

1. **Plan breve** (antes de escribir código, si el cambio toca más de 2–3 archivos): qué archivos se crean o modifican y por qué.
2. **Código** aplicado directamente en el repositorio, siguiendo las convenciones existentes del proyecto (estilo, librerías, estructura). No introduzcas una librería nueva si el proyecto ya tiene una que resuelve lo mismo; si propones una, justifícalo.
3. **Verificación**: ejecuta lo que el proyecto tenga (type-check, lint, tests). Si algo no se pudo verificar, dilo explícitamente.
4. **Resumen final**: qué cambió, decisiones tomadas y qué queda pendiente.

---

## Modo Auditar

Cuando el usuario pide revisar, diagnosticar o evaluar código existente. El informe va en el chat; si es largo o el usuario lo pide, también en un archivo `audit-<skill>-<fecha>.md`.

```markdown
# Auditoría <skill> — <alcance>

## Resumen
- Alcance: <rutas o módulos revisados> (<N> archivos)
- Stack detectado: <framework, versión, librerías clave>
- Hallazgos: 🔴 <n> · 🟠 <n> · 🟡 <n> · 🔵 <n> · ℹ️ <n>
- Veredicto: <una o dos frases con el estado general y el riesgo principal>

## Hallazgos

### [FE-<CÓDIGO>-001] <Título concreto del defecto>
- **Severidad:** HIGH — <justificación en una línea>
- **Ubicación:** `ruta/archivo.ts:42-58`
- **Problema:** qué está mal y qué consecuencia tiene en ejecución o mantenimiento.
- **Evidencia:**
  ```ts
  // fragmento real, mínimo necesario
  ```
- **Corrección:**
  ```ts
  // código corregido, listo para aplicar
  ```

(… un bloque por hallazgo, ordenados de mayor a menor severidad)

## Lo que está bien
Prácticas correctas que conviene conservar (breve; sirve para no "arreglar" lo que funciona).

## Fuera de alcance / otras skills
Problemas detectados que pertenecen a otra skill, con la skill sugerida.
```

### Códigos de hallazgo por skill

| Skill | Código |
| :--- | :--- |
| architecture | `FE-ARCH` |
| typescript | `FE-TS` |
| data-fetching | `FE-DATA` |
| state-management | `FE-STATE` |
| forms | `FE-FORM` |
| ux-review | `FE-UX` (usa su propia plantilla de informe, con los mismos niveles de severidad) |
| design-system | `FE-DS` |
| accessibility | `FE-A11Y` |
| responsive-layout | `FE-RESP` (usa su propia plantilla de informe, con la matriz de viewports) |
| performance | `FE-PERF` (incluye métricas medidas y entorno de medición) |
| rendering-and-seo | `FE-SEO` |
| routing | `FE-ROUTE` |
| security | `FE-SEC` |
| testing | `FE-TEST` |
| observability | `FE-OBS` |
| i18n | `FE-I18N` |
| tooling | `FE-TOOL` |
| audit | Conserva los códigos de cada skill; usa su propia plantilla de dictamen consolidado con puntuación |

### Reglas del informe

- Cada hallazgo cita archivo y líneas reales. Nada de hallazgos genéricos ("podría mejorarse el tipado").
- La corrección es código aplicable, no una descripción.
- Agrupa defectos repetidos: un hallazgo con la lista de ubicaciones, no diez hallazgos iguales.
- Si el usuario lo pide, después del informe aplica las correcciones (pasa a modo Construir).
