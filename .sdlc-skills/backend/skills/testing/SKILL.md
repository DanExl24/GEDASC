---
name: testing
description: "Escribe y audita los tests del backend: qué probar en cada nivel (unitario de reglas de dominio, integración con base de datos real mediante Testcontainers, tests de API en proceso, contract testing con Pact u OpenAPI), aislamiento entre tests, factorías de datos, simulación de HTTP externo sin red real, control del tiempo, tests de autorización entre tenants, idempotencia, concurrencia, migraciones y webhooks, jobs asíncronos, tests intermitentes, cobertura útil y mutation testing. Úsala al añadir tests a servicios, endpoints o repositorios, o ante suites lentas, frágiles o que no detectan regresiones. No para pruebas de carga, DAST ni E2E completos (dominio QA)."
---

# Testing del backend

Los tests de backend que más valor dan **ejercitan el código con sus dependencias reales donde importan** (base de datos, serialización, transacciones) y simulan solo lo externo (proveedores, red). Un test con la base de datos mockeada no detecta el índice único que falta, la consulta mal escrita ni la migración rota.

## Cuándo usarla

- Añadir tests a casos de uso, endpoints, repositorios, consumidores o jobs.
- Definir la estrategia de testing de un servicio.
- Suites lentas, intermitentes o que pasan mientras producción falla.
- Proteger reglas críticas: dinero, permisos, concurrencia, idempotencia, migraciones.

**No es para:** pruebas de carga, DAST y suites E2E entre sistemas → dominio QA (`domains/05_qa_testing_engineering/`) · tests del frontend → `frontend:testing`.

## Paso 0: contexto (ambos modos)

1. Detecta runner y herramientas (Vitest/Jest, pytest, JUnit 5; Testcontainers; supertest/TestClient/MockMvc; WireMock/nock/respx; Pact). Carga [node.md](references/node.md), [python.md](references/python.md) o [java.md](references/java.md).
2. Ejecuta la suite y anota: número de tests por nivel, duración, fallos intermitentes, qué se simula.
3. Identifica el comportamiento crítico sin cubrir (pagos, permisos, transiciones de estado, migraciones).

## Modo Construir

1. **Elige el nivel** con [patterns.md § Niveles](references/patterns.md#qué-probar-en-cada-nivel).
2. **Reglas de dominio** con tests unitarios rápidos y sin infraestructura (incluidos casos negativos y valores frontera).
3. **Repositorios y casos de uso con la base de datos real** del mismo motor y versión (Testcontainers), con migraciones aplicadas.
4. **Tests de API en proceso** (servidor levantado en el test) para validación, códigos, formato de errores y autorización.
5. **Externos simulados** en la frontera HTTP; la red real bloqueada en tests.
6. **Datos con factorías;** cada test crea lo suyo y queda aislado (transacción revertida, truncado o base por worker).
7. **Casos críticos explícitos:** acceso entre tenants, idempotencia, concurrencia, webhooks, migraciones. Ver [patterns.md § Casos críticos](references/patterns.md#casos-críticos).
8. Entrega según [output-formats.md § Construir](../../standards/output-formats.md#modo-construir), con la suite en verde.

## Modo Auditar

1. Clasifica los tests por nivel y revisa qué simulan (¿la base de datos? ¿módulos internos?).
2. Busca aserciones débiles, dependencias entre tests, esperas fijas, tiempo real, red real.
3. Contrasta con el comportamiento crítico: ¿qué regla o permiso podría romperse sin que falle ningún test?
4. Recorre [checklist.md](references/checklist.md).
5. Clasifica con [severity.md](../../standards/severity.md) y entrega según [output-formats.md § Auditar](../../standards/output-formats.md#modo-auditar) con código `BE-TEST`.

## Principios

1. **Simula lo externo, no lo propio:** la base de datos del servicio es parte de lo que se prueba.
2. **El mismo motor de base de datos que producción** (no SQLite en lugar de PostgreSQL).
3. **Cada test es independiente,** crea sus datos y no depende del orden.
4. **Ninguna red real ni tiempo real** en los tests.
5. **Lo crítico se prueba de forma explícita y negativa:** "el usuario del tenant B no puede ver la factura del A".
6. **Un test debe poder fallar:** aserciones sobre el resultado y efectos, no solo "no lanza excepción".
7. **La cobertura orienta; la mutación y los casos críticos dicen si los tests protegen.**

## Referencias

| Archivo | Cuándo cargarlo |
| :--- | :--- |
| [patterns.md](references/patterns.md) | Siempre en modo Construir; en Auditar para las correcciones. |
| [checklist.md](references/checklist.md) | Modo Auditar. |
| [node.md](references/node.md) · [python.md](references/python.md) · [java.md](references/java.md) | Según el stack. |

## Skills relacionadas

- `domain-logic`: reglas e invariantes a cubrir con tests unitarios.
- `data-access` · `schema-and-migrations`: tests de concurrencia, consultas y migraciones con BD real.
- `authorization`: matriz de permisos y acceso entre tenants.
- `api-design`: tests de contrato contra la especificación.
- `integrations` · `async-messaging`: proveedores simulados, webhooks y consumidores idempotentes.
- `tooling`: ejecución de la suite en CI.
