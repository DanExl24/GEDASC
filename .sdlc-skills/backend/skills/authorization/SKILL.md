---
name: authorization
description: "Diseña y audita la autorización en el backend: modelos RBAC, permisos, ABAC/políticas y relaciones (ReBAC), autorización por objeto (BOLA/IDOR) con consultas acotadas por propietario o tenant, autorización por función (endpoints de administración, deny by default), autorización por propiedad (campos legibles y editables por rol), aislamiento multi-tenant (incluido row-level security), recursos anidados, listados y exportaciones, permisos desactualizados en tokens y tests de matriz de permisos. Úsala al añadir roles o recursos compartidos, en sistemas multi-tenant o al revisar endpoints que reciben IDs. No para verificar identidad (authentication)."
---

# Autorización

Autorizar es responder **"¿puede esta identidad hacer esta acción sobre este recurso concreto?"** en cada petición. Es la vulnerabilidad más frecuente de las APIs (OWASP API1, API3 y API5): un endpoint que recibe un ID y no comprueba de quién es expone los datos de todos los clientes.

## Cuándo usarla

- Añadir roles, permisos, equipos, recursos compartidos o planes con funcionalidades distintas.
- Sistemas multi-tenant (SaaS con organizaciones).
- Revisar endpoints que reciben identificadores en la URL, la query o el body.
- Endpoints de administración, exportaciones, búsquedas y listados.

**No es para:** quién es el usuario (login, tokens, sesiones) → `authentication` · ocultar botones en la interfaz → `frontend` (es UX; la autorización real es esta) · campos que el cliente no debe poder enviar → `http-layer` (mass assignment), complementado aquí por rol.

## Paso 0: contexto (ambos modos)

1. Detecta framework y mecanismo actual (guards, decoradores, permission classes, `@PreAuthorize`, librerías como CASL, Casbin, django-guardian, OPA/Cedar, OpenFGA). Carga [node.md](references/node.md), [python.md](references/python.md) o [java.md](references/java.md).
2. Entiende el modelo: ¿hay tenants?, ¿roles globales o por organización?, ¿recursos compartibles entre usuarios?, ¿propiedad de recursos?
3. Haz el inventario de endpoints (rutas registradas) y anota cuáles reciben identificadores.

## Modo Construir

1. **Elige el modelo** según [patterns.md § Modelos](references/patterns.md#modelos): roles con permisos para la mayoría; políticas por atributos cuando la decisión depende del recurso (propietario, estado, tenant); relaciones (ReBAC) cuando hay compartición fina.
2. **Un punto de decisión central** (`can(actor, action, resource)` o policies del framework); nada de `if (user.role === 'admin')` repartido.
3. **Deny by default:** toda ruta exige autenticación y una decisión explícita; las públicas se marcan como tales.
4. **Por objeto en la consulta:** acota las consultas por tenant/propietario (`WHERE id = $1 AND tenant_id = $2`); en recursos anidados, verifica toda la cadena.
5. **Por propiedad:** qué campos lee y escribe cada rol.
6. **Multi-tenant:** tenant tomado de la identidad, presente en todas las consultas, cachés, jobs y búsquedas; row-level security como segunda barrera si la base de datos lo permite.
7. **Tests de matriz** (rol × endpoint × propiedad del recurso), incluido el acceso cruzado entre tenants.
8. Entrega según [output-formats.md § Construir](../../standards/output-formats.md#modo-construir).

## Modo Auditar

1. Para cada endpoint: ¿qué decisión de autorización se toma?, ¿dónde?, ¿con qué datos?
2. Para cada endpoint con ID: ¿la consulta está acotada por propietario/tenant?, ¿y los listados, búsquedas, exportaciones y agregados?
3. Prueba (solo en entornos autorizados) con dos usuarios de distintos tenants: cambiar IDs, acceder a endpoints de admin con un usuario normal, enviar campos de rol o propietario.
4. Recorre [checklist.md](references/checklist.md).
5. Clasifica con [severity.md](../../standards/severity.md) y entrega según [output-formats.md § Auditar](../../standards/output-formats.md#modo-auditar) con código `BE-AUTHZ`, con la petición que demuestra cada hallazgo y su CWE (CWE-639, CWE-285, CWE-862, CWE-863).

## Principios

1. **Deny by default:** sin una regla que lo permita, no se permite.
2. **Cada acceso a un recurso concreto comprueba la relación** actor–recurso, no solo que el actor esté autenticado.
3. **La identidad y el tenant salen del token o la sesión,** nunca de parámetros que envía el cliente.
4. **Las decisiones se toman en un solo sitio** y se aplican igual en API, jobs, exportaciones y búsquedas.
5. **Mejor acotar la consulta que filtrar después:** lo que no se carga no se puede filtrar mal.
6. **Ocultar en la interfaz no es autorizar.**
7. **Probar los permisos como se prueban las reglas de negocio:** con una matriz de casos y casos negativos.

## Referencias

| Archivo | Cuándo cargarlo |
| :--- | :--- |
| [patterns.md](references/patterns.md) | Modo Construir; en Auditar para escribir las correcciones. |
| [checklist.md](references/checklist.md) | Modo Auditar. |
| [node.md](references/node.md) · [python.md](references/python.md) · [java.md](references/java.md) | Según el stack. |

## Skills relacionadas

- `authentication`: la identidad sobre la que se decide.
- `data-access` y `schema-and-migrations`: consultas acotadas por tenant, índices con `tenant_id`, row-level security.
- `http-layer`: mass assignment y DTOs de salida por rol.
- `api-security`: el resto de riesgos de la API.
