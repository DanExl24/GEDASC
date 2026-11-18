---
name: observability
description: Implementa y audita la observabilidad del frontend en producción (Vue, React, Angular). Cubre manejo de errores en capas (handlers globales, error boundaries, errores por ruta y en eventos asíncronos), UX de error y recuperación, tracking de errores con Sentry u otras herramientas (source maps, releases, contexto sin datos personales, filtrado de ruido, muestreo), RUM y métricas de rendimiento reales, logging estructurado, correlación con el backend mediante trazas (traceparent/OpenTelemetry), desfase de versión tras despliegues, consentimiento y enmascarado en analítica y session replay, y alertas. Úsala al preparar una app para producción, cuando los errores de usuarios no llegan al equipo o llegan sin contexto, o tras incidentes difíciles de diagnosticar. No la uses para optimizar el rendimiento en sí (performance) ni para la normalización de errores HTTP (data-fetching).
---

# Observabilidad del frontend

En producción, el frontend se ejecuta en miles de navegadores que el equipo no ve. Sin observabilidad, la primera noticia de un error es la queja de un cliente. El objetivo es **saber qué falla, a quién, desde qué versión y por qué**, sin recopilar datos personales que no hacen falta, y que el usuario siempre tenga una salida cuando algo falla.

## Cuándo usarla

- Preparar una aplicación para producción o un lanzamiento importante.
- Errores que los usuarios reportan pero el equipo no puede reproducir ni ver.
- Herramienta de errores con miles de eventos de ruido y ninguna señal útil.
- Pantallas en blanco tras un error, o tras un despliegue (chunks que ya no existen).
- Conectar errores del frontend con trazas del backend.

**No es para:** optimizar LCP/INP/CLS (esta skill los mide en campo; mejorarlos es de `performance`) · convertir respuestas HTTP en `AppError` → `data-fetching` · analítica de producto y marketing (embudos, campañas), salvo en lo relativo a consentimiento y privacidad.

## Paso 0: contexto (ambos modos)

1. Detecta framework y herramientas existentes: Sentry, Datadog RUM, New Relic, LogRocket, Bugsnag, OpenTelemetry, analítica (GA4, PostHog, Amplitude), gestor de consentimiento. Carga [vue.md](references/vue.md), [react.md](references/react.md) o [angular.md](references/angular.md).
2. Revisa cómo se construye y despliega: ¿se generan source maps?, ¿hay versión/release identificable?, ¿hay varios entornos?
3. Averigua si el backend propaga trazas (cabecera `traceparent`) y qué normativa de privacidad aplica (RGPD u otras).

## Modo Construir

1. **Capas de captura** (ver [patterns.md § Capas](references/patterns.md#capas-de-manejo-de-errores)): handler global del framework, `window.onerror`/`unhandledrejection`, boundaries por ruta o sección, y manejo explícito en handlers asíncronos.
2. **UX de error:** fallback por sección con reintento, sin perder los datos del usuario; distinguir errores esperados (validación, red, permisos) de inesperados.
3. **Tracking de errores:** inicialización temprana, `release` y `environment`, source maps subidos y no servidos públicamente, contexto de usuario con ID (no email), filtrado de datos personales en `beforeSend`, lista de ruido ignorado, muestreo.
4. **RUM:** Core Web Vitals de campo y tiempos de navegación entre rutas (→ `performance`).
5. **Correlación:** propagar `traceparent` a la API propia para unir el error del frontend con la traza del backend.
6. **Desfase de versión:** detectar errores de carga de chunks y versiones nuevas desplegadas; recargar o avisar.
7. **Privacidad:** analítica y session replay solo con consentimiento cuando la ley lo exige; inputs enmascarados.
8. **Alertas** sobre señales accionables (nuevos errores en un release, aumento de la tasa de error), no sobre cada evento.
9. Entrega según [output-formats.md § Construir](../../standards/output-formats.md#modo-construir).

## Modo Auditar

1. Provoca errores controlados (en un componente, en una promesa, en una ruta) y comprueba qué ve el usuario y qué llega a la herramienta.
2. Revisa la configuración del SDK, la subida de source maps, los releases y el filtrado de datos.
3. Si hay acceso a la herramienta de errores, mira el ruido: errores más frecuentes, sin stack legible, sin release.
4. Recorre [checklist.md](references/checklist.md).
5. Clasifica con [severity.md](../../standards/severity.md) y entrega según [output-formats.md § Auditar](../../standards/output-formats.md#modo-auditar) con código `FE-OBS`.

## Principios

1. **Ningún error deja al usuario sin salida:** siempre hay un fallback con reintento o una forma de continuar.
2. **Ningún error inesperado pasa desapercibido** para el equipo.
3. **Cada evento dice en qué versión ocurrió** y tiene un stack legible (source maps).
4. **Señal, no ruido:** se filtra lo que no es accionable; se alerta sobre lo que sí.
5. **Mínimos datos personales:** IDs en lugar de emails, inputs enmascarados, consentimiento cuando aplica.
6. **Frontend y backend se correlacionan** con un identificador de traza compartido.
7. **Los errores esperados no son incidentes:** un 422 de validación se muestra al usuario, no se envía como excepción.

## Referencias

| Archivo | Cuándo cargarlo |
| :--- | :--- |
| [patterns.md](references/patterns.md) | Siempre en modo Construir; en Auditar para las correcciones. |
| [checklist.md](references/checklist.md) | Modo Auditar. |
| [vue.md](references/vue.md) · [react.md](references/react.md) · [angular.md](references/angular.md) | Según el stack. |

## Skills relacionadas

- `data-fetching`: `AppError` y qué errores HTTP son esperados.
- `performance`: Core Web Vitals de campo como entrada para optimizar.
- `routing`: error boundaries por ruta y errores de carga de chunks.
- `security`: datos sensibles en eventos, source maps y consentimiento.
- `tooling`: subida de source maps y versión de release en el pipeline de build.
