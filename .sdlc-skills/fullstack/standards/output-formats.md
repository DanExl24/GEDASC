# Formatos de entrega

## Modo Construir

1. **Plan breve** con los cambios en cada capa y el orden de despliegue (qué va primero para no romper a los clientes en circulación).
2. **Código** en ambas capas siguiendo las convenciones de cada una.
3. **Verificación** en las dos (type-check, tests) y, si existe, del contrato compartido.
4. **Resumen** con lo pendiente y lo no verificado.
5. **Handoffs** hechos y pendientes (bloque de [handoffs.md](handoffs.md#bloque-de-traza-en-la-entrega)).

## Modo Auditar

```markdown
# Auditoría <skill> — <alcance>

## Resumen
- Alcance: frontend <ruta> · backend <ruta> · compartido <ruta>
- Stack: <cliente> ↔ <servidor>
- Hallazgos: 🔴 n · 🟠 n · 🟡 n · 🔵 n · ℹ️ n
- Veredicto: <una o dos frases>

## Hallazgos

### [FS-<CÓDIGO>-001] <título>
- **Severidad:** HIGH — <justificación>
- **Servidor:** `backend/ruta.ts:42-58` (endpoint)
- **Cliente:** `frontend/ruta.ts:10-25` (consumo)
- **Problema y escenario:** <qué falla, cuándo y con qué datos>
- **Corrección:** <qué capa cambia, código, y orden de despliegue si afecta a clientes>

## Lo que está bien
## Fuera de alcance / otras skills
## Handoffs
- Hechos: <skill> (<alcance>) → <códigos>
- Pendientes: <skill> — <disparador y evidencia>
```

| Skill | Código |
| :--- | :--- |
| contracts | `FS-CONTRACT` |
| topology | `FS-TOPO` |
| flow-diagnosis | `FS-FLOW` |
| audit | conserva `FE-*`, `BE-*` y `FS-*` |
| feature | no emite hallazgos: entrega según su `plan-template.md` |

Los hallazgos de una sola capa usan los códigos y el formato del plugin correspondiente (`frontend`/`backend`).
