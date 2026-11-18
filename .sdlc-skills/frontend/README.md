# Plugin `frontend`

Skills para diseñar, construir y auditar aplicaciones frontend en **Vue, React y Angular**. Cada skill:

- Tiene dos modos: **Construir** (crear o refactorizar) y **Auditar** (revisar código existente y emitir un informe con severidades).
- Detecta el stack del proyecto y carga solo las notas del framework correspondiente.
- Comparte la escala de severidad, el formato de informe y la matriz de viewports de [`standards/`](standards/).
- `ux-review` y `responsive-layout` no llevan notas por framework (evalúan la interfaz y el CSS); las demás incluyen `vue.md`, `react.md` y `angular.md`.

## Uso

```bash
/plugin marketplace add <ruta-o-repo-de-este-kit>
/plugin install frontend@sdlc-skills
```

Invocación explícita: `/frontend:<skill> <qué quieres hacer>`, por ejemplo:

```text
/frontend:forms audita los formularios de src/features/checkout
/frontend:data-fetching monta el cliente HTTP con refresh token y TanStack Query
```

Claude también las activa solo cuando la petición encaja con la descripción de la skill.

## Catálogo

| Skill | Estado | Cubre |
| :--- | :---: | :--- |
| `architecture` | ✅ | Estructura por features, límites y dependencias, API pública por feature, monorepo, ADRs |
| `typescript` | ✅ | tsconfig estricto, cero `any`, contratos de API tipados y validados, uniones discriminadas, tipado de componentes |
| `data-fetching` | ✅ | Cliente HTTP, interceptores, refresh token, errores, cancelación, server state (TanStack Query), tiempo real |
| `state-management` | ✅ | Clasificación del estado, stores, derivados, fugas de memoria, reactividad, re-renders, SSR |
| `forms` | ✅ | Schemas, momento de validación, envío e idempotencia, errores del servidor, wizards, listas dinámicas, archivos |
| `ux-review` | ✅ | Crítica UI/UX sin código y diseño de la UX de pantallas nuevas: jerarquía, densidad, coherencia, responsive percibido, estados, flujos, Antes/Después |
| `design-system` | ✅ | Tokens en tres niveles, temas claro/oscuro, componentes base, variantes (CVA), matriz de estados, resiliencia de layout |
| `accessibility` | ✅ | WCAG 2.2 AA: teclado y foco, ARIA (patrones APG), lectores de pantalla, contraste, pruebas automáticas y manuales |
| `responsive-layout` | ✅ | Correcciones de layout sin rediseñar en 13 viewports, jerarquía de intervención de 5 niveles |
| `performance` | ✅ | Core Web Vitals con datos de campo y laboratorio, bundle y code splitting, imágenes, fuentes, terceros, presupuestos en CI |
| `rendering-and-seo` | ✅ | CSR/SSR/SSG/ISR y Server Components, hidratación, aislamiento en SSR, SEO técnico (metadatos, canonical, sitemap, JSON-LD, 404 reales) |
| `routing` | ✅ | Rutas tipadas, lazy loading, guards y sus límites, retorno seguro tras login, estado en la URL validado, errores, foco y scroll |
| `security` | ✅ | XSS y sanitización, sesión y tokens, CSRF, secretos en el bundle, CSP, open redirects, postMessage, dependencias |
| `testing` | ✅ | Testing Library, MSW, formularios, stores, guards, estabilidad y regresión visual (E2E en el dominio QA) |
| `observability` | ✅ | Capas de manejo de errores, UX de error, tracking (source maps, releases, sin datos personales), RUM, trazas con el backend, desfase de versión, consentimiento |
| `i18n` | ✅ | Claves e ICU, sin concatenar, formatos con `Intl`, zonas horarias, idioma activo, URLs por idioma, RTL, expansión de texto, flujo de traducción |
| `tooling` | ✅ | Node y lockfile fijados, scripts estándar, entorno validado, lint y formato, hooks, CI, source maps, despliegue estático |
| `audit` | ✅ | **Orquestador:** triage, 11 rutas, aplica las skills, deduplica, puntúa (0–100) y propone o ejecuta la remediación por lotes |

¿No sabes por dónde empezar? `/frontend:audit` con el alcance y el objetivo.

## Estructura de una skill

```text
skills/<skill>/
├── SKILL.md              # cuándo usarla, modos, flujo y principios
└── references/
    ├── patterns.md       # patrones de construcción y anti-patrones
    ├── checklist.md      # checklist de auditoría con severidad orientativa
    ├── vue.md
    ├── react.md
    └── angular.md
```
