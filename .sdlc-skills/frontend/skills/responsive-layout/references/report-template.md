# Plantilla de informe responsive

```markdown
# Responsive — <módulo o pantalla>

- Fecha: YYYY-MM-DD
- Stack de estilos: <Tailwind v4 | Tailwind v3 | CSS Modules | …> · breakpoints: <por defecto | personalizados: …>
- Verificación: <navegador automatizado | capturas | inferida del código, no verificada>
- Modo: <auditar y corregir | solo diagnóstico | construir>
- Estado final: 🟢 Responsive correcto | 🟡 Observaciones menores | 🔴 Requiere intervención

## 1. Resumen
- Diagnóstico: <cómo se comportaba la pantalla y qué se corrigió>
- Problemas: 🔴 n · 🟠 n · 🟡 n · 🔵 n

## 2. Matriz de viewports

| # | Viewport | Antes | Después | Problema principal |
| :-: | :--- | :---: | :---: | :--- |
| 1 | 320 × 568 | 🔴 | 🟢 | Tabla desborda la página |
| 2 | 360 × 640 | | | |
| 3 | 375 × 667 | | | |
| 4 | 390 × 844 | | | |
| 5 | 414 × 896 | | | |
| 6 | 768 × 1024 | | | |
| 7 | 820 × 1180 | | | |
| 8 | 1024 × 768 | | | |
| 9 | 1280 × 720 | | | |
| 10 | 1366 × 768 | | | |
| 11 | 1440 × 900 | | | |
| 12 | 1600 × 900 | | | |
| 13 | 1920 × 1080 | | | |

(⚪ = no verificado)

## 3. Cambios en código

### [FE-RESP-001] <título>
- **Archivo:** `ruta/Componente.vue:42`
- **Severidad:** HIGH — <justificación>
- **Nivel aplicado:** 1 Cajas | 2 Breakpoints | 3 Fluido | 4 Estructura | 5 Patrón (justificado)
- **Causa raíz:** <qué elemento desbordaba y por qué>
- **Cambio:**
  ```diff
  - <div class="flex justify-between w-[800px] p-8">
  + <div class="flex w-full max-w-5xl flex-col gap-4 p-4 sm:flex-row sm:justify-between sm:p-6 lg:p-8">
  ```

## 4. Deliberadamente no modificado
1. **<Elemento>:** <por qué se dejó así (preferencia estética, diseño aprobado, espacio razonable en widescreen…)>.
2. **<Elemento>:** <si parece un problema de UX real: "recomendado revisar con ux-review">.

## 5. Verificación final

| Comprobación | Resultado |
| :--- | :---: |
| Sin scroll horizontal de página en ningún viewport | ✅ / ❌ |
| Tablas contenidas y desplazables | ✅ / ❌ |
| Modales completos en 1280 × 720 y 1366 × 768 | ✅ / ❌ |
| Formularios adaptados sin solapamientos | ✅ / ❌ |
| Objetivos táctiles ≥ 24 px en móvil | ✅ / ❌ |
| Identidad visual intacta (verificación de no-rediseño) | ✅ / ❌ |

**Dictamen:** <🟢/🟡/🔴 y una frase>
```
