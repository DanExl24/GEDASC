# Plantilla de informe de UX

```markdown
# Revisión de UX — <pantalla o flujo>

- Fecha: YYYY-MM-DD
- Objetivo de la pantalla: <tarea principal del usuario>
- Usuario tipo: <uso intensivo / ocasional, contexto>
- Fuente evaluada: <app en ejecución (URL) | capturas | diseños | inferido del código — no verificado visualmente>
- Viewports evaluados: <matriz completa | subconjunto rápido | lista>

## 1. Resumen
- **Lo que funciona (conservar):** …
- **Problemas principales:** …
- **UX:** <diagnóstico de comodidad, fricción y fatiga>
- **UI:** <diagnóstico de consistencia y jerarquía>
- **Responsive:** <diagnóstico en móvil, tablet y laptop>
- Hallazgos: 🔴 n · 🟠 n · 🟡 n · 🔵 n · ℹ️ n

## 2. Puntuación (0–10)

| Dimensión | Nota | Justificación breve |
| :--- | :---: | :--- |
| Diseño visual | | |
| UX y ergonomía | | |
| Responsive | | |
| Accesibilidad visual (percibida) | | |
| Consistencia | | |
| Arquitectura de información | | |
| Experiencia móvil | | |
| **Global** | **/10** | |

## 3. Hallazgos

### [FE-UX-001] <título concreto>
- **Severidad:** HIGH — <justificación>
- **Dónde:** <pantalla, zona, viewport(s)>
- **Problema:** <qué ve y qué sufre el usuario>
- **Principio:** <heurística, ley o principio violado>
- **Antes / Después / Motivo UX:**
  - Actual: …
  - Propuesta: …
  - Motivo UX: …

(… ordenados de mayor a menor severidad; agrupa problemas repetidos)

## 4. Revisión por pantalla
### <Pantalla>
- Estado actual: …
- Jerarquía / densidad / espaciado: …
- Desktop · Tablet · Móvil: …
- Recomendación: …

## 5. Matriz responsive

| Viewport | Estado | Problema principal | Acción |
| :--- | :---: | :--- | :--- |
| 320 × 568 | 🟢/🟡/🔴/⚪ no verificado | | |
| … | | | |

## 6. Recomendaciones de sistema visual
Colores · tipografía · espaciado · botones e inputs · tablas · modales y drawers.

## 7. Propuesta de rediseño global
Cómo debería ser la experiencia ideal, aunque implique reconstruir.

## 8. Plan priorizado
- **Ahora (CRITICAL / HIGH):** - [ ] …
- **Próximo ciclo (MEDIUM):** - [ ] …
- **Oportunista (LOW / INFO):** - [ ] …

## 9. Veredicto
- Conservar: …
- Corregir: …
- Eliminar: …
- Madurez: <qué falta para una experiencia profesional>
- Skills recomendadas para implementar: design-system · responsive-layout · forms · accessibility
```
