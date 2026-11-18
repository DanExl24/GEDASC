# Tooling — notas React / Next.js

## React + Vite

- Proyecto base: `npm create vite@latest -- --template react-ts`.
- Plugin `@vitejs/plugin-react` (Babel, necesario si se usa React Compiler mediante su plugin de Babel) o `@vitejs/plugin-react-swc` (más rápido).
- Type-check con `tsc -b` / `tsc --noEmit`: Vite no comprueba tipos.
- ESLint: `eslint-plugin-react-hooks` (reglas de hooks; en versiones recientes incluye las reglas del React Compiler), `eslint-plugin-react-refresh` (exports compatibles con Fast Refresh), `eslint-plugin-jsx-a11y`.
- Variables: `import.meta.env.VITE_*`, tipadas en `vite-env.d.ts` y validadas en runtime.

## Next.js

- `create-next-app` con TypeScript, ESLint y Tailwind opcionales.
- Lint: configuración `eslint-config-next` (core-web-vitals) usada desde la CLI de ESLint; comprueba en la versión del proyecto si `next lint` sigue disponible o está deprecado.
- Type-check: `next build` comprueba tipos por defecto (no lo desactives con `ignoreBuildErrors`); añade `tsc --noEmit` en CI para fallar antes.
- Variables: `NEXT_PUBLIC_*` se incrustan en el build (cambiarlas exige recompilar); el resto se lee en servidor en runtime. Valídalas con un schema (por ejemplo, con `@t3-oss/env-nextjs`).
- Turbopack para desarrollo (y build en versiones recientes); `output: 'standalone'` para imágenes Docker mínimas; `output: 'export'` para sitios 100% estáticos.
- Análisis del bundle: `@next/bundle-analyzer`.
