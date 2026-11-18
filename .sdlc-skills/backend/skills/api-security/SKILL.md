---
name: api-security
description: "Construye y audita la seguridad de una API más allá de autenticación y autorización, según OWASP API Security Top 10: inyecciones (SQL, NoSQL, comandos, plantillas, rutas), consumo de recursos y rate limiting, abuso de flujos de negocio, SSRF, subida de archivos, deserialización insegura, gestión de secretos, configuración insegura (debug, actuators, documentación expuesta), inventario de endpoints, consumo inseguro de APIs de terceros y dependencias vulnerables. Úsala antes de un release, al aceptar URLs, archivos o datos que acaban en comandos o consultas, o tras una alerta de seguridad. No para login y tokens (authentication) ni permisos (authorization)."
---

# Seguridad de la API

Esta skill cubre todo lo que puede comprometer una API **aunque la autenticación y la autorización estén bien hechas**: entrada que se interpreta como código, recursos que se agotan, URLs que hacen que el servidor ataque su propia red, archivos maliciosos, secretos filtrados y dependencias vulnerables.

## Mapa OWASP API Security Top 10 (2023)

| Riesgo | Dónde se cubre |
| :--- | :--- |
| API1 Broken Object Level Authorization | `authorization` |
| API2 Broken Authentication | `authentication` |
| API3 Broken Object Property Level Authorization | `authorization` + `http-layer` (mass assignment) |
| API4 Unrestricted Resource Consumption | **aquí** |
| API5 Broken Function Level Authorization | `authorization` |
| API6 Unrestricted Access to Sensitive Business Flows | **aquí** |
| API7 Server Side Request Forgery | **aquí** |
| API8 Security Misconfiguration | **aquí** (+ `http-layer` para CORS y cabeceras) |
| API9 Improper Inventory Management | **aquí** |
| API10 Unsafe Consumption of APIs | **aquí** (+ `integrations`) |

Además: inyecciones, subida de archivos, deserialización, secretos y dependencias.

## Cuándo usarla

- Endpoints que aceptan URLs, archivos, expresiones de filtrado, nombres de archivo o datos que acaban en comandos, consultas o plantillas.
- Revisión de seguridad antes de un release o de exponer una API a terceros.
- Alertas de dependencias vulnerables o secretos filtrados.
- Abuso: scraping, creación masiva de cuentas, gasto en SMS/email, compras automatizadas de stock limitado.

**No es para:** login, tokens y sesiones → `authentication` · permisos y aislamiento de tenants → `authorization` · validación de forma y mass assignment → `http-layer` · pruebas dinámicas con herramientas DAST contra la app en ejecución → dominio QA (`domains/05_qa_testing_engineering/04_dast_security_zap_audit`).

## Paso 0: contexto (ambos modos)

1. Detecta lenguaje, framework, base de datos (SQL/NoSQL), almacenamiento de archivos, gestor de secretos y despliegue (contenedores, cloud). Carga [node.md](references/node.md), [python.md](references/python.md) o [java.md](references/java.md).
2. Localiza los puntos de entrada de riesgo: URLs aceptadas, uploads, ejecución de procesos, consultas dinámicas, plantillas, deserialización, webhooks, endpoints costosos.
3. Revisa cómo llegan los secretos a la aplicación y el estado de las dependencias.

## Modo Construir

1. **Nunca interpretar la entrada como código:** consultas parametrizadas, procesos con argumentos en array sin shell, rutas de archivo normalizadas dentro de un directorio base, sin plantillas ni deserialización de datos no confiables. Ver [patterns.md § Inyecciones](references/patterns.md#inyecciones).
2. **Límites de recursos** en todas las dimensiones: tasa de peticiones, tamaño, paginación, tiempo, complejidad, coste. Ver [patterns.md § Consumo de recursos](references/patterns.md#consumo-de-recursos).
3. **Flujos de negocio sensibles** con límites de negocio y anti-automatización.
4. **URLs de usuarios** con la defensa SSRF completa (esquema, host, IPs privadas tras resolver DNS, redirecciones).
5. **Uploads** con tamaño máximo, tipo por contenido, nombre aleatorio, almacenamiento aislado y entrega segura.
6. **Secretos** desde un gestor de secretos o el entorno de ejecución; nunca en el repositorio, imágenes o logs; escaneo en CI.
7. **Configuración endurecida** y **dependencias** auditadas y actualizadas.
8. Entrega según [output-formats.md § Construir](../../standards/output-formats.md#modo-construir).

## Modo Auditar

1. Busca los sinks peligrosos ([checklist.md § Cómo inspeccionar](references/checklist.md#cómo-inspeccionar-rápido)) y traza si les llegan datos externos.
2. Revisa límites, configuración de producción, secretos y dependencias (`npm audit`, `pip-audit`, OWASP Dependency-Check/OSV-Scanner, escáner de secretos).
3. Recorre [checklist.md](references/checklist.md).
4. Clasifica con [severity.md](../../standards/severity.md) y entrega según [output-formats.md § Auditar](../../standards/output-formats.md#modo-auditar) con código `BE-SEC`, con CWE y un escenario de explotación reproducible. Las pruebas de explotación solo se ejecutan en entornos autorizados y sin dañar datos.

## Principios

1. **La entrada es datos, nunca código.**
2. **Todo recurso tiene un límite:** peticiones, bytes, filas, tiempo, complejidad y dinero.
3. **El servidor no hace peticiones a URLs arbitrarias** sin validar destino, IP resuelta y redirecciones.
4. **Los archivos de usuarios son hostiles** hasta que se demuestre lo contrario.
5. **Los secretos no viven en el código, las imágenes ni los logs,** y se pueden rotar.
6. **Producción no expone herramientas de desarrollo:** debug, consolas, actuators, documentación interna.
7. **Las dependencias son código propio:** se auditan, se actualizan y se minimizan.

## Referencias

| Archivo | Cuándo cargarlo |
| :--- | :--- |
| [patterns.md](references/patterns.md) | Modo Construir; en Auditar para escribir las correcciones. |
| [checklist.md](references/checklist.md) | Modo Auditar. |
| [node.md](references/node.md) · [python.md](references/python.md) · [java.md](references/java.md) | Según el stack. |

## Skills relacionadas

- `authentication` · `authorization`: los otros riesgos del Top 10.
- `http-layer`: validación, límites de body, CORS, cabeceras y errores sin detalles internos.
- `data-access`: consultas parametrizadas y timeouts.
- `integrations`: webhooks firmados, timeouts y validación de respuestas de terceros.
- `caching`: claves que no mezclan datos de usuarios y cabeceras `private`.
- `observability`: redacción de secretos en logs y health checks sin detalles internos.
- `tooling`: escaneo de secretos y dependencias en CI, imágenes sin root.
- `data-privacy`: cifrado por campo, minimización y retención.
- `frontend:security`: la parte del cliente (XSS, CSP, tokens en el navegador).
