---
name: i18n
description: Implementa y audita internacionalización y localización en frontend (vue-i18n/Nuxt i18n, react-i18next/react-intl/next-intl, Angular i18n/Transloco). Cubre extracción de textos y claves, mensajes con ICU MessageFormat (plurales, género, selección), prohibición de concatenar frases, formato de fechas, números, monedas y zonas horarias con Intl, detección y persistencia del idioma, URLs por idioma y hreflang, idiomas RTL y propiedades CSS lógicas, expansión de texto, carga diferida de traducciones, ordenación y búsqueda según el idioma, y flujo de traducción con detección de claves faltantes. Úsala al preparar una app para varios idiomas o regiones, añadir un idioma, o ante textos sin traducir, plurales incorrectos o fechas y monedas mal formateadas. No la uses para SEO general (rendering-and-seo) ni para el contenido de marketing.
---

# Internacionalización (i18n) y localización (l10n)

Internacionalizar es preparar el código para que **cualquier texto, formato y dirección de lectura dependa del idioma y la región del usuario**; localizar es aportar las traducciones y convenciones de cada uno. Retrofitear i18n en una app grande es caro: cuanto antes se aplique la disciplina (sin textos en el código, sin concatenar, `Intl` para formatos), más barato es añadir un idioma.

## Cuándo usarla

- Preparar una app para un segundo idioma o país.
- Añadir un idioma nuevo, incluidos idiomas RTL (árabe, hebreo).
- Revisar textos hardcodeados, plurales incorrectos ("1 elementos"), fechas, números o monedas mal formateados.
- Organizar el flujo de traducción con un TMS (Crowdin, Lokalise, Phrase).

**No es para:** SEO de páginas públicas en general → `rendering-and-seo` (esta skill cubre las URLs por idioma y `hreflang`) · formato de entrada de números y fechas en formularios → `forms` (comparte reglas con esta skill).

## Paso 0: contexto (ambos modos)

1. Detecta la librería de i18n (si existe), los idiomas soportados, dónde viven las traducciones y cómo se elige el idioma. Carga [vue.md](references/vue.md), [react.md](references/react.md) o [angular.md](references/angular.md).
2. Pregunta qué idiomas y regiones hay que soportar ahora y en el futuro previsible (incluido RTL), y si el contenido del backend también se localiza.
3. Mide el punto de partida: cantidad de textos hardcodeados en plantillas.

## Modo Construir

1. **Librería y estructura:** una librería estándar del stack, traducciones por idioma y por namespace (feature), carga diferida por idioma. Ver [patterns.md § Estructura](references/patterns.md#estructura-de-traducciones).
2. **Claves semánticas por feature** (`orders.list.empty.title`), frases completas con placeholders, **nunca concatenar**.
3. **ICU MessageFormat** para plurales, selección y género.
4. **Formatos con `Intl`** (o los helpers de la librería) para fechas, números, monedas, unidades, tiempo relativo y listas; fechas guardadas en UTC y mostradas en la zona del usuario.
5. **Idioma:** detección (URL, preferencia guardada, `Accept-Language`/`navigator.languages`), persistencia, cadena de fallback y `<html lang dir>` actualizado.
6. **Páginas públicas:** prefijo de idioma en la URL y `hreflang` (→ `rendering-and-seo`).
7. **RTL y expansión:** propiedades CSS lógicas, iconos direccionales espejados, layouts que soportan textos un 30–40% más largos.
8. **Calidad:** lint contra textos literales, detección de claves faltantes y sin uso en CI, pseudo-localización.
9. Entrega según [output-formats.md § Construir](../../standards/output-formats.md#modo-construir).

## Modo Auditar

1. Busca textos literales en plantillas y componentes, concatenaciones de traducciones y formatos manuales de fechas y números.
2. Cambia de idioma (y prueba con pseudo-localización o un idioma largo como alemán, y uno RTL si aplica) y revisa la interfaz.
3. Recorre [checklist.md](references/checklist.md).
4. Clasifica con [severity.md](../../standards/severity.md) y entrega según [output-formats.md § Auditar](../../standards/output-formats.md#modo-auditar) con código `FE-I18N`.

## Principios

1. **Ningún texto visible al usuario vive en el código**: tampoco `aria-label`, `alt`, `title`, placeholders ni mensajes de error.
2. **Frases completas, nunca piezas concatenadas:** el orden de las palabras cambia entre idiomas.
3. **Plurales y género con ICU,** no con `if (n === 1)`: hay idiomas con 3, 4 o 6 formas de plural.
4. **Los formatos los decide el locale,** no el código: `Intl` para todo lo que sea fecha, número, moneda u orden.
5. **Guardar en formato neutro, mostrar en el del usuario:** UTC, ISO 8601, decimales canónicos, códigos de moneda ISO.
6. **El layout no asume una dirección ni una longitud de texto.**
7. **Cada idioma se carga cuando se necesita.**

## Referencias

| Archivo | Cuándo cargarlo |
| :--- | :--- |
| [patterns.md](references/patterns.md) | Siempre en modo Construir; en Auditar para las correcciones. |
| [checklist.md](references/checklist.md) | Modo Auditar. |
| [vue.md](references/vue.md) · [react.md](references/react.md) · [angular.md](references/angular.md) | Según el stack. |

## Skills relacionadas

- `rendering-and-seo`: URLs por idioma, `hreflang`, metadatos traducidos.
- `routing`: prefijo de idioma en las rutas y cambio de idioma sin perder la ruta.
- `forms`: entrada de números, fechas y monedas según el locale; mensajes de validación traducidos.
- `accessibility`: `lang` de la página y de fragmentos (WCAG 3.1.1 y 3.1.2).
- `responsive-layout` y `design-system`: expansión de texto, RTL y propiedades lógicas.
- `tooling`: lint de textos literales y comprobación de claves en CI.
