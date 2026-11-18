# Dictamen consolidado y rúbrica

## Rúbrica de puntuación

### Por área (cada skill aplicada)

```text
puntuación = max(0, 100 − 25·CRITICAL − 10·HIGH − 4·MEDIUM − 1·LOW)
```

- INFO no resta.
- Un hallazgo agrupado (el mismo defecto en varios sitios) cuenta **una vez**, con la severidad de su alcance total.
- Un hallazgo deduplicado entre áreas resta en el área de su **causa raíz**.
- **Ausencia de la capacidad central:** si el área no existe en el proyecto (cero tests en `testing`; sin logs estructurados, métricas ni health checks en `observability`; sin type-check, lint ni CI en `tooling`; sin migraciones versionadas en `schema-and-migrations`; rutas sin ninguna protección en `authorization`), la nota del área **no supera 40**, aunque se registre como un único hallazgo agrupado. La fórmula mide defectos de lo que existe; el tope refleja lo que falta.

### Global

```text
global = media ponderada de las áreas auditadas
```

- Peso 1 por defecto; peso 2 en las áreas críticas para el contexto, declarándolas. Ejemplos: `authorization`, `api-security` y `data-privacy` en SaaS multi-tenant o con datos sensibles; `data-access` y `domain-logic` en sistemas financieros o de inventario; `api-design` en APIs públicas; `performance` y `caching` en servicios de alto tráfico.
- **Tope:** con algún CRITICAL abierto, la global no supera **49**.
- Solo cuentan las áreas auditadas.
- En modo **rápido** no se calcula nota global (pocas áreas con checklists parciales no son comparables): solo hallazgos y notas de las áreas revisadas.

| Rango | Lectura |
| :--- | :--- |
| 90–100 | Sólido: mantener y vigilar regresiones |
| 75–89 | Bueno: deuda acotada, planificable |
| 50–74 | Necesita trabajo: riesgos reales en producción |
| 0–49 | Crítico: actuar antes de seguir añadiendo funcionalidad |

La puntuación sirve para priorizar y comparar en el tiempo con la misma rúbrica; no es una certificación.

---

## Plantilla del dictamen

```markdown
# Auditoría backend — <servicio / alcance>

- Fecha: YYYY-MM-DD
- Alcance: <módulos/endpoints> · <N> archivos · entorno evaluado: <repo | staging | métricas de producción>
- Stack: <lenguaje, framework, base de datos, mensajería, versiones>
- Contexto: <API pública/interna, multi-tenant, datos sensibles, escala>
- Ruta aplicada: <número y nombre> — <por qué>
- Modo: <completa | enfocada | rápida> — <elegido por el usuario | por defecto> · skills aplicadas: <lista>
- Límites: <qué no se pudo verificar>

## 1. Resumen ejecutivo
<3–5 frases: estado general, los 2–3 riesgos principales, recomendación>

| Puntuación global | Hallazgos |
| :---: | :--- |
| **NN / 100** (<rango>) | 🔴 n · 🟠 n · 🟡 n · 🔵 n · ℹ️ n |

## 2. Puntuación por área

| Área (skill) | Peso | Nota | 🔴 | 🟠 | 🟡 | 🔵 | Comentario |
| :--- | :---: | :---: | :-: | :-: | :-: | :-: | :--- |
| authorization | 2 | | | | | | |
| data-access | 1 | | | | | | |
| … | | | | | | | |

## 3. Riesgos inmediatos (CRITICAL y HIGH)

### [BE-XXX-001] <título>
- **Severidad:** CRITICAL — <justificación>
- **Áreas:** authorization, api-security
- **Ubicación:** `ruta/archivo.ts:12-30` · `GET /invoices/:id`
- **Escenario:** <petición o secuencia que lo demuestra>
- **Impacto:** <datos, dinero, disponibilidad, cumplimiento>
- **Corrección (causa raíz):**
  ```ts
  // código o SQL
  ```
- **Esfuerzo:** S / M / L · **Riesgo del cambio:** <p. ej. requiere migración sobre tabla grande>

## 4. Resto de hallazgos por área
<MEDIUM, LOW e INFO agrupados por skill, formato abreviado>

## 5. Lo que está bien
<prácticas a conservar>

## 6. Plan de remediación

| Lote | Hallazgos | Skill (modo Construir) | Esfuerzo | Requiere aprobación | Orden |
| :--- | :--- | :--- | :---: | :---: | :---: |
| 1 | BE-AUTHZ-001, BE-AUTHZ-002 | authorization | M | No | Ahora |
| 2 | BE-SCHEMA-003 | schema-and-migrations | M | Sí (tabla de 40 M filas) | Ahora |
| 3 | … | … | … | … | Este ciclo |

## 7. Escalado a otros dominios
| Problema | Evidencia | Dominio recomendado |
| :--- | :--- | :--- |

## 8. (Solo rutas 6 y 7) Veredicto

| Bloque | ¿Listo? | Riesgos abiertos |
| :--- | :---: | :--- |
| Tests | ✅ / ❌ | |
| Migraciones | | |
| Contrato de API | | |
| Seguridad | | |
| Observabilidad y alertas | | |
| Privacidad (si aplica) | | |

**Decisión recomendada:** publicar / publicar con riesgos aceptados (listarlos) / no publicar hasta resolver <hallazgos>.

## Anexo (obligatorio): referencias cargadas

| Skill | SKILL.md | checklist.md | Nota de stack | patterns.md |
| :--- | :-: | :-: | :-: | :-: |
| <skill> | ✅ / ❌ | ✅ / ❌ | ✅ <archivo> / ❌ / n.a. | ✅ / — |

<Si algo no se cargó, explica por qué (coste, no aplica al stack). Esta tabla permite saber qué partes del kit se usaron realmente.>
```
