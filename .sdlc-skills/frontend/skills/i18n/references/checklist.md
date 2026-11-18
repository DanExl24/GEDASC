# Checklist de auditoría — i18n y localización

Severidad orientativa entre corchetes ([severity.md](../../../standards/severity.md)). En una app de un solo idioma sin planes de ampliarlo, muchos puntos son **INFO**; los de formatos (fechas, monedas, zonas) aplican siempre.

## 1. Textos

- [ ] Sin textos visibles literales en plantillas y componentes (incluidos `aria-label`, `alt`, `title`, placeholders, mensajes de error y de toasts). **[MEDIUM]** en apps multi-idioma.
- [ ] Sin concatenación de traducciones ni frases partidas en varias claves. **[MEDIUM]**
- [ ] Plurales, selección y género con ICU (o el mecanismo de la librería), no con condicionales. **[MEDIUM]**
- [ ] Claves semánticas organizadas por feature/namespace. **[LOW]**
- [ ] Interpolación de enlaces o énfasis dentro de frases con el componente de la librería, no con HTML concatenado. **[LOW–MEDIUM]** (y → `security` si se usa `v-html`/`dangerouslySetInnerHTML` con traducciones).

## 2. Formatos

- [ ] Fechas y horas con `Intl`/la librería, con locale y zona horaria explícitos. **[MEDIUM]**; **[HIGH]** si hay fechas desplazadas un día o horas incorrectas en datos de negocio.
- [ ] Fechas de calendario (sin hora) no se convierten a instantes con zona. **[HIGH]** si provoca vencimientos o citas en el día equivocado.
- [ ] Números, porcentajes y monedas con `Intl.NumberFormat`. **[MEDIUM]**
- [ ] La moneda viene de los datos, no del idioma de la interfaz. **[HIGH]** si se muestran importes en la moneda equivocada.
- [ ] Ordenación y comparación de textos con `Intl.Collator` / `localeCompare`. **[LOW]**
- [ ] Formateadores reutilizados (no creados en cada render de listas grandes). **[LOW]**

## 3. Idioma activo

- [ ] Detección con prioridad clara (URL, preferencia, navegador, defecto) y persistencia de la elección. **[MEDIUM]**
- [ ] Cadena de fallback para claves faltantes (sin mostrar claves crudas al usuario). **[MEDIUM]**
- [ ] `<html lang>` y `dir` actualizados al cambiar de idioma. **[MEDIUM]** (→ `accessibility` 3.1.1).
- [ ] Las páginas públicas tienen el idioma en la URL y `hreflang` (→ `rendering-and-seo`). **[MEDIUM]** en sitios públicos multi-idioma.
- [ ] Cambiar de idioma conserva la ruta actual. **[LOW]**

## 4. Layout

- [ ] Propiedades CSS lógicas (o variantes `rtl:`) en lugar de físicas, si se soporta o se prevé RTL. **[HIGH]** si un idioma RTL soportado se ve roto.
- [ ] Iconos direccionales espejados en RTL. **[LOW–MEDIUM]**
- [ ] Botones, pestañas y celdas soportan textos largos sin cortarse (probado con pseudo-localización o un idioma largo). **[MEDIUM]**
- [ ] Datos de usuarios con dirección mixta aislados (`<bdi>`, `dir="auto"`). **[LOW]**

## 5. Carga y flujo

- [ ] Solo se carga el idioma activo (y el de fallback). **[LOW–MEDIUM]**
- [ ] CI detecta claves faltantes en el idioma fuente; hay visibilidad de claves sin traducir y sin uso. **[LOW–MEDIUM]**
- [ ] Lint contra textos literales. **[LOW]**
- [ ] Mensajes de error del backend se traducen de forma consistente (códigos traducidos en el frontend o localización en el backend). **[MEDIUM]**

## Cómo inspeccionar rápido

- Literales: texto entre etiquetas en plantillas (`>[A-ZÁÉÍÓÚÑa-z][^<{]*<`), `placeholder="…"`, `aria-label="…"`, `alt="…"` con texto fijo; `toast('…')`.
- Concatenación: `t(…) + ` / `$t(…) + ` / `` `${t(…)} `` seguido de otro `t(`.
- Plurales manuales: `=== 1 ?` cerca de textos.
- Formatos manuales: `toLocaleDateString()` sin argumentos, `getDate() + '/' +`, `toFixed(2) + ' €'`, librerías de fechas sin locale.
- RTL: `margin-left`, `padding-right`, `left:`, `text-align: left`, clases `ml-`, `mr-`, `pl-`, `pr-`, `left-`, `right-`.
- `<html lang="` fijo en `index.html` sin actualización en tiempo de ejecución.
