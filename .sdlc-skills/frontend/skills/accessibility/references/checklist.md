# Checklist WCAG 2.2 AA para aplicaciones web

Cada punto indica criterio y nivel. Severidad orientativa entre corchetes según el impacto en la tarea ([severity.md](../../../standards/severity.md)): un fallo que impide completar un flujo principal es **CRITICAL** aunque el criterio parezca menor.

Marca cada punto como: ✅ cumple · ❌ falla · ⚪ no aplica · 🔎 no verificado (solo automático o inferido).

---

## 1. Perceptible

### Alternativas textuales y estructura
- [ ] **1.1.1 Contenido no textual (A).** Imágenes informativas con `alt` descriptivo; decorativas con `alt=""` o `aria-hidden="true"`; iconos funcionales con nombre accesible. **[MEDIUM–HIGH]**
- [ ] **1.2.2 / 1.2.5 Subtítulos y audiodescripción (A/AA).** Vídeos con subtítulos; audiodescripción si la información visual es esencial. **[MEDIUM]**
- [ ] **1.3.1 Información y relaciones (A).** Encabezados reales (`h1`–`h6`) en orden lógico; un `h1` por página/vista; listas como `<ul>/<ol>`; tablas de datos con `<th>` y `scope`; landmarks (`header`, `nav`, `main`, `footer`); campos agrupados con `fieldset/legend`. **[MEDIUM]**
- [ ] **1.3.2 Secuencia significativa (A).** El orden del DOM coincide con el orden visual (cuidado con `order`, `flex-direction: row-reverse`, posicionamiento absoluto). **[MEDIUM]**
- [ ] **1.3.3 Características sensoriales (A).** Instrucciones que no dependen solo de forma, posición o color ("pulsa el botón verde de la derecha"). **[LOW]**
- [ ] **1.3.4 Orientación (AA).** Funciona en vertical y horizontal. **[MEDIUM]**
- [ ] **1.3.5 Propósito de los campos (AA).** `autocomplete` correcto en datos personales (nombre, email, teléfono, dirección…). **[LOW–MEDIUM]**

### Distinguible
- [ ] **1.4.1 Uso del color (A).** Errores, estados, enlaces en texto y gráficos no dependen solo del color. **[MEDIUM]**
- [ ] **1.4.3 Contraste mínimo (AA).** Texto normal ≥ **4.5:1**; texto grande (≥ 24 px, o ≥ 18.66 px en negrita) ≥ **3:1**. En ambos temas. Incluye placeholders si comunican información. **[HIGH]** en contenido principal.
- [ ] **1.4.4 Redimensionar texto (AA).** Zoom al 200% sin pérdida de contenido ni funcionalidad. **[HIGH]**
- [ ] **1.4.5 Imágenes de texto (AA).** No se usa texto dentro de imágenes salvo logos. **[LOW]**
- [ ] **1.4.10 Reflow (AA).** A 320 px de ancho CSS (equivalente a zoom 400% en 1280) no hay scroll horizontal de la página, salvo contenido que lo requiere (tablas de datos, mapas). **[HIGH]**
- [ ] **1.4.11 Contraste no textual (AA).** Bordes de inputs, checkboxes, iconos funcionales, indicador de foco y partes de gráficos necesarias para entenderlos ≥ **3:1**. **[MEDIUM]**
- [ ] **1.4.12 Espaciado de texto (AA).** No se corta contenido con interlineado 1.5, espaciado de párrafos 2×, de letras 0.12 em y de palabras 0.16 em (sin alturas fijas en contenedores de texto). **[MEDIUM]**
- [ ] **1.4.13 Contenido en hover o foco (AA).** Tooltips/popovers: se pueden cerrar con `Escape` sin mover el puntero, se puede pasar el ratón sobre ellos sin que desaparezcan y permanecen hasta que se retiran. **[MEDIUM]**

---

## 2. Operable

### Teclado
- [ ] **2.1.1 Teclado (A).** Toda funcionalidad operable con teclado; sin eventos solo de ratón (`mouseenter`, `hover` para revelar acciones, drag sin alternativa). **[CRITICAL]** si bloquea un flujo principal.
- [ ] **2.1.2 Sin trampas de teclado (A).** Se puede entrar y salir de cualquier componente (editores, iframes, modales). **[CRITICAL]**
- [ ] **2.1.4 Atajos de una tecla (A).** Atajos de una sola tecla se pueden desactivar o reasignar, o solo actúan con el componente enfocado. **[LOW]**

### Tiempo y movimiento
- [ ] **2.2.1 Tiempo ajustable (A).** Avisos antes de expirar la sesión con opción de extender. **[MEDIUM–HIGH]**
- [ ] **2.2.2 Pausar, detener, ocultar (A).** Carruseles, animaciones de más de 5 s y contenido que se actualiza solo se pueden pausar. **[MEDIUM]**
- [ ] **2.3.1 Tres destellos (A).** Nada parpadea más de 3 veces por segundo. **[CRITICAL]** si ocurre.
- [ ] *(AAA, recomendado)* **2.3.3 Animación por interacción.** `prefers-reduced-motion: reduce` desactiva parallax, zoom y animaciones no esenciales. **[MEDIUM]** si hay animaciones grandes.

### Navegación y foco
- [ ] **2.4.1 Saltar bloques (A).** Enlace "Saltar al contenido principal" o landmarks bien definidos. **[LOW–MEDIUM]**
- [ ] **2.4.2 Título de página (A).** `<title>` único y descriptivo, actualizado en cada cambio de ruta de la SPA. **[MEDIUM]**
- [ ] **2.4.3 Orden del foco (A).** Orden lógico; sin `tabindex` positivos; al abrir un modal el foco entra; al cerrarlo vuelve al disparador. **[HIGH]**
- [ ] **2.4.4 Propósito de los enlaces (A).** Enlaces con texto comprensible en su contexto (no varios "Ver más" indistinguibles sin contexto). **[LOW–MEDIUM]**
- [ ] **2.4.5 Múltiples vías (AA).** Más de una forma de llegar a cada página (menú, búsqueda, mapa del sitio), salvo pasos de un proceso. **[LOW]**
- [ ] **2.4.6 Encabezados y etiquetas (AA).** Describen el tema o propósito. **[LOW]**
- [ ] **2.4.7 Foco visible (AA).** Indicador de foco visible en todo elemento interactivo; ningún `outline: none` sin sustituto. **[HIGH]**
- [ ] **2.4.11 Foco no oculto (AA, nuevo en 2.2).** El elemento enfocado no queda totalmente tapado por headers fijos, banners de cookies o barras inferiores (`scroll-padding-top`). **[MEDIUM]**

### Modalidades de entrada
- [ ] **2.5.1 Gestos con el puntero (A).** Gestos multipunto o de trayectoria (pinch, swipe) tienen alternativa de un solo punto (botones). **[MEDIUM]**
- [ ] **2.5.2 Cancelación del puntero (A).** Las acciones se disparan al soltar (`click`), no al presionar (`mousedown`/`pointerdown`), salvo que se puedan deshacer. **[LOW–MEDIUM]**
- [ ] **2.5.3 Etiqueta en el nombre (A).** El nombre accesible contiene el texto visible (un botón "Enviar" no tiene `aria-label="Submit form"`). **[MEDIUM]**
- [ ] **2.5.4 Activación por movimiento (A).** Lo que se activa agitando o inclinando el dispositivo tiene alternativa en la interfaz. **[LOW]**
- [ ] **2.5.7 Movimientos de arrastre (AA, nuevo en 2.2).** Todo drag & drop (reordenar, sliders, kanban) tiene alternativa con clic o teclado. **[MEDIUM–HIGH]**
- [ ] **2.5.8 Tamaño del objetivo, mínimo (AA, nuevo en 2.2).** Objetivos de al menos **24×24 px** o con espacio suficiente a su alrededor. Recomendado 44×44 px en táctil (2.5.5, AAA). **[MEDIUM]**

---

## 3. Comprensible

- [ ] **3.1.1 Idioma de la página (A).** `<html lang="es">` correcto. **[LOW–MEDIUM]**
- [ ] **3.1.2 Idioma de partes (AA).** Fragmentos en otro idioma con `lang`. **[LOW]**
- [ ] **3.2.1 Al recibir el foco (A).** Enfocar no provoca cambios de contexto (navegar, enviar, abrir ventanas). **[MEDIUM]**
- [ ] **3.2.2 Al introducir datos (A).** Cambiar un select o checkbox no navega ni envía sin aviso. **[MEDIUM]**
- [ ] **3.2.3 Navegación consistente (AA)** y **3.2.4 Identificación consistente (AA).** Mismos menús y mismos nombres/iconos para las mismas funciones en todas las pantallas. **[LOW]**
- [ ] **3.2.6 Ayuda consistente (A, nuevo en 2.2).** Si hay mecanismos de ayuda (chat, contacto, FAQ), aparecen en el mismo lugar relativo en todas las páginas. **[LOW]**
- [ ] **3.3.1 Identificación de errores (A).** Los errores se describen en texto y se asocian al campo (`aria-describedby`, `aria-invalid`). **[HIGH]**
- [ ] **3.3.2 Etiquetas o instrucciones (A).** Todo campo tiene etiqueta visible; formatos esperados indicados. **[HIGH]**
- [ ] **3.3.3 Sugerencias ante errores (AA).** El mensaje dice cómo corregir. **[MEDIUM]**
- [ ] **3.3.4 Prevención de errores en datos legales, financieros o de usuario (AA).** Revisión, confirmación o posibilidad de deshacer antes de enviar. **[HIGH]**
- [ ] **3.3.7 Entrada redundante (A, nuevo en 2.2).** No se pide al usuario reintroducir información ya proporcionada en el mismo proceso (se autocompleta o se puede seleccionar). **[LOW–MEDIUM]**
- [ ] **3.3.8 Autenticación accesible, mínimo (AA, nuevo en 2.2).** El login no exige pruebas cognitivas (recordar o transcribir) sin alternativa: se permite pegar y gestores de contraseñas, y los CAPTCHA tienen alternativa. **[HIGH]**

---

## 4. Robusto

- [ ] **4.1.2 Nombre, rol, valor (A).** Todo control tiene nombre accesible, rol correcto y estado expuesto (`aria-expanded`, `aria-selected`, `aria-checked`, `aria-pressed`, `aria-current`). Sin `div`/`span` clicables sin rol ni teclado. **[HIGH]**
- [ ] **4.1.3 Mensajes de estado (AA).** Resultados de búsqueda, guardados, errores asíncronos y toasts se anuncian sin mover el foco (`role="status"` / `aria-live="polite"`; `role="alert"` para errores críticos). **[MEDIUM]**

*(El criterio 4.1.1 Procesamiento fue eliminado en WCAG 2.2.)*

---

## 5. Comprobaciones por componente

| Componente | Comprobar |
| :--- | :--- |
| Modal / drawer | `role="dialog"` + `aria-modal="true"` + `aria-labelledby`; foco inicial dentro; foco confinado; `Escape` cierra; foco devuelto al disparador; fondo inerte (`inert`). |
| Menú desplegable | botón con `aria-expanded` y `aria-controls`/`aria-haspopup`; flechas para moverse; `Escape` cierra y devuelve el foco. |
| Tabs | `tablist` / `tab` (`aria-selected`, `aria-controls`) / `tabpanel`; flechas entre pestañas; una sola pestaña en el orden de tabulación. |
| Acordeón | botón dentro de encabezado con `aria-expanded`; panel asociado. |
| Combobox / autocompletado | `role="combobox"` con `aria-expanded`, `aria-controls`, `aria-activedescendant`; listbox con opciones; resultados anunciados. |
| Toast | región live; tiempo suficiente o pausable; no roba el foco; acciones alcanzables. |
| Tabla con ordenación | `aria-sort` en la cabecera activa; botón dentro del `<th>`. |
| SPA: cambio de ruta | título actualizado; foco al `h1` o al contenido principal; anuncio de la nueva página. |
| Carga asíncrona | `aria-busy` en la región; anuncio al terminar. |
| Iconos | decorativos ocultos; funcionales con nombre. |

## Cómo inspeccionar rápido

- `<div` o `<span` con `@click`, `onClick`, `(click)` sin `role` ni `tabindex`.
- `outline-none`, `outline: none`, `outline: 0`.
- `tabindex="` con valores positivos.
- `<img` sin `alt`; `<button>` cuyo único contenido es un icono sin `aria-label`.
- `<input` sin `<label for>` ni `aria-label`/`aria-labelledby`.
- `aria-hidden="true"` sobre elementos enfocables.
- Modales: buscar la implementación y comprobar focus trap, `Escape` y restauración del foco.
- `mouseenter`/`mouseover`/`hover:` que revelan acciones sin equivalente de foco (`focus-within`, `focus-visible`).
