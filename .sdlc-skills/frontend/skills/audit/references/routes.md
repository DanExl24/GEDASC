# Rutas de auditoría

Cada ruta es una secuencia de skills aplicadas en modo Auditar sobre el mismo alcance. El orden importa: las primeras dan contexto a las siguientes (la estructura antes que los detalles, la experiencia antes que el layout).

## Selección rápida

| Petición | Ruta |
| :--- | :---: |
| "Revisa este módulo / esta app de principio a fin" | 0 |
| "Dime si la experiencia es buena y cómoda en móvil" | 1 |
| "Va lento / se congela / consume mucha memoria" | 2 |
| "El formulario no guarda o envía datos erróneos" | 3 |
| "Audita tokens, temas y accesibilidad" | 4 |
| "El diseño está aprobado pero se desborda" | 5 |
| "Ordena la estructura y el tipado del proyecto" | 6 |
| "Revisa la seguridad del frontend" | 7 |
| "¿Está listo para publicar?" | 8 |
| "Prepárame la app para producción" | 9 |
| "Vamos a lanzar en otros países / idiomas" | 10 |

---

## Ruta 0 — Integral (producto + ingeniería)

```text
1. ux-review           → experiencia, jerarquía, responsive percibido, Antes/Después
2. architecture        → estructura y dependencias
3. typescript          → tipado y contratos
4. routing             → rutas, guards, estado en la URL
5. data-fetching       → capa de red y server state
6. state-management    → estado, memoria, reactividad
7. forms               → formularios
8. design-system       → tokens, componentes base, estados
9. accessibility       → WCAG 2.2 AA
10. security           → XSS, sesión, secretos, dependencias
11. performance        → Core Web Vitals y bundle
12. testing            → comportamiento sin proteger
13. responsive-layout  → solo correcciones de lo aprobado en el paso 1
```
Añade `rendering-and-seo` si hay páginas públicas indexables, `i18n` si es multi-idioma, `observability` y `tooling` si se va a operar en producción.

**Cuándo:** feature o módulo nuevo antes de un release; línea base de una app heredada.

## Ruta 1 — Crítica de UX

```text
ux-review
```
**Cuándo:** "se ve anticuada / incómoda / apretada en el móvil"; plan de rediseño priorizado.

## Ruta 2 — Rendimiento y memoria

```text
performance → state-management → data-fetching
```
**Cuándo:** carga lenta, clics con retraso, contenido que salta, pestaña congelada, memoria creciente, peticiones duplicadas. `performance` mide primero e indica si la causa es de render, de estado o de red.

## Ruta 3 — Captura de datos

```text
data-fetching → forms → accessibility (parte de formularios) → testing (formularios)
```
**Cuándo:** errores al enviar, validaciones rotas, doble envío, errores del servidor que no se muestran.

## Ruta 4 — Visual e inclusiva

```text
design-system ⇄ accessibility
```
**Cuándo:** tokens, temas, estados interactivos y conformidad WCAG.

## Ruta 5 — Responsive sin rediseño

```text
responsive-layout
```
**Cuándo:** diseño aprobado que se desborda en `1366 × 768`, tablet o móvil.

## Ruta 6 — Cimientos técnicos

```text
architecture → typescript → tooling → data-fetching
```
**Cuándo:** proyecto nuevo o caótico; carpetas desordenadas, `any`, llamadas HTTP en componentes, CI débil.

## Ruta 7 — Seguridad del cliente

```text
security → routing (open redirects, guards) → data-fetching (sesión) → rendering-and-seo (aislamiento en SSR, si aplica)
```
**Cuándo:** HTML de usuarios, cambios de autenticación, scripts de terceros, alertas de dependencias. La autorización se escala al backend.

## Ruta 8 — Control previo a un release

```text
testing → performance → accessibility → security → observability → rendering-and-seo (si hay páginas públicas)
```
**Cuándo:** antes de publicar. Entrega un **sí/no por bloque** y la lista de riesgos que se aceptan conscientemente.

## Ruta 9 — Preparación para producción

```text
tooling → observability → security → performance
```
**Cuándo:** primera puesta en producción o paso de prototipo a producto.

## Ruta 10 — Internacionalización

```text
i18n → rendering-and-seo (URLs por idioma, hreflang) → responsive-layout (expansión de texto, RTL) → forms (formatos de entrada)
```
**Cuándo:** nuevo idioma o país, soporte RTL.

---

## Escalado a otros dominios

Cuando la causa raíz no está en el frontend, reúne la evidencia (archivo, petición, respuesta, pasos) y recomienda:

| Problema | Dónde |
| :--- | :--- |
| Contratos de API divergentes | plugin `fullstack` → `contracts` |
| Un flujo que falla sin saber en qué capa | plugin `fullstack` → `flow-diagnosis` |
| Estructura del repositorio con frontend y backend, monorepo | plugin `fullstack` → `topology` |
| Auditar la aplicación completa (frontend + backend) | plugin `fullstack` → `audit` |
| Validación de entrada, errores HTTP, formato de respuestas en el servidor | plugin `backend` → `http-layer` |
| Reglas de negocio, transiciones de estado, cálculos de importes en el servidor | plugin `backend` → `domain-logic` |
| Consultas lentas, N+1, transacciones, condiciones de carrera | plugin `backend` → `data-access` |
| Índices, esquema, migraciones | plugin `backend` → `schema-and-migrations` |
| Contrato de la API (códigos, errores, paginación, versionado) | plugin `backend` → `api-design` |
| Trabajo en background, webhooks, proveedores externos lentos o caídos | plugin `backend` → `async-messaging` · `integrations` |
| Auditoría completa del servicio backend | plugin `backend` → `audit` |
| Login, sesiones, tokens y su verificación en el servidor | plugin `backend` → `authentication` |
| Autorización (IDOR), roles, aislamiento entre tenants | plugin `backend` → `authorization` |
| Inyecciones, SSRF, uploads, rate limiting, secretos en el servidor | plugin `backend` → `api-security` |
| E2E, contratos, carga, DAST, análisis de causa raíz de incidentes | `domains/05_qa_testing_engineering/` |

(Los dominios que aparecen como `domains/…` siguen en formato de prompts mientras no se migren a plugins.)
