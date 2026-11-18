---
name: caching
description: "Diseña y audita la caché en el backend: cuándo cachear (y cuándo no), niveles (HTTP con Cache-Control y ETag, CDN, Redis/Memcached, memoria del proceso), patrones cache-aside, read-through y write-through, TTL e invalidación tras el commit, diseño de claves con tenant y usuario para no mezclar datos, protección contra stampede (single-flight, stale-while-revalidate, jitter), consistencia, comportamiento cuando la caché falla y métricas. Úsala al añadir caché a endpoints o consultas lentas, o ante datos obsoletos, datos de un usuario mostrados a otro o picos de carga al expirar claves. No para optimizar la consulta en sí (data-access, schema-and-migrations)."
---

# Caché

La caché es la herramienta de rendimiento más potente y la que más bugs sutiles introduce: **datos obsoletos, datos de un usuario servidos a otro y caídas en cascada cuando expira una clave muy usada**. Se añade cuando la consulta ya es razonable y se ha medido que hace falta, con una estrategia de invalidación decidida desde el principio.

## Cuándo usarla

- Lecturas frecuentes y costosas de datos que cambian poco (catálogos, configuración, perfiles públicos, resultados de agregaciones).
- Respuestas de APIs externas lentas o con límites de uso.
- Endpoints públicos que pueden servirse desde CDN.
- Síntomas: datos que no se actualizan tras guardar, datos de otro usuario o tenant en una respuesta, picos de carga en la base de datos cuando expiran claves, Redis lleno o expulsando claves importantes.

**No es para:** optimizar la consulta, los índices o el N+1 (hazlo antes de cachear) → `data-access`, `schema-and-migrations` · caché de datos en el cliente → `frontend:data-fetching` · sesiones y rate limiting en Redis (otro uso de Redis, con otras reglas) → `authentication`, `api-security`.

## Paso 0: contexto (ambos modos)

1. Detecta la infraestructura (Redis, Memcached, caché del framework, CDN) y las librerías. Carga [node.md](references/node.md), [python.md](references/python.md) o [java.md](references/java.md).
2. Mide antes de cachear: frecuencia de lectura, coste de la consulta, frecuencia de cambio de los datos y tolerancia a datos desfasados.
3. Inventaria lo que ya se cachea: claves, TTL, quién invalida y cuándo.

## Modo Construir

1. **Decide si cachear** con [patterns.md § Cuándo](references/patterns.md#cuándo-cachear-y-cuándo-no): datos leídos mucho más que escritos y que toleran cierto desfase.
2. **Elige el nivel:** HTTP/CDN para respuestas públicas, Redis para datos compartidos entre instancias, memoria del proceso solo para datos pequeños y casi inmutables.
3. **Cache-aside** como patrón por defecto, **siempre con TTL**.
4. **Claves** con todo lo que afecta al valor: tenant, usuario o permisos, idioma, parámetros, versión del formato. Ver [patterns.md § Claves](references/patterns.md#diseño-de-claves).
5. **Invalidación** tras el commit en cada escritura que afecta al valor (o versionado de claves).
6. **Protección contra stampede** en claves calientes.
7. **Fallo de la caché** = degradación a la fuente con protección, no error.
8. **Métricas** de aciertos, latencia y memoria. Entrega según [output-formats.md § Construir](../../standards/output-formats.md#modo-construir).

## Modo Auditar

1. Para cada clave o caché: qué datos contiene, de quién, cuánto vive y quién la invalida.
2. Busca claves sin tenant/usuario para datos personalizados, cachés sin TTL, escrituras que no invalidan, y cabeceras HTTP que permiten cachear respuestas privadas.
3. Recorre [checklist.md](references/checklist.md).
4. Clasifica con [severity.md](../../standards/severity.md) y entrega según [output-formats.md § Auditar](../../standards/output-formats.md#modo-auditar) con código `BE-CACHE`.

## Principios

1. **Primero la consulta, luego la caché.** Cachear una consulta mala oculta el problema hasta que expira.
2. **Todo valor cacheado tiene TTL,** aunque también se invalide de forma explícita.
3. **La clave incluye todo lo que cambia el valor,** empezando por el tenant y el usuario. Una clave mal diseñada filtra datos entre clientes.
4. **Se invalida después del commit,** no antes.
5. **Las claves calientes se protegen contra el stampede.**
6. **Si la caché cae, el servicio sigue** (más lento, protegido), no falla.
7. **No se cachean decisiones de seguridad ni datos que exigen consistencia estricta** (saldos, stock en el momento de vender, permisos con TTL largo).

## Referencias

| Archivo | Cuándo cargarlo |
| :--- | :--- |
| [patterns.md](references/patterns.md) | Siempre en modo Construir; en Auditar para las correcciones. |
| [checklist.md](references/checklist.md) | Modo Auditar. |
| [node.md](references/node.md) · [python.md](references/python.md) · [java.md](references/java.md) | Según el stack. |

## Skills relacionadas

- `data-access` y `schema-and-migrations`: optimizar antes de cachear.
- `authorization`: el tenant y los permisos forman parte de la clave.
- `integrations`: cachear respuestas de terceros y servir datos cacheados como degradación.
- `api-design`: `ETag`, `Cache-Control` y 304 en el contrato.
- `async-messaging`: invalidación por eventos entre servicios.
- `performance` y `observability`: medir el efecto y vigilar la caché.
