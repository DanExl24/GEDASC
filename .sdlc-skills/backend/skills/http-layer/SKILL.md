---
name: http-layer
description: "Construye y audita la capa HTTP de un backend (Express, Fastify, NestJS, FastAPI, Django/DRF, Spring Boot): validación de entrada en la frontera, mass assignment, DTOs de salida, orden de middlewares, propagación de errores asíncronos, error handler global, límites de payload, timeouts, CORS, cabeceras y graceful shutdown. Úsala al crear endpoints o revisar controladores, middlewares y manejo de errores. No para diseñar el contrato de la API (api-design) ni para autenticación (authentication)."
---

# Capa HTTP

La capa HTTP es la frontera del servicio: **todo lo que entra se valida y todo lo que sale se controla**. Los controladores son delgados (traducen HTTP a casos de uso y de vuelta); la lógica vive en el dominio, y los errores se convierten en respuestas en un solo sitio.

## Cuándo usarla

- Crear endpoints, controladores o middlewares.
- Revisar validación de entrada, respuestas y manejo de errores.
- Síntomas: peticiones colgadas, errores 500 con stack trace, respuestas con campos que no deberían salir (hash de contraseña, campos internos), formatos de error distintos por endpoint, el servidor no se apaga limpiamente en los despliegues.

**No es para:** el diseño del contrato (recursos, códigos de estado, paginación, versionado) → `api-design` · login, tokens y sesiones → `authentication` · permisos → `authorization` · rate limiting y otras defensas de la API → `api-security` · lógica de negocio → `domain-logic`.

## Paso 0: contexto (ambos modos)

1. Detecta lenguaje, framework y versión (`package.json`, `pyproject.toml`/`requirements.txt`, `pom.xml`/`build.gradle`). Carga [node.md](references/node.md), [python.md](references/python.md) o [java.md](references/java.md); para otros stacks aplica [patterns.md](references/patterns.md).
2. Localiza el arranque del servidor, el registro de middlewares, el error handler y cómo se definen rutas y validaciones.

## Modo Construir

1. **Entrada:** schema por endpoint para body, params y query; elimina o rechaza campos desconocidos; coerción explícita de tipos; topes en paginación y tamaños. Ver [patterns.md § Validación](references/patterns.md#validación-en-la-frontera).
2. **Controlador delgado:** valida → llama al caso de uso → mapea el resultado a un DTO de salida → código HTTP.
3. **Salida:** DTOs explícitos; nunca serializar entidades del ORM directamente.
4. **Errores:** errores de dominio tipados que el error handler global traduce a HTTP con un formato único; sin detalles internos en producción.
5. **Pipeline:** orden de middlewares de [patterns.md § Pipeline](references/patterns.md#orden-del-pipeline), límites de body, timeouts del servidor, CORS con lista blanca.
6. **Ciclo de vida:** graceful shutdown (dejar de aceptar, drenar, cerrar conexiones) ante `SIGTERM`.
7. Entrega según [output-formats.md § Construir](../../standards/output-formats.md#modo-construir).

## Modo Auditar

1. Inventaria endpoints y middlewares; para cada endpoint: ¿qué valida?, ¿qué devuelve?, ¿qué pasa si falla?
2. Prueba (si se puede ejecutar) peticiones malformadas, campos extra, payloads grandes y errores forzados.
3. Recorre [checklist.md](references/checklist.md).
4. Clasifica con [severity.md](../../standards/severity.md) y entrega según [output-formats.md § Auditar](../../standards/output-formats.md#modo-auditar) con código `BE-HTTP`.

## Principios

1. **Nada entra sin validar:** body, params, query y headers relevantes, con un schema.
2. **Nada sale sin intención:** DTOs de salida explícitos.
3. **Controladores delgados:** sin reglas de negocio ni SQL.
4. **Un error handler, un formato de error,** sin trazas ni detalles internos fuera de desarrollo.
5. **Ninguna petición puede colgarse:** errores asíncronos propagados y timeouts en todas las capas.
6. **Límites en todo lo que crece:** tamaño de body, elementos por página, longitud de strings, tamaño de arrays.
7. **El servidor se apaga limpio:** sin cortar peticiones en vuelo en cada despliegue.

## Referencias

| Archivo | Cuándo cargarlo |
| :--- | :--- |
| [patterns.md](references/patterns.md) | Modo Construir; en Auditar para escribir las correcciones. |
| [checklist.md](references/checklist.md) | Modo Auditar. |
| [node.md](references/node.md) · [python.md](references/python.md) · [java.md](references/java.md) | Según el stack. |

## Skills relacionadas

- `domain-logic`: casos de uso y errores de dominio que el controlador invoca y traduce.
- `data-access`: lo que no debe hacerse en un controlador (consultas, transacciones).
- `authentication`: middleware de autenticación en el pipeline, cookies y CSRF.
- `authorization`: campos que cada rol puede enviar y ver, además del mass assignment.
- `api-security`: rate limiting, uploads, SSRF y configuración de producción.
- `api-design`: el contrato que esta capa implementa (códigos, errores, paginación, idempotencia).
