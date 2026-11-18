---
name: performance
description: "Mide, optimiza y audita el rendimiento de un backend: localizar el cuello de botella con trazas, métricas y profiling (CPU, memoria), causas por orden de frecuencia (base de datos, llamadas externas, serialización, CPU en la petición, memoria y GC, contención), particularidades del runtime (event loop de Node, GIL y workers de Python, hilos y virtual threads de la JVM), dimensionado de workers y pools, streaming de respuestas grandes, fugas de memoria, límites de contenedor, pruebas de carga y presupuestos de rendimiento. Úsala ante endpoints lentos, latencias p99 altas, consumo de memoria creciente o antes de un pico de tráfico. No para el detalle de consultas e índices (data-access, schema-and-migrations)."
---

# Rendimiento del backend

La regla de oro: **medir antes de optimizar**. En la mayoría de backends, la latencia está en la base de datos o en llamadas externas, no en el código de la aplicación; optimizar a ciegas gasta tiempo en lo que no importa. Esta skill encuentra el cuello de botella real, lo corrige con la skill adecuada y protege el resultado con pruebas de carga y presupuestos.

## Cuándo usarla

- Endpoints lentos o latencia p95/p99 alta; timeouts bajo carga.
- Memoria que crece hasta que el proceso se reinicia (OOM); CPU saturada.
- Antes de una campaña o pico de tráfico; planificación de capacidad.
- Definir presupuestos de rendimiento o pruebas de carga para endpoints críticos.

**No es para:** la corrección de consultas e índices en sí → `data-access`, `schema-and-migrations` (esta skill las detecta y delega) · caché → `caching` · pruebas de carga como disciplina de QA (scripts k6 completos, escenarios de estrés) → `domains/05_qa_testing_engineering/03_performance_load_audit` (pendiente de migrar) · rendimiento del navegador → `frontend:performance`.

## Paso 0: contexto (ambos modos)

1. Detecta runtime y versión, servidor (Uvicorn/Gunicorn, Node cluster, Tomcat/Netty), modelo de concurrencia, despliegue (réplicas, CPU y memoria por contenedor). Carga [node.md](references/node.md), [python.md](references/python.md) o [java.md](references/java.md).
2. Reúne datos: métricas de latencia por endpoint, trazas de las peticiones lentas, uso de CPU/memoria, métricas del pool y de la base de datos.
3. Define el objetivo: qué endpoint, qué percentil, qué carga (p. ej. "`GET /search` p95 < 300 ms a 200 rps").

## Modo Construir / Optimizar

1. **Localiza el tiempo** con trazas (¿en qué span se va?) y, si es CPU de la aplicación, con un profiler. Ver [patterns.md § Diagnóstico](references/patterns.md#diagnóstico).
2. **Ataca la causa principal** con la [tabla de causas](references/patterns.md#causas-por-orden-de-frecuencia), delegando en la skill correspondiente.
3. **Ajusta la concurrencia** del runtime y el tamaño de workers y pools de forma coherente.
4. **Respuestas grandes** en streaming o en background; nunca cargar en memoria exportaciones enteras.
5. **Verifica** con la misma medición (antes/después) y, para cambios importantes, con una prueba de carga reproducible.
6. **Protege** con un presupuesto (SLO de latencia) y alertas (→ `observability`).
7. Entrega según [output-formats.md § Construir](../../standards/output-formats.md#modo-construir) con métricas antes/después y entorno de medición.

## Modo Auditar

1. Endpoints más lentos y más frecuentes (producto de ambos = impacto total).
2. Para cada uno: desglose del tiempo por trazas; consultas y llamadas externas.
3. Revisa configuración del runtime, workers, pools, timeouts, límites de memoria y código que bloquea.
4. Recorre [checklist.md](references/checklist.md).
5. Clasifica con [severity.md](../../standards/severity.md) y entrega según [output-formats.md § Auditar](../../standards/output-formats.md#modo-auditar) con código `BE-PERF`, indicando cómo se midió.

## Principios

1. **Medir, no adivinar:** trazas y profiling antes de tocar código.
2. **Percentiles, no medias:** la p99 es la experiencia de muchos usuarios.
3. **Primero la base de datos y la red;** el código de la aplicación casi nunca es el primer cuello de botella.
4. **No bloquees el modelo de concurrencia** del runtime (event loop, workers async, hilos de plataforma).
5. **Dimensiona de forma coherente:** workers × pool de conexiones ≤ capacidad de la base de datos.
6. **Lo grande se transmite en streaming o se procesa en background.**
7. **Una mejora sin prueba de carga ni presupuesto se pierde** en el siguiente cambio.

## Referencias

| Archivo | Cuándo cargarlo |
| :--- | :--- |
| [patterns.md](references/patterns.md) | Siempre: diagnóstico, causas, runtime, memoria, carga. |
| [checklist.md](references/checklist.md) | Modo Auditar. |
| [node.md](references/node.md) · [python.md](references/python.md) · [java.md](references/java.md) | Según el stack. |

## Skills relacionadas

- `observability`: trazas, métricas y profiling continuo como fuente de diagnóstico.
- `data-access` · `schema-and-migrations`: N+1, índices, pool, paginación.
- `caching`: cuando la fuente ya es razonable y sigue haciendo falta.
- `integrations`: timeouts y bulkheads de dependencias lentas.
- `async-messaging`: sacar trabajo pesado de la petición.
