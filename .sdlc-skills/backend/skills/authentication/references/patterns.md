# Patrones de autenticación

## Elegir mecanismo

| Situación | Mecanismo recomendado |
| :--- | :--- |
| Web propia (SPA o SSR) en el mismo sitio que la API | **Sesión en servidor** con cookie `HttpOnly; Secure; SameSite=Lax` (o patrón BFF: el backend guarda los tokens del proveedor y la SPA solo tiene la cookie) |
| Apps móviles o clientes que no usan cookies | Access token corto (5–15 min) + refresh token rotativo |
| Varias aplicaciones, SSO, clientes empresariales, MFA obligatorio | **Proveedor de identidad con OIDC** (Auth0, Keycloak, Cognito, Entra ID, Zitadel…) |
| Clientes máquina (integraciones de terceros) | API keys con alcance, o OAuth client credentials |
| Servicio a servicio dentro de la plataforma | mTLS, client credentials o tokens de identidad de la plataforma (workload identity) |

JWT no es obligatorio ni "más moderno": una sesión en servidor es más simple de revocar y suficiente para la mayoría de webs propias.

## Contraseñas

```text
Hash:      Argon2id (memoria ≥ 19 MiB, iteraciones ≥ 2, paralelismo 1) — valores mínimos de OWASP; ajústalos a ~50–250 ms por hash en el hardware real
           o bcrypt con coste ≥ 12 (límite de 72 bytes de entrada)
           o scrypt; PBKDF2-SHA256 con ≥ 600.000 iteraciones si hay requisito FIPS
Nunca:     MD5, SHA-1, SHA-256 sin estiramiento, cifrado reversible, texto plano
Política:  longitud mínima 8 (12+ recomendada), máxima ≥ 64; sin reglas de composición obligatorias
           ni caducidad periódica; comprobar contra contraseñas filtradas (Have I Been Pwned, k-anonymity)
Migración: rehash transparente al iniciar sesión si el algoritmo o el coste quedaron obsoletos
```

## Login

```ts
async function login(email: string, password: string, ctx: RequestContext) {
  await loginLimiter.consume([`ip:${ctx.ip}`, `account:${email.toLowerCase()}`])   // límites por IP y por cuenta

  const user = await users.findByEmail(email)
  const ok = user
    ? await verifyPassword(user.passwordHash, password)
    : await verifyPassword(DUMMY_HASH, password).then(() => false)   // mismo coste aunque no exista: sin enumeración por tiempo

  if (!ok) {
    await audit.log('login_failed', { email, ip: ctx.ip })
    throw new UnauthorizedError('Email o contraseña incorrectos')   // mensaje idéntico en ambos casos
  }
  if (user.mfaEnabled) return { status: 'mfa_required', challenge: await mfa.createChallenge(user.id) }

  await audit.log('login_succeeded', { userId: user.id, ip: ctx.ip })
  return createSession(user, ctx)                                    // nuevo ID de sesión
}
```

- **Sin enumeración:** mismo mensaje y tiempo similar en login, registro ("si el email es válido, recibirás un correo") y reset.
- **Fuerza bruta:** límites por cuenta y por IP con backoff progresivo; CAPTCHA tras varios fallos; el bloqueo duro de cuentas permite a un atacante bloquear a usuarios legítimos (úsalo con cuidado).
- **Credential stuffing:** detección de patrones (muchas cuentas desde la misma IP o ASN), MFA y comprobación de contraseñas filtradas.

## Sesiones en servidor

- ID de sesión aleatorio (≥ 128 bits) generado por la librería; almacenado en servidor (Redis, base de datos).
- **Regenerar el ID al iniciar sesión** y al elevar privilegios (evita session fixation).
- Expiración por **inactividad** (p. ej. 30 min–24 h según el riesgo) y **absoluta** (p. ej. 7–30 días).
- Cookie: `HttpOnly; Secure; SameSite=Lax` (o `Strict`), `Path=/`, prefijo `__Host-` cuando sea posible.
- **CSRF:** con cookies, protege las peticiones que cambian estado (SameSite + token CSRF o comprobación de `Origin`).
- Logout invalida la sesión en el servidor (borrar la cookie no basta). Cambio de contraseña o reset → invalidar todas las demás sesiones.
- Opcional: lista de sesiones activas para que el usuario cierre las que no reconozca.

## JWT

```ts
const { payload } = await jwtVerify(token, keyOrJwks, {
  algorithms: ['ES256'],              // lista explícita: nunca aceptar el alg que diga el token (ni 'none')
  issuer: 'https://auth.miapp.com',
  audience: 'api.miapp.com',
  clockTolerance: 30,
})
```

- **Verifica siempre:** firma con algoritmos fijados, `iss`, `aud`, `exp` (y `nbf`). Nunca `decode` sin verificar para tomar decisiones.
- **Asimétricos** (ES256, EdDSA, RS256) cuando varios servicios verifican: solo el emisor tiene la clave privada. Publica las claves en un JWKS con `kid` y rota.
- **Vida corta** del access token (5–15 min); no metas datos sensibles en el payload (es legible).
- **Revocación:** los JWT no se pueden revocar por sí solos. Estrategias: vida corta + refresh revocable; lista de `jti` revocados para casos críticos; versión de credenciales en el usuario comprobada al refrescar.
- **Roles en el token envejecen:** un usuario degradado conserva su rol hasta que el token caduca; para permisos críticos, comprueba contra la base de datos (→ `authorization`).

### Refresh tokens rotativos

```text
1. Login → access token (15 min) + refresh token opaco (aleatorio), guardado como HASH con familia y caducidad
2. Refresh → se verifica el hash, se invalida ese refresh token y se emite uno nuevo de la misma familia
3. Si llega un refresh token ya usado → posible robo → se revoca TODA la familia (el usuario vuelve a iniciar sesión)
4. Logout / cambio de contraseña → revocar la familia o todas las familias del usuario
```

El refresh token viaja en cookie `HttpOnly` (web) o en almacenamiento seguro del dispositivo (móvil); el endpoint de refresh necesita protección CSRF si usa cookie.

## Reset de contraseña

1. El usuario pide el reset → respuesta idéntica exista o no la cuenta.
2. Se genera un token aleatorio (≥ 128 bits, CSPRNG), se guarda **su hash** con caducidad corta (15–60 min) y se envía el enlace.
3. Al usarlo: un solo uso, comprobar caducidad, cambiar la contraseña, **invalidar todas las sesiones y refresh tokens**, notificar al usuario por email.
4. Tokens anteriores pendientes del mismo usuario se invalidan al emitir uno nuevo.
5. El enlace apunta a un dominio fijo de configuración, nunca construido con la cabecera `Host` de la petición (host header injection).

## Verificación y cambio de email

- Verificación con el mismo esquema de token de un solo uso.
- Cambio de email: reautenticación, confirmación en el email nuevo y aviso al antiguo (con forma de revertir).

## MFA

- **Passkeys / WebAuthn** (resistentes a phishing) como opción preferente; **TOTP** (RFC 6238) como alternativa extendida; SMS solo como último recurso (SIM swapping).
- Secretos TOTP cifrados en reposo; ventana de tolerancia pequeña; impedir reutilizar el mismo código.
- **Códigos de recuperación** de un solo uso, guardados como hash.
- **Step-up:** reautenticación o MFA para acciones sensibles aunque haya sesión.
- Desactivar MFA o cambiar el método exige reautenticación y notifica al usuario.

## OIDC (como cliente de un proveedor)

- Authorization Code + **PKCE**; validar `state` (CSRF) y `nonce` (replay).
- Validar el ID token (firma, `iss`, `aud`, `exp`, `nonce`) con la librería, no a mano.
- Redirect URIs registradas de forma exacta (sin comodines).
- Enlazar cuentas por `sub` + `iss`, no por email (el email puede no estar verificado o cambiar).

## API keys

```text
Formato:     prefijo identificable + secreto aleatorio:  sk_live_3f9a…  (permite detectar fugas con escáneres)
Almacenaje:  solo el hash (SHA-256 basta: el secreto es aleatorio de alta entropía) + los primeros caracteres para identificarla
Alcance:     permisos mínimos, entorno, cliente; caducidad opcional
Operación:   rotación sin downtime (dos claves válidas a la vez), revocación inmediata, registro de último uso
Comparación: tiempo constante
```

## Anti-patrones

| Anti-patrón | Consecuencia | Corrección |
| :--- | :--- | :--- |
| Hash rápido (MD5/SHA) o texto plano | Contraseñas recuperables tras una fuga | Argon2id / bcrypt |
| "Usuario no existe" vs "contraseña incorrecta" | Enumeración de cuentas | Mensaje genérico |
| Login sin límites | Fuerza bruta, credential stuffing | Límites por cuenta e IP |
| Aceptar el `alg` del token | Falsificación de tokens | Algoritmos fijados |
| `jwt.decode()` sin verificar | Cualquiera fabrica identidades | `verify` con claves y claims |
| JWT de larga duración sin revocación | Tokens robados válidos semanas | Vida corta + refresh rotativo |
| Refresh token reutilizable indefinidamente | Robo persistente | Rotación con detección de reutilización |
| Token de reset en claro, sin caducidad o reutilizable | Toma de cuentas | Hash, caducidad, un solo uso |
| No invalidar sesiones tras reset | El atacante sigue dentro | Revocar todo |
| ID de sesión no regenerado al hacer login | Session fixation | Regenerar |
| Enlaces de reset construidos con `Host` | Envenenamiento de enlaces | Dominio de configuración |
| API keys guardadas en claro | Fuga total si se filtra la BD | Hash + prefijo |
