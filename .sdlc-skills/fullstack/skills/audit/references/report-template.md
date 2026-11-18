# Dictamen consolidado fullstack y rúbrica

## Deduplicación entre capas

Un riesgo que **necesita las dos capas para existir** (o cuya corrección exige tocar ambas) se consolida en **un hallazgo `FS-*`**. Los hallazgos de capa que lo componen se listan dentro como "Componentes" y no se repiten en su área.

| Componentes encontrados | Hallazgo consolidado |
| :--- | :--- |
| `FE-SEC` token en `localStorage` + `BE-AUTH` API sin cookies ni CSRF coherente | `FS-CONTRACT` estrategia de sesión incoherente (corrección en ambas capas) |
| `FE-FORMS` validación solo en cliente + `BE-HTTP` endpoint sin validación | `FS-FLOW` dato inválido persistido en el flujo X |
| `FE-UX` botón de admin oculto + `BE-AUTHZ` endpoint sin autorización | Se mantiene `BE-AUTHZ` (la causa raíz es solo del servidor); el de frontend se descarta o queda como nota |
| `FE-DATA` el cliente lee `userId` + `BE-API` la API devuelve `user_id` | `FS-CONTRACT` desajuste de nombres |
| `FE-PERF` cascada de peticiones + `BE-PERF` endpoint sin agregación | `FS-FLOW` N+1 entre cliente y API |

Regla: si la causa raíz está **solo** en una capa (el otro lado es correcto o un simple síntoma), el hallazgo se queda en esa capa con su código `FE-*`/`BE-*`. `FS-*` es para lo genuinamente compartido.

## Rúbrica de puntuación

### Por área y por capa

- Cada área (skill) se puntúa con la rúbrica de su plugin: `max(0, 100 − 25·CRITICAL − 10·HIGH − 4·MEDIUM − 1·LOW)`, con el tope de 40 por ausencia de la capacidad central.
- **Nota de capa** (frontend, backend) = media ponderada de sus áreas, como en su `report-template.md`.
- **Entre capas** se puntúa como un área más con la misma fórmula sobre los hallazgos `FS-*`; un hallazgo consolidado resta **solo** aquí, no en las áreas de sus componentes.

### Conjunta

```text
conjunta = (frontend · 1 + backend · 1 + entre capas · 1) / 3
```

- Ajusta pesos según el contexto y decláralo (p. ej. backend 2 en un sistema financiero; entre capas 2 si la ruta es de contrato).
- **Tope:** con algún CRITICAL abierto en cualquier capa, la conjunta no supera **49**.
- Si falta un plugin, la capa ausente no puntúa y la conjunta se marca como **parcial**.
- En modo **rápido** no hay nota conjunta: solo hallazgos y notas de las áreas revisadas.

| Rango | Lectura |
| :--- | :--- |
| 90–100 | Sólido |
| 75–89 | Bueno: deuda acotada |
| 50–74 | Necesita trabajo |
| 0–49 | Crítico: actuar antes de añadir funcionalidad |

---

## Plantilla del dictamen

```markdown
# Auditoría fullstack — <aplicación / alcance>

- Fecha: YYYY-MM-DD
- Alcance: frontend <ruta> · backend <ruta> · compartido <ruta> · <N> archivos
- Stack: <cliente> ↔ <servidor> · <base de datos>
- Contexto: <tipo de producto, datos sensibles, escala>
- Ruta: <número y nombre> — <por qué> · rutas de capa: frontend <n>, backend <n>
- Modo: <completa | enfocada | rápida> — <elegido por el usuario | por defecto>
- Límites: <plugins ausentes, entornos no accesibles, skills omitidas>

## 1. Resumen ejecutivo
<3–5 frases: estado general, los 2–3 riesgos principales (indicando si cruzan capas), recomendación>

| Conjunta | Frontend | Backend | Entre capas | Hallazgos |
| :---: | :---: | :---: | :---: | :--- |
| **NN / 100** | NN | NN | NN | 🔴 n · 🟠 n · 🟡 n · 🔵 n · ℹ️ n |

## 2. Puntuación por área

| Capa | Área (skill) | Peso | Nota | 🔴 | 🟠 | 🟡 | 🔵 | Comentario |
| :--- | :--- | :---: | :---: | :-: | :-: | :-: | :-: | :--- |
| Entre capas | contracts | 1 | | | | | | |
| Backend | authorization | 2 | | | | | | |
| Frontend | security | 1 | | | | | | |

## 3. Riesgos inmediatos (CRITICAL y HIGH)

### [FS-CONTRACT-001] <título>
- **Severidad:** HIGH — <justificación>
- **Servidor:** `apps/api/…:12-30` · `POST /orders`
- **Cliente:** `apps/web/…:40-55`
- **Componentes:** FE-SEC-002, BE-AUTH-004
- **Escenario e impacto:** <…>
- **Corrección:** servidor <…>; cliente <…>
- **Orden de despliegue:** <servidor amplía → cliente migra → servidor retira | conjunto>
- **Esfuerzo:** S / M / L

### [BE-AUTHZ-001] <hallazgo de una sola capa, formato de su plugin>

## 4. Resto de hallazgos por capa y área
## 5. Lo que está bien
## 6. Plan de remediación

| Lote | Hallazgos | Capas | Skill (modo Construir) | Orden de despliegue | Esfuerzo | Aprobación |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: |

## 7. Escalado a otros dominios
## 8. (Rutas 4 y 5) Veredicto conjunto: publicar / con riesgos aceptados / no publicar

## Anexo (obligatorio): referencias cargadas

| Plugin | Skill | SKILL.md | checklist.md | Nota de stack | patterns.md |
| :--- | :--- | :-: | :-: | :-: | :-: |
| fullstack | contracts | ✅ / ❌ | ✅ / ❌ | n.a. | ✅ / — |
| frontend | <skill> | | | ✅ <archivo> / ❌ | |
| backend | <skill> | | | ✅ <archivo> / ❌ | |

<Si algo no se cargó, explica por qué (coste, plugin ausente, no aplica).>
```
