# Rutas de auditoría del backend

Cada ruta es una secuencia de skills aplicadas en modo Auditar sobre el mismo alcance. El orden importa: la estructura y el contrato dan contexto al detalle.

## Selección rápida

| Petición | Ruta |
| :--- | :---: |
| "Revisa este servicio de principio a fin" | 0 |
| "Revisa la seguridad" / "¿alguien puede ver datos ajenos?" | 1 |
| "Va lento" / "se cae con carga" | 2 |
| "Hay datos incorrectos, duplicados o inconsistentes" | 3 |
| "Revisa la API que vamos a publicar" | 4 |
| "Fallos en cascada, jobs perdidos, proveedores que nos tumban" | 5 |
| "Prepárame el servicio para producción" | 6 |
| "¿Está listo este release?" | 7 |
| "El código está enredado, cuesta cambiarlo" | 8 |
| "Cumplimiento de privacidad / RGPD / ley local" | 9 |

---

## Ruta 0 — Integral

```text
1. architecture            → estructura, módulos, dependencias
2. api-design              → contrato
3. http-layer              → frontera HTTP
4. domain-logic            → reglas de negocio
5. data-access             → consultas, transacciones, concurrencia
6. schema-and-migrations   → esquema, índices, migraciones
7. authentication
8. authorization
9. api-security
10. async-messaging         (si hay trabajo asíncrono)
11. integrations            (si hay proveedores externos)
12. caching                 (si hay caché)
13. observability
14. performance
15. testing
16. tooling
17. data-privacy            (si hay datos personales)
```
**Cuándo:** línea base de un servicio heredado o auditoría previa a una inversión importante.

## Ruta 1 — Seguridad

```text
authentication → authorization → api-security → data-privacy → caching (aislamiento de claves) → observability (datos en logs)
```
**Cuándo:** antes de exponer una API, tras un incidente de seguridad, en sistemas multi-tenant o con datos sensibles.

## Ruta 2 — Rendimiento y escalabilidad

```text
performance → data-access → schema-and-migrations → caching → integrations → async-messaging
```
**Cuándo:** endpoints lentos, p99 alta, timeouts bajo carga, preparación de un pico. `performance` mide primero y dirige el resto.

## Ruta 3 — Integridad de datos

```text
domain-logic → data-access (transacciones y concurrencia) → schema-and-migrations (constraints) → async-messaging (idempotencia) → integrations (idempotencia hacia proveedores)
```
**Cuándo:** saldos o stock incorrectos, duplicados, estados imposibles, eventos perdidos.

## Ruta 4 — Contrato y capa HTTP

```text
api-design → http-layer → api-security (límites, inventario) → testing (contrato)
```
**Cuándo:** API nueva o pública, integración de terceros con la API, inconsistencias entre endpoints.

## Ruta 5 — Fiabilidad y resiliencia

```text
integrations → async-messaging → observability → http-layer (timeouts, graceful shutdown) → caching (degradación)
```
**Cuándo:** caídas en cascada, despliegues que cortan operaciones, jobs atascados o duplicados, incidentes difíciles de diagnosticar.

## Ruta 6 — Preparación para producción

```text
tooling → observability → api-security → authentication → performance → data-privacy → schema-and-migrations (proceso de migraciones)
```
**Cuándo:** primer despliegue a producción o paso de prototipo a producto.

## Ruta 7 — Control previo a un release

```text
testing → schema-and-migrations (migraciones pendientes) → api-design (cambios incompatibles) → api-security → observability (alertas del flujo cambiado)
```
**Cuándo:** antes de publicar. Entrega un **sí/no por bloque** y los riesgos aceptados.

## Ruta 8 — Cimientos y mantenibilidad

```text
architecture → domain-logic → testing → tooling
```
**Cuándo:** código difícil de cambiar, módulos acoplados, miedo a tocar.

## Ruta 9 — Privacidad y cumplimiento

```text
data-privacy → authorization → observability (logs y trazas) → integrations (datos enviados a proveedores) → caching → api-security (secretos, cifrado)
```
**Cuándo:** preparación para RGPD u otra normativa, solicitudes de borrado o exportación, auditoría externa. Los puntos legales se marcan para validación.

---

## Escalado a otros dominios

| Problema | Dónde |
| :--- | :--- |
| Interfaz, consumo de la API en el cliente, seguridad del navegador | plugin `frontend` (`frontend:audit` o la skill concreta) |
| Contratos divergentes entre frontend y backend | plugin `fullstack` → `contracts` |
| Un flujo que falla sin saber en qué capa | plugin `fullstack` → `flow-diagnosis` |
| Estructura de un repositorio con frontend y backend, monorepo | plugin `fullstack` → `topology` |
| Auditar la aplicación completa (frontend + backend) | plugin `fullstack` → `audit` |
| Pruebas de carga completas, DAST contra el entorno en ejecución, suites E2E, análisis de causa raíz de incidentes | `domains/05_qa_testing_engineering/` (pendiente de migrar) |
| Infraestructura, despliegue, redes, Kubernetes | futuro dominio DevOps |
