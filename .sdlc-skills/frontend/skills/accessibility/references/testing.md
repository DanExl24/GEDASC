# Cómo probar la accesibilidad

Combina las tres capas. Solo las automáticas detectan, aproximadamente, un tercio de los problemas.

## 1. Automático

### En el editor y en CI (lint)
- Vue: `eslint-plugin-vuejs-accessibility`.
- React: `eslint-plugin-jsx-a11y`.
- Angular: reglas de accesibilidad de `@angular-eslint/template` (`accessibility-*`, `click-events-have-key-events`, `interactive-supports-focus`…).

### En tests
```ts
// Playwright + axe
import AxeBuilder from '@axe-core/playwright'

test('checkout sin violaciones WCAG A/AA', async ({ page }) => {
  await page.goto('/checkout')
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze()
  expect(results.violations).toEqual([])
})
```

- Tests de componentes: `vitest-axe` / `jest-axe` sobre el componente renderizado.
- Storybook: addon `@storybook/addon-a11y` para ver violaciones en cada historia.
- Ejecuta axe también con modales abiertos, menús desplegados y estados de error: axe solo ve lo que está en el DOM en ese momento.

### En el navegador
- DevTools: panel Accessibility (árbol de accesibilidad, nombre y rol calculados), Lighthouse (categoría Accessibility), extensión axe DevTools.
- Con la herramienta de navegador de la sesión (Playwright MCP / Chrome DevTools MCP) se puede inyectar axe y leer el árbol de accesibilidad.

## 2. Teclado (manual, imprescindible)

Desconecta el ratón mentalmente y recorre cada flujo:

| Tecla | Esperado |
| :--- | :--- |
| `Tab` / `Shift+Tab` | Recorre los interactivos en orden lógico; el foco siempre es visible y no queda tapado. |
| `Enter` | Activa enlaces y botones; envía formularios. |
| `Espacio` | Activa botones, marca checkboxes; no hace scroll si el foco está en un botón. |
| `↑ ↓ ← →` | Se mueven dentro de componentes compuestos (menús, tabs, radios, listbox, sliders). |
| `Escape` | Cierra modales, menús, popovers y tooltips; el foco vuelve al disparador. |
| `Home` / `End` | Primera/última opción en listas y tabs. |

Comprueba: ¿se puede completar la tarea entera? ¿Hay algún punto donde el foco desaparece, salta al inicio de la página o queda atrapado?

## 3. Lector de pantalla (prueba rápida de flujos críticos)

| Plataforma | Lector | Navegador recomendado |
| :--- | :--- | :--- |
| Windows | NVDA (gratuito) | Firefox o Chrome |
| macOS / iOS | VoiceOver (integrado) | Safari |
| Android | TalkBack | Chrome |

Qué verificar:
- Cada control se anuncia con nombre, rol y estado ("Menú, botón, contraído").
- Navegar por encabezados (`H` en NVDA) da una estructura comprensible.
- Los errores de formulario se leen al llegar al campo y al enviar.
- Los mensajes dinámicos (guardado, resultados, errores asíncronos) se anuncian.
- Al abrir un modal se anuncia su título; al cerrarlo se vuelve al punto de partida.
- Al cambiar de ruta se anuncia la nueva página.

## 4. Visual

- **Contraste:** selector de color de DevTools (muestra el ratio y la línea AA/AAA), extensión axe, o calculadora de contraste WebAIM. Mide en ambos temas y en estados (hover, disabled informativo, placeholders).
- **Zoom 200%** (`Ctrl/Cmd +`): todo legible y operable.
- **Reflow:** ventana a 320 px de ancho (o zoom 400% en 1280): sin scroll horizontal de página.
- **Espaciado de texto:** aplica el bookmarklet de "text spacing" y busca textos cortados o superpuestos.
- **Sin color:** modo escala de grises (DevTools → Rendering → Emulate vision deficiencies) y simulación de daltonismo.
- **Movimiento reducido:** DevTools → Rendering → `prefers-reduced-motion: reduce`.
- **Modo de alto contraste** de Windows (forced colors): bordes y foco siguen visibles.

## Informe

Indica para cada hallazgo y para el veredicto global qué se verificó con cada método. Un "cumple" basado solo en axe debe decir "sin violaciones automáticas", no "accesible".

## Marco legal (orientativo)

En la UE, la Ley Europea de Accesibilidad (EAA) es exigible desde junio de 2025 para muchos productos y servicios digitales y remite a la norma EN 301 549 (basada en WCAG 2.1 AA). En otros países hay normas equivalentes (ADA en EE. UU., normativas nacionales en Latinoamérica). Confirma con el equipo legal qué aplica; esta skill trabaja con WCAG 2.2 AA, que cubre WCAG 2.1 AA.
