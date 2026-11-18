# Seguridad de la API — notas Node.js / TypeScript

- **Rate limiting:** `rate-limiter-flexible` (Redis, varias claves y costes) o `express-rate-limit` con store de Redis; `@fastify/rate-limit`; `@nestjs/throttler` con storage en Redis. `app.set('trust proxy', <nº de proxies o lista>)` en Express para que `req.ip` sea correcto (nunca `true` sin control si el servidor es accesible directamente).
- **Procesos:** `execFile`/`spawn` con array de argumentos y `shell: false` (por defecto); nunca `exec` con datos del usuario.
- **Rutas:** `path.resolve` + comprobación de prefijo; `res.sendFile(name, { root })` confina a `root` pero valida igualmente el nombre.
- **Mongo/Mongoose:** `mongoose.set('sanitizeFilter', true)` o `trusted()` explícito; schemas que validan tipos; `express-mongo-sanitize` para eliminar claves con `$` y `.`.
- **Prototype pollution:** no hagas merge profundo de JSON del usuario con `lodash.merge`/`Object.assign` sobre objetos de configuración; usa schemas estrictos (que descartan `__proto__` y `constructor`), `Object.create(null)` o `Map`.
- **Uploads:** `multer` con `limits: { fileSize, files }` y almacenamiento en memoria/stream hacia S3; `file-type` para detectar el tipo real por magic bytes; `sharp` para re-codificar imágenes.
- **SSRF:** valida con `net.isIP`/`ipaddr.js` las IPs resueltas; agentes HTTP que filtran destinos privados (`request-filtering-agent` u otro mantenido) y `redirect: 'manual'` en `fetch`.
- **ReDoS:** `re2` para expresiones sobre entrada del usuario; límites de longitud previos.
- **Secretos:** carga y validación de variables de entorno en un módulo de configuración (→ `tooling`); SDK del gestor de secretos al arrancar.
- **Dependencias:** `npm audit --omit=dev` / `pnpm audit --prod` en CI, Renovate/Dependabot, `socket` u otros para detectar paquetes maliciosos; `npm ci --ignore-scripts` donde sea viable.
- **Cabeceras y errores:** `helmet()`; sin `X-Powered-By` (→ `http-layer`).
- **GraphQL:** `graphql-depth-limit`, análisis de coste (`graphql-query-complexity`), introspección desactivada en producción si la API no es pública.
