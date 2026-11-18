# Dictamen consolidado y rúbrica

## Rúbrica de puntuación

### Por área (cada skill aplicada)

```text
puntuación = max(0, 100 − 25·CRITICAL − 10·HIGH − 4·MEDIUM − 1·LOW)
```

- INFO no resta.
- Un hallazgo agrupado (el mismo defecto en varios archivos) cuenta **una vez**, con la severidad que corresponde a su alcance total.
- Un hallazgo deduplicado entre dos áreas resta en el área de su **causa raíz**.
- **Ausencia de la capacidad central:** si el área no existe en el proyecto (cero tests en `testing`; sin manejo ni tracking de errores en `observability`; sin tokens ni componentes base en `design-system`; sin type-check en `typescript`; sin lint ni CI en `tooling`), la nota del área **no supera 40**, aunque se registre como un único hallazgo agrupado. La fórmula mide defectos de lo que existe; el tope refleja lo que falta.

### Global

```text
global = media ponderada de las áreas auditadas
```

- Peso 1 por defecto. Peso 2 para las áreas críticas según el contexto (declara cuáles y por qué). Ejemplos: `security` y `accessibility` en una app pública con requisitos legales; `performance` y `rendering-and-seo` en un e-commerce; `forms` y `data-fetching` en un back-office de captura de datos.
- **Tope:** con algún CRITICAL abierto, la global no supera **49**.
- Solo cuentan las áreas auditadas; no se inventa nota para las demás.
- En modo **rápido** no se calcula nota global (pocas áreas con checklists parciales no son comparables): solo hallazgos y notas de las áreas revisadas.

| Rango | Lectura |
| :--- | :--- |
| 90–100 | Sólido: mantener y vigilar regresiones |
| 75–89 | Bueno: deuda acotada, planificable |
| 50–74 | Necesita trabajo: riesgos reales en producción |
| 0–49 | Crítico: hay que actuar antes de seguir añadiendo funcionalidad |

La puntuación sirve para priorizar y comparar en el tiempo con la misma rúbrica; no es una certificación.

---

## Plantilla del dictamen

```markdown
# Auditoría frontend — <alcance>

- Fecha: YYYY-MM-DD
- Alcance: <rutas/módulos> · <N> archivos · URL evaluada: <si aplica>
- Stack: <framework, versión, librerías clave>
- Tipo de app y contexto: <pública/privada, usuarios, requisitos>
- Ruta aplicada: <número y nombre> — <por qué>
- Modo: <completa | enfocada | rápida> — <elegido por el usuario | por defecto> · skills aplicadas: <lista>
- Límites: <qué no se pudo verificar: sin navegador, sin datos de campo, sin backend…>

## 1. Resumen ejecutivo
<3–5 frases: estado general, los 2–3 riesgos principales y la recomendación>

| Puntuación global | Hallazgos |
| :---: | :--- |
| **NN / 100** (<rango>) | 🔴 n · 🟠 n · 🟡 n · 🔵 n · ℹ️ n |

## 2. Puntuación por área

| Área (skill) | Peso | Nota | 🔴 | 🟠 | 🟡 | 🔵 | Comentario |
| :--- | :---: | :---: | :-: | :-: | :-: | :-: | :--- |
| ux-review | 1 | | | | | | |
| architecture | 1 | | | | | | |
| … | | | | | | | |

## 3. Riesgos inmediatos (CRITICAL y HIGH)

### [FE-XXX-001] <título>
- **Severidad:** CRITICAL — <justificación>
- **Áreas:** security, data-fetching
- **Ubicación:** `ruta/archivo.ts:12-30` (y N ubicaciones más)
- **Problema e impacto:** …
- **Corrección (causa raíz):**
  ```ts
  // código
  ```
- **Esfuerzo estimado:** S / M / L

## 4. Resto de hallazgos por área
<MEDIUM, LOW e INFO agrupados por skill, con el formato estándar abreviado>

## 5. Lo que está bien
<prácticas a conservar>

## 6. Plan de remediación

| Lote | Hallazgos | Skill (modo Construir) | Esfuerzo | Orden |
| :--- | :--- | :--- | :---: | :---: |
| 1 | FE-SEC-001, FE-DATA-002 | security, data-fetching | M | Ahora |
| 2 | FE-A11Y-001…004 | accessibility, design-system | M | Este ciclo |
| 3 | … | … | … | Próximo ciclo |

## 7. Escalado a otros dominios
| Problema | Evidencia | Dominio recomendado |
| :--- | :--- | :--- |

## 8. (Solo ruta 8) Veredicto de release

| Bloque | ¿Listo? | Riesgos abiertos |
| :--- | :---: | :--- |
| Tests | ✅ / ❌ | |
| Rendimiento | | |
| Accesibilidad | | |
| Seguridad | | |
| Observabilidad | | |
| SEO (si aplica) | | |

**Decisión recomendada:** publicar / publicar con riesgos aceptados (listarlos) / no publicar hasta resolver <hallazgos>.

## Anexo (obligatorio): referencias cargadas

| Skill | SKILL.md | checklist.md | Nota de stack | patterns.md |
| :--- | :-: | :-: | :-: | :-: |
| <skill> | ✅ / ❌ | ✅ / ❌ | ✅ <archivo> / ❌ / n.a. | ✅ / — |

<Si algo no se cargó, explica por qué (coste, no aplica al stack). Esta tabla permite saber qué partes del kit se usaron realmente.>
```
