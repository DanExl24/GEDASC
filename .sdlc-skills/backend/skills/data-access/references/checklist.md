# Checklist de auditoría — acceso a datos

Severidad orientativa entre corchetes ([severity.md](../../../standards/severity.md)).

## 1. Consultas

- [ ] Sin consultas dentro de bucles sobre resultados de otra consulta (N+1). **[HIGH]** en endpoints principales o listados; **[MEDIUM]** en procesos internos.
- [ ] Las relaciones se cargan con eager loading o en lote donde se usan. **[MEDIUM]**
- [ ] Todas las consultas de listado tienen límite. **[HIGH]** en tablas que crecen sin control.
- [ ] Columnas explícitas cuando hay columnas pesadas o datos sensibles. **[LOW–MEDIUM]**
- [ ] Recuentos y agregados se hacen en SQL, no cargando filas. **[MEDIUM]**
- [ ] Paginación por cursor en listados grandes o infinitos. **[MEDIUM]**
- [ ] Todo SQL directo está parametrizado; identificadores dinámicos desde lista blanca. **[CRITICAL]** si hay interpolación de valores de usuario (→ `api-security`).
- [ ] Las consultas viven en repositorios/capa de datos, no dispersas en controladores. **[MEDIUM]**

## 2. Transacciones

- [ ] Operaciones que modifican varias filas/tablas relacionadas usan una transacción. **[HIGH]**; **[CRITICAL]** si involucran dinero o stock y pueden quedar a medias.
- [ ] Rollback garantizado ante cualquier error. **[HIGH]**
- [ ] Sin llamadas HTTP, publicaciones en colas, uploads o esperas dentro de transacciones. **[HIGH]**
- [ ] El límite de la transacción coincide con el caso de uso (no una por consulta, no una por petición entera con trabajo ajeno). **[MEDIUM]**
- [ ] Con aislamiento `REPEATABLE READ`/`SERIALIZABLE`, hay reintento ante errores de serialización. **[MEDIUM]**

## 3. Concurrencia

- [ ] Toda operación leer-modificar-escribir sobre recursos compartidos (stock, saldo, plazas, contadores, estados) usa actualización atómica, bloqueo optimista o pesimista. **[CRITICAL]** en dinero/stock; **[HIGH]** en otros casos.
- [ ] Las transiciones de estado se aplican de forma condicional (`WHERE status = …`). **[HIGH]**
- [ ] Unicidades de negocio respaldadas por constraints `UNIQUE`; "buscar y crear" sustituido por upsert. **[HIGH]**
- [ ] Ediciones concurrentes de usuarios protegidas con versión/ETag donde perder cambios es grave. **[MEDIUM]**
- [ ] Bloqueos pesimistas en orden consistente y con timeout. **[MEDIUM]**
- [ ] Jobs que no deben ejecutarse en paralelo están protegidos (advisory lock, lock distribuido, `SKIP LOCKED`). **[MEDIUM–HIGH]**

## 4. Pool y timeouts

- [ ] Tamaño de pool explícito y coherente con instancias × workers y `max_connections`. **[MEDIUM]**; **[HIGH]** si ya hay errores de conexiones agotadas.
- [ ] Timeout de adquisición de conexión configurado. **[MEDIUM]**
- [ ] Statement timeout por defecto. **[MEDIUM]**
- [ ] Conexiones liberadas siempre (sin fugas en caminos de error). **[HIGH]**
- [ ] Pooler externo en entornos con muchas instancias o serverless. **[MEDIUM]**

## 5. Operaciones masivas y réplicas

- [ ] Inserciones y actualizaciones masivas en lote. **[MEDIUM]**
- [ ] Procesos sobre grandes volúmenes en background y por lotes. **[MEDIUM]**
- [ ] Lecturas tras escritura del mismo usuario van a la primaria si hay réplicas. **[MEDIUM]**

## Cómo inspeccionar rápido

- N+1: `await` dentro de `for`/`forEach`/`map` con llamadas al ORM; acceso a relaciones lazy en serializadores; activar el log de consultas y contar por petición.
- Sin límite: `findMany(`, `.all()`, `findAll()`, `SELECT` sin `LIMIT` en endpoints de listado.
- Concurrencia: patrones `find…` seguido de comprobación y `update`/`save` del mismo registro; `if (!exists) create`.
- Transacciones: llamadas a `fetch`/`axios`/`requests`/`RestTemplate`/`WebClient`/`publish`/`send` dentro de `transaction`/`atomic`/`@Transactional`.
- SQL directo: template strings con `${` pasadas a `query(`, `f"SELECT … {`, `"SELECT … " +`, `.raw(` / `$queryRawUnsafe` / `createNativeQuery` con concatenación.
- Pool: configuración de `pool`, `connection_limit`, `pool_size`, `maximumPoolSize`; en la base de datos, `pg_stat_activity` con `idle in transaction`.
