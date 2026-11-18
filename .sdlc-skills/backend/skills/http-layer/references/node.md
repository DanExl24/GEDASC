# Capa HTTP — notas Node.js / TypeScript

## Express

- **Express 5** propaga al error handler los errores de handlers `async` (promesas rechazadas). En **Express 4** no: hace falta `express-async-errors` o envolver cada handler (`(fn) => (req, res, next) => fn(req, res, next).catch(next)`).
- Error handler con **4 parámetros** (`(err, req, res, next)`), registrado después de todas las rutas.
- `express.json({ limit: '100kb' })`; `app.disable('x-powered-by')`; `helmet()` para cabeceras; `cors({ origin: allowlist, credentials: true })`.
- Validación con Zod/Valibot en un middleware por ruta (`validate({ body, query, params })`) que deja los datos parseados en `req` tipado.
- Timeouts: `server.requestTimeout`, `server.headersTimeout`, `server.keepAliveTimeout` (mayor que el idle timeout del balanceador).

## Fastify

- Validación y **serialización** con JSON Schema (o TypeBox/Zod mediante type providers): el schema de `response` filtra los campos de salida, evitando fugas aunque se devuelva un objeto con más propiedades.
- `additionalProperties: false` en los schemas de body (con la opción de AJV `removeAdditional` según se quiera rechazar o descartar).
- `setErrorHandler` para el formato único; `setNotFoundHandler` para 404.
- `bodyLimit` en las opciones del servidor; hooks `onRequest`/`preHandler` para el pipeline.
- `fastify.close()` en el shutdown cierra el servidor y ejecuta los hooks `onClose` (pools, colas).

## NestJS

```ts
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,               // descarta propiedades sin decorador
  forbidNonWhitelisted: true,    // o rechaza con 400
  transform: true,               // convierte a los tipos del DTO
}))
app.useGlobalFilters(new ProblemDetailsFilter())    // ExceptionFilter propio con formato único
app.enableShutdownHooks()                            // onModuleDestroy / beforeApplicationShutdown
```

- DTOs con `class-validator`/`class-transformer`, o Zod con `nestjs-zod`.
- Salida: DTOs de respuesta o `ClassSerializerInterceptor` con `@Exclude()`/`@Expose()`; no devuelvas entidades de TypeORM/Prisma tal cual.
- Excepciones de dominio propias mapeadas en el filtro global; las `HttpException` de Nest solo en la capa HTTP.

## General

- `process.on('unhandledRejection')` y `uncaughtException`: registra y termina el proceso de forma controlada (el estado puede estar corrupto); el orquestador lo reinicia.
- Para identificadores de petición: `crypto.randomUUID()` o reutilizar `X-Request-Id` entrante si viene de un proxy de confianza; `AsyncLocalStorage` para tenerlo disponible en los logs sin pasarlo a mano.
