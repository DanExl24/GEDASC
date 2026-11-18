# Autenticación — notas Python

## Django

- El sistema de autenticación integrado ya regenera la sesión al hacer login (`cycle_key`) y usa PBKDF2 por defecto. Para Argon2id: `pip install django[argon2]` y `PASSWORD_HASHERS = ["django.contrib.auth.hashers.Argon2PasswordHasher", …]` (los hashes antiguos se actualizan al iniciar sesión).
- `AUTH_PASSWORD_VALIDATORS` (longitud mínima, contraseñas comunes).
- Cookies: `SESSION_COOKIE_SECURE`, `SESSION_COOKIE_HTTPONLY`, `SESSION_COOKIE_SAMESITE`, `CSRF_COOKIE_SECURE`; `SESSION_COOKIE_AGE` y `SESSION_EXPIRE_AT_BROWSER_CLOSE` según la política.
- `PasswordResetTokenGenerator` integrado: tokens que caducan (`PASSWORD_RESET_TIMEOUT`) y se invalidan al cambiar la contraseña.
- `update_session_auth_hash` tras cambiar contraseña (mantiene la sesión actual) y cierre de las demás sesiones si se requiere (con un store de sesiones consultable).
- **django-allauth** para registro, verificación de email, social login, MFA (TOTP, WebAuthn) y rate limits integrados.
- `django-axes` o los límites de allauth contra fuerza bruta.

## DRF + JWT

- `djangorestframework-simplejwt`: `ACCESS_TOKEN_LIFETIME` corto, `ROTATE_REFRESH_TOKENS = True`, `BLACKLIST_AFTER_ROTATION = True` (requiere la app `token_blacklist`), `ALGORITHM` y `SIGNING_KEY`/claves asimétricas fuera del código, `AUDIENCE`/`ISSUER` configurados.

## FastAPI

- No trae autenticación completa: usa un proveedor externo, `fastapi-users`, o compón con `Authlib`/`PyJWT` y un store de sesiones.
- `PyJWT`: `jwt.decode(token, key, algorithms=["ES256"], audience=..., issuer=...)` (sin `options={"verify_signature": False}`).
- Contraseñas: `argon2-cffi` (o `pwdlib`); `passlib` está prácticamente sin mantenimiento.
- Dependencias (`Depends(current_user)`) que verifican el token en cada petición; middleware o dependencia global con excepciones explícitas.
- Rate limiting: `slowapi` o límites en el gateway/proxy, con almacenamiento compartido (Redis).

## Detalles

- Tokens aleatorios: `secrets.token_urlsafe(32)`; hash con `hashlib.sha256`.
- Comparaciones: `hmac.compare_digest`.
- TOTP: `pyotp`. WebAuthn: `webauthn` (py_webauthn).
