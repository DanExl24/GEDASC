# Checklist de auditoría — autenticación

Severidad orientativa entre corchetes ([severity.md](../../../standards/severity.md)). Indica CWE cuando aplique (p. ej. CWE-307 fuerza bruta, CWE-916 hash débil, CWE-347 verificación de firma, CWE-384 session fixation, CWE-640 recuperación débil).

## 1. Contraseñas

- [ ] Hash con Argon2id, bcrypt (coste ≥ 12), scrypt o PBKDF2 con iteraciones actuales. **[CRITICAL]** si MD5/SHA sin estiramiento o reversibles.
- [ ] Longitud mínima razonable y máxima ≥ 64; sin truncado silencioso (bcrypt a 72 bytes sin aviso). **[LOW–MEDIUM]**
- [ ] Comprobación contra contraseñas filtradas. **[LOW]**
- [ ] Rehash transparente cuando cambia el algoritmo/coste. **[LOW]**

## 2. Login y registro

- [ ] Mensajes y tiempos que no revelan si la cuenta existe (login, registro, reset). **[MEDIUM]**
- [ ] Límites por cuenta y por IP en login, MFA y reset. **[HIGH]**
- [ ] Eventos de login (éxito, fallo) registrados. **[LOW–MEDIUM]**

## 3. Sesiones

- [ ] ID de sesión aleatorio generado por librería y regenerado al iniciar sesión. **[HIGH]**
- [ ] Expiración por inactividad y absoluta. **[MEDIUM]**
- [ ] Cookies `HttpOnly`, `Secure`, `SameSite`. **[HIGH]** si falta `HttpOnly` o `Secure` en la cookie de sesión.
- [ ] Protección CSRF en peticiones que cambian estado con autenticación por cookie. **[HIGH]**
- [ ] Logout invalida la sesión en el servidor. **[MEDIUM]**
- [ ] Cambio de contraseña o reset invalida las demás sesiones y refresh tokens. **[HIGH]**

## 4. Tokens (JWT)

- [ ] Verificación con lista explícita de algoritmos; `none` rechazado. **[CRITICAL]**
- [ ] Se validan `iss`, `aud`, `exp` (y `nbf`). **[HIGH]**
- [ ] Ninguna decisión se toma con tokens decodificados sin verificar. **[CRITICAL]**
- [ ] Claves de firma fuertes, fuera del código, con rotación (`kid`/JWKS). **[CRITICAL]** si el secreto está en el repositorio o es débil.
- [ ] Access tokens de vida corta. **[MEDIUM]**; **[HIGH]** si duran días sin mecanismo de revocación.
- [ ] Refresh tokens opacos, guardados como hash, rotativos con detección de reutilización y revocables. **[HIGH]**
- [ ] El payload no contiene datos sensibles. **[MEDIUM]**

## 5. Recuperación y cambios de cuenta

- [ ] Tokens de reset aleatorios (CSPRNG), guardados como hash, de un solo uso y con caducidad corta. **[CRITICAL]** si son predecibles o reutilizables; **[HIGH]** si se guardan en claro o no caducan.
- [ ] Enlaces construidos con un dominio de configuración, no con `Host`. **[HIGH]**
- [ ] Notificación al usuario tras cambio de contraseña, email o MFA. **[LOW–MEDIUM]**
- [ ] Cambio de email con reautenticación y confirmación. **[MEDIUM]**

## 6. MFA y acciones sensibles

- [ ] MFA disponible (obligatorio para administradores). **[MEDIUM]**; **[HIGH]** si cuentas de administración no lo tienen.
- [ ] Secretos TOTP cifrados; códigos de recuperación como hash y de un solo uso. **[MEDIUM]**
- [ ] Reautenticación/step-up para acciones sensibles. **[MEDIUM]**

## 7. OIDC, API keys y servicios

- [ ] OIDC con Authorization Code + PKCE, validando `state`, `nonce` e ID token. **[HIGH]**
- [ ] Redirect URIs exactas. **[HIGH]**
- [ ] Cuentas federadas enlazadas por `iss` + `sub`, no por email sin verificar. **[HIGH]**
- [ ] API keys guardadas como hash, con alcance, revocables y comparadas en tiempo constante. **[HIGH]** si se guardan en claro.
- [ ] Comunicación entre servicios autenticada (no "red interna = confiable"). **[MEDIUM–HIGH]**

## Cómo inspeccionar rápido

- Hashing: buscar `md5`, `sha1`, `sha256(` aplicados a `password`, `createHash` cerca de contraseñas, `PASSWORD_HASHERS`, `PasswordEncoder`.
- JWT: `jwt.decode(`, `verify(` sin `algorithms`, `ignoreExpiration`, `verify_signature: False`, `options={"verify_aud": False}`, secretos literales (`secret: 'changeme'`).
- Enumeración: textos como "usuario no encontrado", "email no registrado" en respuestas.
- Reset: generación de tokens con `Math.random`, `uuid` v1, timestamps; columnas `reset_token` en claro; ausencia de caducidad.
- Sesión: configuración de cookies (`httpOnly`, `secure`, `sameSite`), `regenerate`/`cycle_key`/`sessionFixation`.
- Rate limiting en rutas `/login`, `/auth/*`, `/password/*`, `/mfa/*`.
