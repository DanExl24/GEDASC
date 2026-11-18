# Matriz de viewports

Matriz única para todas las skills que evalúan la interfaz en distintos tamaños (`ux-review`, `responsive-layout`, `accessibility`). Dimensiones en píxeles CSS (ancho × alto del viewport). Breakpoints de Tailwind por defecto: `sm` 640 · `md` 768 · `lg` 1024 · `xl` 1280 · `2xl` 1536; si el proyecto los personaliza, usa los suyos.

## Matriz completa (13)

| # | Viewport | Categoría | Breakpoint Tailwind por defecto | Qué vigilar |
| :-: | :--- | :--- | :--- | :--- |
| 1 | `320 × 568` | Móvil pequeño | base | Reflow sin scroll horizontal global (WCAG 1.4.10), objetivos táctiles. |
| 2 | `360 × 640` | Móvil Android compacto | base | El tamaño más común en Android de gama media/baja. |
| 3 | `375 × 667` | Móvil clásico (iPhone SE) | base | Poca altura: CTAs y teclado virtual. |
| 4 | `390 × 844` | Móvil moderno | base | Referencia de móvil actual. |
| 5 | `414 × 896` | Móvil grande | base | Que no parezca un desktop comprimido. |
| 6 | `768 × 1024` | Tablet vertical | `md` | Transición de sidebar/header; aprovechar el ancho. |
| 7 | `820 × 1180` | Tablet intermedia | `md` | Proporciones de cards y grids intermedios. |
| 8 | `1024 × 768` | Tablet horizontal / laptop pequeña | `lg` | Altura reducida (768). |
| 9 | `1280 × 720` | Laptop compacta | `xl` | Altura muy reducida: headers fijos y modales. |
| 10 | `1366 × 768` | Laptop corporativa | `xl` | **La resolución de escritorio más frecuente en entornos corporativos.** Solo ~650 px útiles de alto descontando barras del navegador y del sistema. |
| 11 | `1440 × 900` | Laptop widescreen | `xl` | Grids de 3–4 columnas, márgenes laterales. |
| 12 | `1600 × 900` | Monitor de oficina | `2xl` | Densidad intermedia; primer tamaño en `2xl` (≥ 1536). |
| 13 | `1920 × 1080` | Full HD | `2xl` | Ancho máximo de contenido (`max-w-*`) y longitud de línea legible. |

## Subconjunto rápido (6)

Para revisiones rápidas o cuando no se puede automatizar la captura:

`320 × 568` · `390 × 844` · `768 × 1024` · `1024 × 768` · `1366 × 768` · `1920 × 1080`

Usa la matriz completa en auditorías formales y antes de una entrega.

## Reglas

1. **No extrapoles.** Que funcione en 375 no implica que funcione en 414 o en 768. Comprueba también las transiciones entre tamaños (redimensionando poco a poco), no solo los puntos de la tabla.
2. **El alto importa tanto como el ancho.** Modales, sidebars fijos y CTAs se rompen sobre todo en `1366 × 768`, `1280 × 720` y móviles con teclado abierto.
3. **Zoom y texto grande.** Además de los viewports, comprueba zoom del navegador al 200% (equivale aproximadamente a la mitad del ancho) y aumento de tamaño de texto (WCAG 1.4.4).
4. **Declara qué se verificó.** Si no pudiste ver la interfaz en un viewport (sin navegador ni capturas), márcalo como "no verificado" en lugar de suponer el resultado.

## Cómo capturar

En orden de preferencia:
1. Herramienta de navegador disponible en la sesión (Playwright MCP, Chrome DevTools MCP, navegador integrado): redimensionar a cada viewport y capturar.
2. Script de Playwright del proyecto:
   ```ts
   for (const [w, h] of viewports) {
     await page.setViewportSize({ width: w, height: h })
     await page.screenshot({ path: `shots/${w}x${h}.png`, fullPage: true })
   }
   ```
3. Capturas aportadas por el usuario.
4. Sin interfaz visible: inferir desde el código (plantillas y clases) y marcar cada viewport como "inferido, no verificado".
