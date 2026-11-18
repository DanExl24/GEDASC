# Checklist de auditoría — rendimiento del backend

Severidad orientativa entre corchetes ([severity.md](../../../standards/severity.md)). Anota siempre cómo se midió (trazas, profiler, prueba de carga, entorno).

## 1. Medición

- [ ] Hay métricas de latencia por endpoint con percentiles (p95/p99). **[MEDIUM]** si no existen.
- [ ] Hay trazas que permiten desglosar el tiempo de una petición. **[MEDIUM]**
- [ ] Los endpoints críticos tienen un objetivo de latencia (SLO) definido. **[LOW–MEDIUM]**

## 2. Causas frecuentes

- [ ] Endpoints principales sin N+1 ni consultas sin índice/límite (→ `data-access`, `schema-and-migrations`). **[HIGH]**
- [ ] Llamadas externas con timeout, en paralelo cuando son independientes, y fuera de la ruta crítica cuando es posible. **[MEDIUM–HIGH]**
- [ ] Trabajo pesado (PDFs, imágenes, importaciones, envíos masivos) fuera de la petición. **[MEDIUM]**
- [ ] Respuestas paginadas y sin campos innecesarios. **[MEDIUM]**
- [ ] Exportaciones y archivos grandes en streaming o en background. **[HIGH]** si se cargan enteros en memoria.

## 3. Runtime

- [ ] Sin CPU síncrona prolongada en el event loop (Node) ni llamadas bloqueantes en código async (Python). **[HIGH]**
- [ ] Workers/hilos y pool de conexiones dimensionados de forma coherente con la base de datos y las réplicas. **[MEDIUM]**; **[HIGH]** si ya hay agotamiento del pool.
- [ ] El runtime conoce el límite de memoria del contenedor. **[MEDIUM]**
- [ ] Logging sin coste excesivo en rutas calientes. **[LOW]**

## 4. Memoria

- [ ] Memoria estable bajo carga sostenida (sin crecimiento continuo). **[HIGH]** si hay reinicios por OOM.
- [ ] Cachés en memoria con tamaño máximo y TTL. **[MEDIUM]**
- [ ] Sin colecciones globales que crecen ni recursos sin liberar. **[MEDIUM]**

## 5. Carga y capacidad

- [ ] Prueba de carga reproducible para los endpoints críticos, con datos de volumen realista y umbrales. **[MEDIUM]** antes de picos de tráfico previstos.
- [ ] Capacidad por réplica conocida y autoescalado con métricas adecuadas. **[LOW–MEDIUM]**
- [ ] Regresiones de rendimiento detectables (presupuestos, pruebas en CI o alertas por SLO). **[LOW]**

## Cómo inspeccionar rápido

- Endpoints de mayor impacto: ordenar por `rps × p95` en las métricas.
- Traza de las peticiones más lentas: proporción de tiempo en BD, HTTP y propio.
- Bloqueos: `fs.readFileSync`, `crypto.pbkdf2Sync`, `JSON.parse` de payloads grandes en handlers (Node); `requests.`, `time.sleep`, drivers síncronos dentro de `async def` (Python).
- Memoria en memoria: `readFile`/`.read()`/`readAllBytes` de archivos grandes, `findAll()` para exportar, construcción de CSV en un string.
- Configuración: número de workers (Gunicorn `-w`, `--workers`), `spring.datasource.hikari.maximum-pool-size`, `server.tomcat.threads.max`, límites de memoria del contenedor y flags del runtime.
