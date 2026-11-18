# Checklist de auditoría — enrutado

Severidad orientativa entre corchetes ([severity.md](../../../standards/severity.md)).

## 1. Definición

- [ ] Rutas centralizadas (o file-based) con nombres o helpers tipados; sin strings de URL repetidos por el código. **[LOW–MEDIUM]**
- [ ] Metadatos por ruta (título, sesión, roles) tipados. **[LOW]**
- [ ] Layouts anidados para no re-montar el shell al navegar. **[LOW]**
- [ ] History mode; el servidor sirve la app en rutas profundas (recargar no da 404 del servidor). **[HIGH]** si recargar rompe la app.
- [ ] Redirecciones para URLs antiguas tras cambios de estructura. **[MEDIUM]**

## 2. Carga

- [ ] Lazy loading por ruta o por feature. **[MEDIUM]**
- [ ] Prefetch razonable (no todo, no nada) en rutas de navegación frecuente. **[INFO–LOW]**
- [ ] Datos de la ruta iniciados al navegar (loader/resolver/prefetch), sin cascada código → montaje → datos. **[LOW–MEDIUM]**
- [ ] Se gestiona el error de carga de chunks tras un despliegue. **[MEDIUM]**

## 3. Autenticación y autorización

- [ ] La sesión se resuelve antes de que los guards decidan. **[HIGH]** si se ve contenido protegido o hay redirecciones falsas al login.
- [ ] El parámetro de retorno del login se valida (solo rutas internas). **[HIGH]** (open redirect).
- [ ] No autenticado → login; autenticado sin permiso → 403, no login. **[LOW–MEDIUM]**
- [ ] Las rutas y acciones ocultas por rol están también protegidas en el backend (verificar o señalar para backend). **[CRITICAL]** si la API no autoriza.
- [ ] Al cerrar sesión se redirige y no se puede volver con "atrás" a vistas con datos (o se re-validan). **[MEDIUM]**

## 4. Estado en la URL

- [ ] Filtros, búsqueda, paginación, orden y pestañas relevantes están en la URL. **[MEDIUM]**
- [ ] Los query params se parsean y validan con valores por defecto. **[MEDIUM]**; **[HIGH]** si valores inválidos rompen la vista o llegan sin filtrar a la API.
- [ ] Búsquedas en vivo usan `replace` y debounce. **[LOW]**
- [ ] Al cambiar filtros se vuelve a la página 1. **[LOW]**
- [ ] No hay tokens ni datos personales en la URL. **[HIGH]**

## 5. Errores

- [ ] Ruta catch-all 404 con página útil. **[MEDIUM]**
- [ ] Recursos inexistentes muestran "no encontrado", no un error genérico. **[LOW–MEDIUM]**
- [ ] Página 403 explicativa. **[LOW]**
- [ ] Error boundary por ruta o sección. **[MEDIUM]**

## 6. Experiencia de navegación

- [ ] Título de documento actualizado en cada ruta. **[MEDIUM]** (→ `accessibility` 2.4.2).
- [ ] Foco o anuncio al cambiar de ruta. **[MEDIUM]** (→ `accessibility`).
- [ ] `aria-current="page"` en el enlace activo. **[LOW]**
- [ ] Scroll al inicio en navegación nueva y restaurado al volver atrás. **[LOW–MEDIUM]**
- [ ] Aviso de cambios sin guardar en formularios largos. **[MEDIUM]** (→ `forms`).
- [ ] Modales que deberían poder compartirse están representados en la URL. **[LOW]**

## Cómo inspeccionar rápido

- Strings de rutas: buscar `push('/`, `navigate('/`, `href="/app`, `routerLink="/` repetidos.
- Imports estáticos de páginas en la definición de rutas.
- Guards: buscar `beforeEach`, `CanActivateFn`, `loader` con comprobaciones de sesión; verificar qué pasa si la sesión aún no se ha cargado.
- Login: buscar `redirect`, `returnUrl`, `next` en query y comprobar si se valida antes de navegar.
- Query params: buscar `route.query.`, `searchParams.get(`, `queryParamMap` usados sin parseo.
- Prueba manual: `/login?redirect=//evil.com`, `/app/pedidos?page=abc`, recargar en una ruta profunda.
