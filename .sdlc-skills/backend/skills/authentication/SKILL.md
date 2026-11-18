---
name: authentication
description: "Implementa y audita la autenticación en el backend: sesiones en servidor vs tokens, JWT (algoritmos, claims, expiración, rotación de refresh tokens y revocación), integración OAuth/OIDC con proveedores de identidad, hashing de contraseñas (Argon2id, bcrypt), login sin enumeración y con protección contra fuerza bruta, reset de contraseña, verificación de email, MFA (TOTP, passkeys), API keys y autenticación entre servicios. Úsala al montar login, sesiones o tokens, o al revisar su seguridad. No para permisos (authorization) ni para el almacenamiento de tokens en el navegador (frontend:security)."
---

# Autenticación

Autenticar es responder **"¿quién eres?"** de forma que no se pueda suplantar, adivinar ni reutilizar. Es el componente donde un error pequeño compromete todas las cuentas, por eso la primera recomendación es **no construirlo desde cero si un proveedor de identidad o el framework ya lo resuelve**, y la segunda es aplicar los detalles sin excepciones.

## Cuándo usarla

- Montar login, registro, sesiones o emisión de tokens.
- Integrar un proveedor de identidad (Auth0, Keycloak, Cognito, Entra ID, Google) mediante OIDC.
- Implementar reset de contraseña, verificación de email, MFA o API keys.
- Revisar la seguridad de la autenticación existente.

**No es para:** qué puede hacer cada usuario → `authorization` · cómo guarda el navegador el token o la cookie → `frontend:security` · rate limiting general de la API → `api-security` (aquí se cubre el específico de login).

## Paso 0: contexto (ambos modos)

1. Detecta framework y librerías de autenticación (Passport, Auth.js, better-auth, Django auth, allauth, SimpleJWT, Authlib, Spring Security…) y si hay un proveedor de identidad externo. Carga [node.md](references/node.md), [python.md](references/python.md) o [java.md](references/java.md).
2. Identifica los clientes: SPA del mismo dominio, apps móviles, terceros, otros servicios. El mecanismo correcto depende de ellos.
3. Localiza: emisión y verificación de credenciales, almacenamiento de contraseñas, flujos de reset y verificación, configuración de cookies o tokens.

## Modo Construir

1. **Elige el mecanismo** con la [tabla de decisión](references/patterns.md#elegir-mecanismo): sesión en servidor con cookie para web propia; tokens cortos + refresh para móviles/APIs; OIDC con un proveedor cuando hay SSO, varias apps o requisitos de MFA.
2. **Contraseñas** con Argon2id (o bcrypt con coste alto), política de longitud y comprobación contra contraseñas filtradas.
3. **Login robusto:** mensajes genéricos, tiempo similar exista o no la cuenta, límites por cuenta e IP.
4. **Sesiones/tokens** con los atributos de [patterns.md](references/patterns.md): regeneración del ID al iniciar sesión, expiración por inactividad y absoluta, revocación al cerrar sesión y al cambiar la contraseña; JWT con algoritmos explícitos, claims validados y refresh rotativo con detección de reutilización.
5. **Flujos de cuenta:** reset y verificación con tokens aleatorios de un solo uso, guardados como hash y con caducidad.
6. **MFA** (TOTP o passkeys) con códigos de recuperación y reautenticación para acciones sensibles.
7. **Eventos de seguridad** registrados (login, fallos, cambios de credenciales) y notificaciones al usuario.
8. Entrega según [output-formats.md § Construir](../../standards/output-formats.md#modo-construir), con tests de los caminos negativos.

## Modo Auditar

1. Traza cada flujo: registro, login, refresh, logout, reset, verificación, cambio de contraseña/email, MFA.
2. Revisa el almacenamiento de credenciales y la verificación de tokens.
3. Prueba (solo en entornos autorizados) enumeración de cuentas, fuerza bruta, reutilización de tokens de reset y refresh, tokens con `alg` manipulado.
4. Recorre [checklist.md](references/checklist.md).
5. Clasifica con [severity.md](../../standards/severity.md) y entrega según [output-formats.md § Auditar](../../standards/output-formats.md#modo-auditar) con código `BE-AUTHN`. Incluye el escenario de explotación de cada hallazgo (petición de ejemplo) y la referencia CWE cuando aplique.

## Principios

1. **No inventes la autenticación ni la criptografía:** proveedor de identidad, framework o librería mantenida.
2. **Las contraseñas solo se guardan como hash lento con sal** (Argon2id/bcrypt/scrypt).
3. **Nada en las respuestas revela si una cuenta existe.**
4. **Toda credencial caduca y se puede revocar:** sesiones, tokens de refresh, tokens de reset, API keys.
5. **Los tokens se verifican por completo:** firma con algoritmo fijado, emisor, audiencia y expiración.
6. **Los secretos de un solo uso se guardan como hash** (tokens de reset, refresh tokens, API keys, códigos de recuperación).
7. **Las acciones sensibles piden una autenticación reciente** (cambiar email, contraseña, MFA, datos de pago).

## Referencias

| Archivo | Cuándo cargarlo |
| :--- | :--- |
| [patterns.md](references/patterns.md) | Modo Construir; en Auditar para escribir las correcciones. |
| [checklist.md](references/checklist.md) | Modo Auditar. |
| [node.md](references/node.md) · [python.md](references/python.md) · [java.md](references/java.md) | Según el stack. |

## Skills relacionadas

- `authorization`: qué puede hacer la identidad autenticada.
- `api-security`: rate limiting general, secretos y dependencias.
- `http-layer`: cookies, CORS con credenciales y orden del middleware de autenticación.
- `frontend:security` y `frontend:data-fetching`: almacenamiento del token y refresh en el cliente.
