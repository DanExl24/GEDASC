# Seguridad — notas React / Next.js

## Vías de escape

- JSX escapa el texto; **`dangerouslySetInnerHTML` no sanitiza**:
  ```tsx
  <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(comment.body) }} />
  ```
  Encapsúlalo en un componente `<SafeHtml html={…} />` para tener un único punto auditable.
- `href={userUrl}`: las versiones recientes de React advierten o bloquean URLs `javascript:`, pero no confíes en ello; valida con `safeUrl()`.
- `ref.current.innerHTML = …` salta todas las protecciones de React.
- Librerías de markdown (`react-markdown`) no renderizan HTML por defecto; si activas `rehype-raw`, añade `rehype-sanitize`.

## Next.js

- Solo `NEXT_PUBLIC_*` llega al cliente; el resto de variables está disponible en servidor. Aun así, una variable sin prefijo usada en un componente cliente queda `undefined`: si "lo arreglas" añadiendo el prefijo a un secreto, lo publicas.
- `import 'server-only'` en módulos con secretos para que el build falle si se importan desde cliente.
- **Server Actions y Route Handlers son endpoints públicos:** valida los argumentos con un schema y comprueba sesión y permisos dentro de cada acción, aunque el botón que la invoca solo se muestre a administradores.
- Props de Server Components a Client Components se serializan en el HTML: pasa solo los campos necesarios (no `user` completo con hash de contraseña o datos internos). Las APIs experimentales de "taint" de React ayudan a impedir que ciertos objetos lleguen al cliente.
- CSP con nonces: generar el nonce en `middleware.ts`, ponerlo en la cabecera y leerlo en el layout (`headers()`); Next lo aplica a sus scripts.
- `middleware.ts` no debe ser la única barrera de autorización: verifica también en el acceso a datos.

## Estado y persistencia

- `zustand/persist` y `redux-persist` con lista blanca explícita; nunca tokens.
- Context de sesión: el token (si es Bearer) en memoria; al cerrar sesión, `queryClient.clear()` y reset de stores.
