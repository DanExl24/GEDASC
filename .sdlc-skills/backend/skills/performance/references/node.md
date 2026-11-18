# Rendimiento — notas Node.js

- **Profiling:** `node --cpu-prof` / `--heap-prof`, Chrome DevTools (`--inspect`), `clinic` (doctor, flame, bubbleprof) o `0x` para flame graphs; profiling continuo con Pyroscope/Datadog.
- **Event loop:** `perf_hooks.monitorEventLoopDelay()`; picos de lag = código síncrono. CPU pesada en `worker_threads` (con un pool como `piscina`).
- **APIs síncronas a evitar en handlers:** `fs.*Sync`, `crypto.*Sync` (pbkdf2, scrypt), `zlib.*Sync`, `child_process.execSync`.
- **libuv threadpool** (fs, dns.lookup, crypto, zlib) tiene 4 hilos por defecto: `UV_THREADPOOL_SIZE` si hay mucho trabajo de esos tipos.
- **JSON grande:** paginación o streaming (`stream.pipeline` con transformadores, `pg-query-stream` para cursores de PostgreSQL); `fast-json-stringify` (Fastify lo usa con los schemas de respuesta) acelera la serialización.
- **Memoria:** `--max-old-space-size` acorde al contenedor; heap snapshots (`v8.writeHeapSnapshot()`) comparados; vigila `Map`/arrays globales y listeners (`EventEmitter` avisa con `MaxListenersExceededWarning`).
- **HTTP saliente:** `undici`/`fetch` con agente con keep-alive; sin keep-alive cada llamada paga TCP + TLS.
- **Paralelismo:** `Promise.all` con límite (`p-limit`) para llamadas independientes.
