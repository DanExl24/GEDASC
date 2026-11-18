# Plugin `backend`

Skills para diseñar, construir y auditar backends en **Node.js/TypeScript (Express, Fastify, NestJS), Python (FastAPI, Django) y Java (Spring Boot)**. Cada skill:

- Tiene dos modos: **Construir** (crear o refactorizar) y **Auditar** (revisar código existente y emitir un informe con severidades).
- Tiene una base agnóstica de lenguaje y notas por stack (`node.md`, `python.md`, `java.md`) que solo se cargan cuando aplican.
- Comparte la escala de severidad y el formato de informe de [`standards/`](standards/) (códigos `BE-*`).

Incluye el acceso a datos, el esquema de base de datos y la seguridad de servidor: lo que un desarrollador de backend toca dentro de su servicio. Las tres skills de seguridad se reparten el OWASP API Security Top 10 (2023).

## Uso

```bash
/plugin marketplace add <ruta-o-repo-de-este-kit>
/plugin install backend@sdlc-skills
```

```text
/backend:data-access revisa las condiciones de carrera en src/modules/inventory
/backend:schema-and-migrations prepara la migración para añadir full_name sin downtime
```

## Catálogo

| Skill | Estado | Cubre |
| :--- | :---: | :--- |
| `http-layer` | ✅ | Validación en la frontera, mass assignment, DTOs de salida, pipeline de middlewares, error handler, límites, timeouts, CORS, graceful shutdown |
| `domain-logic` | ✅ | Casos de uso, invariantes, máquinas de estado, value objects (dinero), errores de dominio, efectos tras el commit |
| `data-access` | ✅ | N+1, límites y paginación, transacciones y aislamiento, concurrencia (atómicas, optimista, pesimista, upsert), pool y timeouts |
| `schema-and-migrations` | ✅ | Tipos y constraints, índices desde las consultas, EXPLAIN, migraciones sin downtime (expand/contract, concurrentes, backfills) |
| `authentication` | ✅ | Sesiones vs tokens, JWT (verificación, refresh rotativo, revocación), OIDC, hashing, login sin enumeración, reset, MFA, API keys |
| `authorization` | ✅ | RBAC/ABAC/ReBAC, autorización por objeto, función y propiedad, multi-tenant con RLS, listados y exportaciones, tests de matriz |
| `api-security` | ✅ | Resto del OWASP API Top 10: inyecciones, consumo de recursos, flujos de negocio, SSRF, uploads, deserialización, secretos, configuración, dependencias |
| `architecture` | ✅ | Monolito modular vs microservicios, módulos con API pública y tablas propias, capas, puertos para lo externo, DI, verificación con herramientas, strangler fig, ADRs |
| `api-design` | ✅ | Recursos y métodos, códigos, RFC 9457, convenciones, paginación por cursor, Idempotency-Key, ETag/If-Match, operaciones largas, versionado y deprecación, OpenAPI; notas de GraphQL y gRPC |
| `async-messaging` | ✅ | Colas, pub/sub y streams, encolar tras el commit, outbox/inbox, consumidores idempotentes, reintentos y DLQ, orden por clave, cron único, sagas |
| `integrations` | ✅ | Adaptadores, timeouts, reintentos seguros, idempotencia hacia el proveedor, circuit breaker y bulkhead, webhooks entrantes y salientes, polling |
| `caching` | ✅ | Cuándo cachear, niveles, cache-aside con TTL, claves con tenant/usuario, invalidación tras el commit, stampede, fallos de la caché, HTTP caching |
| `observability` | ✅ | Logs estructurados con redacción, correlación y trazas (OpenTelemetry), métricas RED/USE con cardinalidad controlada, health checks, SLOs y alertas por síntomas |
| `performance` | ✅ | Diagnóstico con trazas y profiling, causas por frecuencia, runtime (event loop, GIL, hilos), dimensionado, streaming, memoria, pruebas de carga |
| `testing` | ✅ | Niveles, BD real con Testcontainers, tests de API, simulación de externos, casos críticos (tenants, idempotencia, concurrencia, migraciones), contrato, mutación |
| `tooling` | ✅ | Runtime y lockfile fijados, configuración 12-factor validada, lint y tipos, Docker Compose local, CI con integración y escaneos, imagen multi-stage sin root |
| `data-privacy` | ✅ | Inventario y mapa de copias, minimización, entornos sin datos reales, retención, supresión y exportación, cifrado por campo con KMS, tokenización, auditoría |
| `audit` | ✅ | **Orquestador:** triage, 10 rutas, aplica las skills, deduplica, puntúa (0–100) y propone o ejecuta la remediación por lotes |

¿No sabes por dónde empezar? `/backend:audit` con el alcance y el objetivo.

## Estructura de una skill

```text
skills/<skill>/
├── SKILL.md              # cuándo usarla, modos, flujo y principios
└── references/
    ├── patterns.md       # patrones de construcción y anti-patrones
    ├── checklist.md      # checklist de auditoría con severidad orientativa
    ├── node.md
    ├── python.md
    └── java.md
```
