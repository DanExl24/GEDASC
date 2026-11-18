# Contexto SDLC — GEDASC
Actualizado: 2026-11-18 por fullstack:feature

## Proyecto
- Frontend: Vue 3.5 + Pinia 3 + Vue Router 5 + Vite + Tailwind + TypeScript · `src/`
- Backend: Express 5 + PostgreSQL (`pg`) + `jsonwebtoken` + Socket.IO + TypeScript · `DataBase/src/`
- Base de datos / infraestructura: PostgreSQL (`DataBase/src/config/db.ts`)
- Contrato: tipos compartidos en `Shared/types/` (`machine.types.ts`, `auth.types.ts`)
- Convenciones: envelope `{ success: boolean, data?: T, message?: string }`, roles `'ADMIN' | 'CELADOR'`, prefijo `/api/*`

## Decisiones
| Fecha | Skill | Decisión | Motivo |
| :--- | :--- | :--- | :--- |
| 2026-11-18 | fullstack:contracts | Sesión por cookie `gedasc_session` (`HttpOnly`, `SameSite=Lax` configurable) + CSRF Double Submit (`gedasc_csrf` + header `X-CSRF-Token`) | Eliminar JWT en `localStorage` (riesgo XSS) y proteger mutaciones contra CSRF |
| 2026-11-18 | backend:authentication | Parseo nativo de cookies y generación/comparación CSRF con `node:crypto` (`timingSafeEqual`) sin dependencias nuevas; `HS256` explícito en JWT | Cero dependencias nuevas, sin riesgo operativo ni de cadena de suministro |
| 2026-11-18 | backend:authentication | CORS con `credentials: true` y lista blanca explícita (`CORS_ORIGIN` + localhost en dev), nunca `*` | Requerido por navegadores para cookies cross-origin y para evitar reflexión de `Origin` |
| 2026-11-18 | frontend:security | Eliminar `localStorage` para sesión; hidratar usuario vía `GET /api/auth/me` y centralizar `credentials: 'include'` + `X-CSRF-Token` en `src/Services/apiClient.ts` | Evitar exposición de credenciales a JS/XSS y asegurar envío consistente de cookies y CSRF |

## Objetivo en curso
Completado: Migrar sesión JWT de `localStorage` a cookie `HttpOnly` con protección CSRF (backend y frontend) · Modo: **mínima**
- ✅ Paso 1 (`fullstack:contracts`): Contrato de sesión, cookies, CSRF y CORS (`Shared/types/auth.types.ts`)
- ✅ Paso 2 (`backend:authentication`): Cookies HttpOnly, middleware CSRF, `/api/auth/me`, `/api/auth/logout`, CORS
- ✅ Paso 3 (`frontend:security`): Store sin `localStorage`, `apiClient`, router guard, servicios y vistas admin
- ✅ Paso 4 (verificación): `DataBase` build + 5 tests `node:test`, `oxlint` en 17 archivos frontend, checklists rápidos y `fullstack:contracts`

## Hallazgos abiertos
| Código | Severidad | Ubicación | Estado |
| :--- | :--- | :--- | :--- |
| BE-AUTHN-PLAIN | CRITICAL | `DataBase/src/controllers/auth.controller.ts:44` | Preexistente, fuera de alcance de modo mínima (contraseñas en texto plano; migrar a Argon2id/bcrypt) |
| BE-AUTHN-RL | HIGH | `DataBase/src/routes/auth.routes.ts` | Preexistente, fuera de alcance de modo mínima (sin rate limiting en login) |
| BE-AUTHN-REV | HIGH | `DataBase/src/controllers/auth.controller.ts:57` | Preexistente, fuera de alcance de modo mínima (JWT de 1 día sin revocación en servidor) |

## Handoffs pendientes
| Origen → destino | Disparador | Alcance |
| :--- | :--- | :--- |
| `backend:authentication` → `backend:api-security` | Login sin rate limiting | `POST /api/auth/login` |
| `backend:authentication` → `backend:authentication` | Contraseñas en texto plano y revocación de sesión en servidor | `DataBase/src/controllers/auth.controller.ts` |

## Skills aplicadas recientemente
| Fecha | Skill | Modo | Alcance |
| :--- | :--- | :--- | :--- |
| 2026-11-18 | fullstack:feature | Construir (mínima) | Migración sesión JWT a cookie HttpOnly + CSRF |
| 2026-11-18 | fullstack:contracts | Construir + Verificar | Endpoints `/api/auth/*`, `/api/admin/*`, cookies, CSRF y CORS |
| 2026-11-18 | backend:authentication | Construir + Checklist rápido | Emisión/verificación de cookie HttpOnly, CSRF Double Submit, CORS |
| 2026-11-18 | frontend:security | Construir + Checklist rápido | Eliminación de `localStorage`, `apiClient`, store Pinia y router guard |
