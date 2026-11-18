# Patrones de rendimiento del backend

## Diagnóstico

1. **¿Dónde está el tiempo?** Traza de una petición lenta: ¿spans de base de datos, de llamadas HTTP, o tiempo "propio" del servicio?
2. **Si es base de datos:** número de consultas (N+1), consultas lentas (`EXPLAIN`), espera de conexión del pool, bloqueos (→ `data-access`, `schema-and-migrations`).
3. **Si son llamadas externas:** latencia del proveedor, llamadas en serie que podrían ir en paralelo, ausencia de timeouts/caché (→ `integrations`, `caching`).
4. **Si es tiempo propio:** profiler de CPU (flame graph) en un entorno con carga realista; busca serialización, bucles sobre colecciones grandes, regex, criptografía, compresión, logs excesivos.
5. **Si la latencia sube con la carga pero cada petición aislada es rápida:** saturación (pool agotado, workers ocupados, event loop bloqueado, contención de locks, GC).

Herramientas: APM/trazas (OpenTelemetry), profiling continuo (Pyroscope, Datadog/Grafana profiler), profilers locales (ver referencias de stack), métricas del pool y de la base de datos (`pg_stat_statements`).

## Causas por orden de frecuencia

| Causa | Señal | Corrección |
| :--- | :--- | :--- |
| N+1, consultas sin índice o sin límite | Muchos spans de BD o uno muy largo | → `data-access`, `schema-and-migrations` |
| Llamadas externas lentas o en serie | Spans HTTP largos | Paralelizar, timeouts, caché, background (→ `integrations`) |
| Pool de conexiones agotado | Espera de adquisición, latencia que sube con la carga | Transacciones cortas, pool coherente (→ `data-access`) |
| Trabajo pesado en la petición | Tiempo propio alto | Background (→ `async-messaging`) o precálculo |
| Serialización de respuestas grandes | CPU en JSON, respuestas de MB | Paginación, proyecciones, streaming |
| CPU que bloquea el modelo de concurrencia | Event loop lag, workers async bloqueados | Ver § Runtime |
| GC y memoria | Pausas, picos de latencia periódicos, OOM | Ver § Memoria |
| Contención (locks de BD, mutex, filas calientes) | Esperas de lock, latencia variable | Reducir sección crítica, actualizaciones atómicas, particionar el contador |
| Logs excesivos o síncronos | CPU/IO en logging | Niveles, logger asíncrono |

## Runtime y concurrencia

### Node.js (event loop único)
- Cualquier tarea síncrona larga (JSON enorme, regex, criptografía síncrona, compresión, bucles sobre miles de elementos) bloquea **todas** las peticiones del proceso.
- CPU pesada → `worker_threads` o un servicio/cola aparte; criptografía con las APIs asíncronas.
- Varios procesos por máquina (cluster, varias réplicas) para usar todos los núcleos.
- Métrica clave: **event loop lag**.

### Python
- **Async (FastAPI/Starlette):** nunca llamadas bloqueantes (driver síncrono, `requests`, `time.sleep`, CPU pesada) dentro de `async def`; si no hay librería async, endpoint `def` (threadpool) o `run_in_threadpool`.
- **WSGI (Django/Flask):** concurrencia = workers × hilos de Gunicorn; dimensiona según CPU y espera de IO.
- **GIL:** CPU pesada en procesos aparte (workers de Celery, `ProcessPoolExecutor`), no en hilos.

### JVM
- Pool de hilos del servidor (Tomcat) dimensionado con el pool de conexiones; **virtual threads** (Java 21, `spring.threads.virtual.enabled=true`) para IO intensivo, cuidando el *pinning* en bloques `synchronized` con IO (mejorado en versiones recientes de Java) y que el pool de BD sigue siendo el límite real.
- Calentamiento (JIT): mide después del warm-up.

### Dimensionado coherente

```text
réplicas × workers (o hilos) que usan la BD × conexiones por worker  ≤  max_connections de la BD − margen
```

Más workers que conexiones disponibles solo traslada la espera al pool. Con muchas réplicas, pooler externo (→ `data-access`).

## Respuestas y payloads

- **Paginación** siempre (→ `api-design`); proyecciones (solo campos necesarios).
- **Streaming** de exportaciones y archivos grandes (CSV por filas desde un cursor de BD, archivos desde el almacenamiento) en lugar de construir todo en memoria; o generación en background con enlace de descarga.
- **Compresión** (gzip/brotli) en el proxy o CDN para respuestas de texto; no comprimas lo ya comprimido.
- **Llamadas en paralelo** cuando son independientes (`Promise.all`, `asyncio.gather`, `CompletableFuture`), con límite de concurrencia.

## Memoria

- **Fugas habituales:** cachés en memoria sin límite, colecciones globales que crecen, listeners o timers no liberados, closures que retienen objetos grandes, conexiones no cerradas.
- **Diagnóstico:** métrica de memoria en el tiempo (diente de sierra sano vs crecimiento sostenido), heap snapshots comparados tras carga, dumps de heap en OOM (JVM `-XX:+HeapDumpOnOutOfMemoryError`).
- **Límites de contenedor:** el runtime debe conocer el límite: Node `--max-old-space-size` (por defecto puede no ajustarse al contenedor en versiones antiguas), JVM `-XX:MaxRAMPercentage`, workers de Python × memoria por worker.
- **Cargar en memoria lo mínimo:** procesar archivos y resultados en streaming/lotes.

## Pruebas de carga

- **Escenario realista:** mezcla de endpoints según el tráfico real, datos variados (no siempre el mismo ID cacheado), think time, autenticación.
- **Tipos:** carga (tráfico esperado), estrés (hasta romper: dónde y cómo falla), pico (subida brusca), resistencia/soak (horas: fugas de memoria y conexiones).
- **Entorno** con datos de volumen parecido a producción (una tabla de 1.000 filas no revela un índice ausente).
- **Umbrales** en el script (p95, tasa de error) para que la prueba pase o falle de forma automática.
- Herramientas: k6, Gatling, Locust, JMeter (detalle de escenarios: dominio QA).
- Pruebas ligeras de regresión de rendimiento en CI para endpoints críticos.

## Presupuestos y capacidad

- SLO de latencia por endpoint crítico (→ `observability`).
- Capacidad: rps máximos por réplica con el SLO cumplido; margen para picos; autoescalado por métricas relevantes (CPU, rps, profundidad de cola), no solo CPU.
- Serverless: arranque en frío (tamaño del paquete, inicialización perezosa, conexiones reutilizadas entre invocaciones, pooler para la BD).

## Anti-patrones

| Anti-patrón | Consecuencia | Corrección |
| :--- | :--- | :--- |
| Optimizar código sin medir | Tiempo perdido, la causa real sigue | Trazas y profiler primero |
| Mirar solo la media | p99 alta invisible | Percentiles |
| CPU síncrona en Node o en `async def` | Todo el proceso se bloquea | Worker threads, procesos, threadpool |
| Más workers que conexiones de BD | Espera en el pool, sin mejora | Dimensionado coherente |
| Exportaciones construidas en memoria | OOM y timeouts | Streaming o background |
| Llamadas independientes en serie | Latencia sumada | Paralelo con límite |
| Caché en memoria sin límite | Fuga de memoria | LRU con tamaño y TTL |
| Pruebas de carga con datos mínimos | Falsa sensación de rendimiento | Volumen realista |
| Runtime que ignora el límite del contenedor | OOM kill | Configurar memoria máxima |
