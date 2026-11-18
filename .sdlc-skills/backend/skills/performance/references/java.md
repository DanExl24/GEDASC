# Rendimiento — notas Java / Spring Boot

- **Profiling:** Java Flight Recorder + JDK Mission Control (bajo coste, apto para producción: `-XX:StartFlightRecording`), async-profiler (flame graphs de CPU, asignaciones y locks); profiling continuo con Pyroscope/Datadog.
- **Memoria y GC:** `-XX:MaxRAMPercentage=75` en contenedores, `-XX:+HeapDumpOnOutOfMemoryError`; G1 por defecto; ZGC para latencias bajas con heaps grandes; métricas de GC de Micrometer.
- **Hilos:** `server.tomcat.threads.max` coherente con `spring.datasource.hikari.maximum-pool-size`; **virtual threads** (`spring.threads.virtual.enabled=true`, Java 21+) para cargas de IO, recordando que el pool de conexiones sigue limitando la concurrencia real hacia la BD.
- **Hibernate:** estadísticas para contar consultas, `open-in-view=false`, proyecciones en listados, batch fetching (→ `data-access`).
- **Streaming:** `StreamingResponseBody` o `Flux` para exportaciones; `@Transactional(readOnly = true)` + `Stream<T>` desde el repositorio con `fetchSize` para recorrer resultados grandes.
- **Arranque y serverless:** Spring AOT/GraalVM native image o CRaC para reducir el arranque en frío.
- **Calentamiento:** mide tras el warm-up del JIT; las primeras peticiones tras el despliegue son más lentas.
