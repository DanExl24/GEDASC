# Checklist de auditoría — estado y reactividad

Severidad orientativa entre corchetes; ajústala según impacto real ([severity.md](../../../standards/severity.md)).

## 1. Ubicación del estado

- [ ] Los stores globales no contienen datos del servidor gestionados a mano (listas + `loading` + `error` + `fetch`). **[MEDIUM]** → `data-fetching`.
- [ ] El estado efímero de UI (modales, inputs, hovers) no está en stores globales. **[LOW–MEDIUM]**
- [ ] Filtros, búsqueda, paginación y pestañas compartibles están en la URL. **[LOW–MEDIUM]**
- [ ] No hay el mismo dato en dos sitios (store + estado local, dos stores). **[MEDIUM]**
- [ ] Los valores derivados se calculan (`computed`, selectores), no se almacenan. **[LOW–MEDIUM]**

## 2. Diseño de stores

- [ ] Cada store tiene una responsabilidad clara y un tamaño manejable. **[LOW]**
- [ ] Las mutaciones pasan por acciones con nombre de intención; los componentes no modifican el estado directamente. **[MEDIUM]**
- [ ] Inmutabilidad respetada donde la librería la requiere (React/Redux/Zustand/signals con objetos). **[HIGH]** si mutar provoca que la UI no se actualice.
- [ ] Estados asíncronos modelados sin combinaciones imposibles (`loading && error`). **[LOW]**
- [ ] Reglas de negocio críticas no dependen solo del estado del cliente. **[HIGH]** si afectan a precios o permisos → escalar a backend.

## 3. Ciclo de vida y memoria

- [ ] Todo `addEventListener` en `window`/`document` tiene su `removeEventListener` (misma referencia) o usa `signal`. **[HIGH]** si está en componentes que se montan y desmontan con frecuencia.
- [ ] Todo `setInterval` tiene su `clearInterval`; los `setTimeout` pendientes se limpian al desmontar. **[MEDIUM–HIGH]**
- [ ] WebSockets, `EventSource`, suscripciones a observables y event buses se cierran. **[HIGH]**
- [ ] Observers (`Resize`, `Intersection`, `Mutation`) se desconectan. **[MEDIUM]**
- [ ] Librerías imperativas (gráficos, mapas, editores) se destruyen al desmontar. **[MEDIUM]**
- [ ] No hay cachés de módulo que crezcan sin límite. **[MEDIUM]**
- [ ] No se guardan nodos del DOM ni instancias de componentes en stores. **[MEDIUM]**

## 4. Reactividad y renders

- [ ] No hay pérdida de reactividad por desestructuración o copia (ver referencia del stack). **[HIGH]** si la UI muestra datos desactualizados.
- [ ] No hay watchers/efectos que copian un estado en otro. **[LOW–MEDIUM]**
- [ ] No hay bucles: efectos que modifican sus propias dependencias, `computed` con efectos secundarios. **[CRITICAL]** si se produce un loop de render.
- [ ] Contextos/stores no provocan re-renders de toda la app por cambios pequeños (selectores, partición de contextos). **[MEDIUM]** si hay lentitud perceptible.
- [ ] Listas largas usan `key` estables (no el índice) cuando los elementos se reordenan o eliminan. **[MEDIUM]**

## 5. Persistencia y SSR

- [ ] Solo se persiste lo necesario y con versión/migración. **[LOW]**
- [ ] No se persisten tokens ni datos sensibles en `localStorage`. **[HIGH]**
- [ ] Lo leído de almacenamiento se valida antes de usarse. **[LOW–MEDIUM]**
- [ ] El estado persistido se limpia al cerrar sesión. **[MEDIUM]**; **[HIGH]** en equipos compartidos.
- [ ] En SSR, stores y estado son por petición; no hay singletons de módulo con datos de usuario. **[CRITICAL]**
- [ ] El estado hidratado es serializable y no hay accesos a `window` durante el render en servidor. **[MEDIUM]**

## Cómo inspeccionar rápido

- Listeners sin limpiar: buscar `addEventListener(` y verificar que hay `removeEventListener(` o `signal` en el mismo archivo.
- Timers: buscar `setInterval(` y su `clearInterval(`.
- Sockets/observables: `new WebSocket`, `new EventSource`, `.subscribe(` sin `unsubscribe`/`takeUntilDestroyed`/`async` pipe.
- Stores-caché: stores con propiedades `loading`/`isLoading` y acciones `fetch*`/`load*`.
- Sincronización con efectos: `watch(` o `useEffect(` cuyo cuerpo solo asigna otro estado.
- Memoria en ejecución: DevTools → Memory → heap snapshot antes y después de navegar varias veces entre dos vistas; buscar "Detached" nodes y objetos que crecen.
