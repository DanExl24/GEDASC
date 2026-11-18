# Observabilidad — notas Node.js / TypeScript

- **Logs:** `pino` (rápido, JSON) con `redact: ['req.headers.authorization', 'req.headers.cookie', '*.password', '*.token']`; `pino-http` para logs de acceso con request id (`genReqId`); en Fastify el logger es pino de serie; en NestJS, `nestjs-pino`.
- **Contexto:** `AsyncLocalStorage` para request id, tenant y usuario, inyectados en cada log con un `mixin` de pino.
- **Trazas:** `@opentelemetry/sdk-node` + `@opentelemetry/auto-instrumentations-node` (HTTP, undici/fetch, Express/Fastify, pg, ioredis, Prisma vía su instrumentación propia, amqplib, kafkajs…), arrancado **antes** de importar el resto de la aplicación (`--import ./instrumentation.mjs`); exportador OTLP; correlación pino ↔ traza con la instrumentación de pino.
- **Métricas:** `prom-client` (`collectDefaultMetrics` incluye event loop lag, heap y GC) o métricas de OpenTelemetry; histogramas por ruta con la plantilla (`req.routeOptions.url` en Fastify, `req.route.path` en Express).
- **Event loop:** `perf_hooks.monitorEventLoopDelay()` como métrica de saturación clave en Node.
- **Health:** rutas `/livez` (responde siempre) y `/readyz` (ping a BD con timeout corto, falso durante el apagado); `@nestjs/terminus` en NestJS.
- **Errores:** `@sentry/node` inicializado con el SDK de OTel o junto a él, con `release` y `environment`.
