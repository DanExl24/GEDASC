# Accesibilidad — notas React / Next.js

## Lint

`eslint-plugin-jsx-a11y` (configuración `recommended` o `strict`).

## IDs y atributos

- `useId()` para IDs de `htmlFor`, `aria-labelledby`, `aria-describedby`, estables en SSR.
- En JSX los atributos ARIA se escriben tal cual (`aria-expanded={open}`); `htmlFor` en lugar de `for`, `tabIndex` en lugar de `tabindex`.
- `aria-expanded={open}` renderiza `"true"`/`"false"`: correcto.

## Modales y overlays

- `createPortal` para renderizar en `body`, aplicando `inert` al resto de la app mientras el modal está abierto.
- `<dialog>` nativo con `ref.current.showModal()` en un efecto, o librerías: **Radix Dialog**, **React Aria `useDialog`/`Modal`**, **Headless UI**.
- Restaurar el foco al cerrar: guarda el elemento activo al abrir (`document.activeElement`) y enfócalo en el cleanup.

## Foco programático

```tsx
const headingRef = useRef<HTMLHeadingElement>(null)
useEffect(() => { headingRef.current?.focus() }, [pathname])

<h1 ref={headingRef} tabIndex={-1}>{title}</h1>
```

## Cambio de ruta

- React Router: efecto en el layout que observe `useLocation()` y actualice el título y el foco.
- Next.js App Router incluye un anunciador de rutas que lee el título del documento (o el primer `h1`) al navegar; define `metadata.title` en cada página. Gestiona el foco tú si el diseño lo requiere.

## Regiones live

Un proveedor `Announcer` con una región `role="status"` montada una vez y un hook `useAnnounce()`. React Aria ofrece `announce()` (`@react-aria/live-announcer`).

## Errores comunes

- `onClick` en `div` (jsx-a11y lo marca: `click-events-have-key-events`, `no-static-element-interactions`).
- `autoFocus` indiscriminado: mueve el foco sin contexto; úsalo solo en modales o en el primer campo de una página cuyo único propósito es ese formulario.
- Componentes de librería sin etiqueta (`<Select>` sin `aria-label` o label asociado).
- Mensajes de error de formularios renderizados sin `aria-describedby`.

## Librerías

**Radix UI**, **React Aria Components** (Adobe, muy completa en teclado y lectores), **Headless UI**, **Ark UI**. shadcn/ui se basa en Radix: hereda su accesibilidad si no se modifica el marcado.
