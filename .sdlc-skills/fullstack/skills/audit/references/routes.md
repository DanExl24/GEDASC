# Rutas de auditoría fullstack

Cada ruta conjunta fija la ruta de `frontend:audit`, la de `backend:audit` y las skills de este plugin. Los nombres de ruta de cada capa están en sus propios `references/routes.md`.

## Selección rápida

| Objetivo o síntoma | Ruta |
| :--- | :--- |
| "¿Cómo está la aplicación?", línea base | 0 — Integral |
| Datos personales, pagos, multi-tenant, incidente de seguridad | 1 — Seguridad de punta a punta |
| Pantallas con datos vacíos o erróneos, errores mal mostrados, integración frágil | 2 — Contrato e integración |
| "Va lento" sin saber dónde | 3 — Rendimiento de punta a punta |
| Publicar una versión | 4 — Control previo a un release |
| Salir a producción por primera vez | 5 — Preparación para producción |
| Repositorio difícil de navegar, monorepo, tipos duplicados | 6 — Estructura y mantenibilidad |

## Ruta 0 — Integral

- **Frontend:** Ruta 0 (Integral).
- **Backend:** Ruta 0 (Integral).
- **Entre capas:** `contracts`, `flow-diagnosis` (flujos críticos), `topology`.
- En modo enfocado, prioriza por el contexto: seguridad y datos en B2B multi-tenant; contrato y formularios en apps con mucha captura de datos.

## Ruta 1 — Seguridad de punta a punta

- **Frontend:** Ruta 7 (Seguridad del cliente).
- **Backend:** Ruta 1 (Seguridad) y, con datos personales, Ruta 9 (Privacidad y cumplimiento).
- **Entre capas:** `contracts` (dimensión 5: sesión, cabeceras y CORS; campos sensibles en respuestas), `flow-diagnosis` sobre login, registro, recuperación de contraseña y la operación más sensible.
- Cruces típicos: estrategia de sesión incoherente entre capas; permisos que solo oculta la UI; validación solo en el cliente; datos sensibles enviados al cliente que no los muestra.

## Ruta 2 — Contrato e integración

- **Frontend:** Ruta 3 (Captura de datos), centrada en `data-fetching`, `forms` y `typescript`.
- **Backend:** Ruta 4 (Contrato y capa HTTP).
- **Entre capas:** `contracts` completo (tabla de cruce de todos los endpoints en alcance) y `flow-diagnosis` sobre los flujos con quejas.

## Ruta 3 — Rendimiento de punta a punta

- **Frontend:** Ruta 2 (Rendimiento y memoria).
- **Backend:** Ruta 2 (Rendimiento y escalabilidad).
- **Entre capas:** `flow-diagnosis` para localizar en qué etapa se va el tiempo (render, red, servidor, base de datos); `contracts` para respuestas sobredimensionadas, cascadas de peticiones (N+1 entre cliente y API) y ausencia de paginación.

## Ruta 4 — Control previo a un release

- **Frontend:** Ruta 8 (Control previo a un release).
- **Backend:** Ruta 7 (Control previo a un release).
- **Entre capas:** `contracts` sobre lo que cambia en el release (¿hay cambios incompatibles?, ¿orden de despliegue?, ¿clientes en circulación?), `flow-diagnosis` de los flujos tocados.
- Termina con veredicto conjunto: publicar, publicar con riesgos aceptados o no publicar.

## Ruta 5 — Preparación para producción

- **Frontend:** Ruta 9 (Preparación para producción).
- **Backend:** Ruta 6 (Preparación para producción).
- **Entre capas:** `contracts` (sesión, CORS y errores entre entornos), `flow-diagnosis` de los flujos críticos comparando entornos, `topology` (build y despliegue de ambas capas).

## Ruta 6 — Estructura y mantenibilidad

- **Frontend:** Ruta 6 (Cimientos técnicos).
- **Backend:** Ruta 8 (Cimientos y mantenibilidad).
- **Entre capas:** `topology` completo y `contracts` (fuente única de verdad, tipos duplicados).

## Escalado a otros dominios

| Problema | Evidencia | Dominio recomendado |
| :--- | :--- | :--- |
| Pruebas de carga, DAST, pentest, E2E a gran escala | Riesgo sin poder verificarse con lectura de código | QA (`domains/05_qa_testing_engineering/`, pendiente de migrar) |
| Infraestructura, despliegue, redes, CDN | Fallos que dependen del entorno, no del código | DevOps (pendiente) |
