# Checklist de auditoría — caché

Severidad orientativa entre corchetes ([severity.md](../../../standards/severity.md)).

## 1. Seguridad y aislamiento

- [ ] Las claves de valores personalizados incluyen tenant y usuario (o permisos). **[CRITICAL]** si pueden servirse datos de un usuario/tenant a otro.
- [ ] Respuestas autenticadas o personalizadas con `Cache-Control: private` o `no-store`. **[CRITICAL]** si una CDN o proxy puede cachearlas como públicas.
- [ ] No se cachean decisiones de permisos o revocaciones con TTL largos. **[HIGH]**
- [ ] Sin datos sensibles innecesarios en la caché (o cifrados si es imprescindible). **[MEDIUM]**

## 2. Corrección

- [ ] Todo valor tiene TTL. **[MEDIUM]**
- [ ] Cada escritura que afecta a un valor cacheado lo invalida, tras el commit. **[HIGH]** si los usuarios ven datos obsoletos tras guardar en flujos principales.
- [ ] Invalidación por borrado (no sobrescritura) o con versionado para evitar carreras. **[MEDIUM]**
- [ ] Formato versionado en la clave o validado al leer. **[MEDIUM]** si un despliegue puede romper al leer valores antiguos.
- [ ] Datos que exigen consistencia estricta no se sirven desde caché. **[HIGH]**
- [ ] Varias instancias con caché en memoria tienen una estrategia de invalidación o TTL corto. **[MEDIUM]**

## 3. Resiliencia

- [ ] Timeouts cortos en el cliente de caché y fallback a la fuente si falla. **[HIGH]** si la caída de la caché tumba el servicio.
- [ ] Claves calientes protegidas contra stampede (single-flight, lock, SWR, jitter). **[MEDIUM]**; **[HIGH]** si ya hay picos de carga al expirar.
- [ ] La fuente está protegida cuando la caché no está disponible (límites de concurrencia, degradación). **[MEDIUM]**

## 4. Operación

- [ ] `maxmemory` y política de expulsión configuradas acorde al uso. **[MEDIUM]**
- [ ] Caché separada de colas, sesiones y rate limiting si sus políticas de expulsión son incompatibles. **[HIGH]** si la caché puede expulsar jobs o sesiones.
- [ ] Valores de tamaño razonable; sin `KEYS` en producción. **[MEDIUM]**
- [ ] Métricas de aciertos, latencia, memoria y expulsiones. **[LOW–MEDIUM]**
- [ ] La caché se justificó con una medición (y la consulta subyacente es razonable). **[INFO–LOW]**

## Cómo inspeccionar rápido

- Claves: buscar `cache.set(`, `redis.set(`, `@Cacheable(`, `cache.get(`, `cache_page`, `@lru_cache` y revisar cómo se construye la clave (¿incluye tenant/usuario?).
- TTL: llamadas `set` sin expiración (`EX`, `PX`, `ttl`, `timeout`), `@Cacheable` sin TTL configurado en el `CacheManager`.
- Cabeceras: `Cache-Control: public`, `cache_page`/`@cache_control(public=True)` en vistas autenticadas, `max-age` en endpoints con datos de usuario.
- Invalidación: escrituras en entidades cacheadas sin `del`/`@CacheEvict` correspondiente; invalidaciones dentro de la transacción.
- `KEYS ` en código o scripts de mantenimiento.
- Configuración de Redis: `maxmemory-policy` y si el mismo Redis aloja colas o sesiones.
