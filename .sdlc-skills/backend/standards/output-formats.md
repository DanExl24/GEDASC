# Formatos de entrega

Cada skill trabaja en dos modos. Este archivo define qué entrega cada uno.

---

## Modo Construir

Cuando el usuario pide crear, implementar o refactorizar algo:

1. **Plan breve** (si el cambio toca más de 2–3 archivos o el esquema de la base de datos): qué se crea o modifica y por qué.
2. **Código** aplicado en el repositorio siguiendo las convenciones existentes (framework, librerías, estructura). No introduzcas una librería si el proyecto ya tiene una que resuelve lo mismo; si propones una, justifícalo.
3. **Migraciones** (si hay cambios de esquema): archivo de migración versionado, revisado para producción (bloqueos, tamaño de tabla, compatibilidad con la versión anterior del código). Nunca cambios manuales en la base de datos.
4. **Verificación**: ejecuta lo que tenga el proyecto (type-check, lint, tests). Si algo no se pudo verificar, dilo explícitamente.
5. **Resumen final**: qué cambió, decisiones tomadas y qué queda pendiente.

---

## Modo Auditar

Cuando el usuario pide revisar, diagnosticar o evaluar código existente. El informe va en el chat; si es largo o el usuario lo pide, también en un archivo `audit-<skill>-<fecha>.md`.

```markdown
# Auditoría <skill> — <alcance>

## Resumen
- Alcance: <rutas, módulos o endpoints revisados> (<N> archivos)
- Stack detectado: <lenguaje, framework, ORM, base de datos y versiones>
- Hallazgos: 🔴 <n> · 🟠 <n> · 🟡 <n> · 🔵 <n> · ℹ️ <n>
- Veredicto: <una o dos frases con el estado general y el riesgo principal>

## Hallazgos

### [BE-<CÓDIGO>-001] <Título concreto del defecto>
- **Severidad:** HIGH — <justificación en una línea>
- **Ubicación:** `ruta/archivo.ts:42-58` (o endpoint / consulta / migración)
- **Problema:** qué está mal y qué consecuencia tiene (datos, dinero, disponibilidad, seguridad).
- **Escenario:** cómo se manifiesta (petición, concurrencia, volumen de datos).
- **Evidencia:**
  ```ts
  // fragmento real, mínimo necesario
  ```
- **Corrección:**
  ```ts
  // código o SQL corregido, listo para aplicar
  ```

(… un bloque por hallazgo, de mayor a menor severidad)

## Lo que está bien
Prácticas correctas que conviene conservar.

## Fuera de alcance / otras skills
Problemas que pertenecen a otra skill o a otro dominio, con el destino sugerido.
```

### Códigos de hallazgo por skill

| Skill | Código | | Skill | Código |
| :--- | :--- | :-: | :--- | :--- |
| http-layer | `BE-HTTP` | | async-messaging | `BE-MSG` |
| domain-logic | `BE-DOM` | | integrations | `BE-INT` |
| data-access | `BE-DATA` | | caching | `BE-CACHE` |
| schema-and-migrations | `BE-SCHEMA` | | observability | `BE-OBS` |
| authentication | `BE-AUTHN` | | performance | `BE-PERF` |
| authorization | `BE-AUTHZ` | | testing | `BE-TEST` |
| api-security | `BE-SEC` | | tooling | `BE-TOOL` |
| architecture | `BE-ARCH` | | data-privacy | `BE-PRIV` |
| api-design | `BE-API` | | audit | conserva los códigos de cada skill |

### Reglas del informe

- Cada hallazgo cita archivo y líneas reales, o la consulta/endpoint concreto.
- La corrección es código o SQL aplicable, no una descripción.
- Agrupa defectos repetidos: un hallazgo con la lista de ubicaciones.
- Los problemas de concurrencia describen la secuencia que los provoca (petición A lee, petición B lee, A escribe, B escribe).
- Si el usuario lo pide, después del informe aplica las correcciones (modo Construir).
