# Autenticación — notas Node.js / TypeScript

## Librerías

- **Soluciones completas:** better-auth o Auth.js (sesiones, OAuth, MFA, passkeys según versión); o un proveedor de identidad externo con su SDK.
- **JWT y OIDC:** `jose` (verificación con algoritmos explícitos, JWKS remoto con caché: `createRemoteJWKSet`), `openid-client` para el flujo OIDC como cliente. Evita librerías JWT sin mantenimiento.
- **Contraseñas:** `argon2` (Argon2id por defecto) o `bcrypt`; `@node-rs/argon2` como alternativa sin dependencias nativas pesadas.
- **Sesiones:** `express-session` con store persistente (`connect-redis`), nunca el `MemoryStore` en producción; `req.session.regenerate()` tras el login; o `@fastify/secure-session`/`@fastify/session`.
- **Passport:** sigue siendo común; revisa que la estrategia local regenere la sesión y que los errores no distingan usuario inexistente.
- **Rate limiting de login:** `rate-limiter-flexible` con Redis (claves por IP y por cuenta) mejor que límites en memoria (no funcionan con varias instancias).
- **WebAuthn:** `@simplewebauthn/server`. **TOTP:** `otplib`.

## NestJS

- `@nestjs/passport` + guards (`AuthGuard('jwt')`), o un guard propio que use `jose`.
- Guard global de autenticación con un decorador `@Public()` para excepciones explícitas (deny by default).
- `@nestjs/throttler` con almacenamiento en Redis para límites en endpoints de autenticación.

## Detalles

- Tokens aleatorios: `crypto.randomBytes(32).toString('base64url')`; hash con `crypto.createHash('sha256')`.
- Comparaciones de secretos: `crypto.timingSafeEqual` (con buffers de igual longitud).
- No uses `jsonwebtoken.decode()` para autorizar; `jwt.verify(token, key, { algorithms: ['RS256'], issuer, audience })` si se usa `jsonwebtoken`.
