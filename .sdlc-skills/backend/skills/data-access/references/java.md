# Acceso a datos — notas Java / Spring Data JPA / Hibernate

## N+1 y carga

- Relaciones `@ManyToOne`/`@OneToOne` son EAGER por defecto en JPA: márcalas `fetch = FetchType.LAZY` y carga explícitamente donde haga falta.
- Carga explícita: `JOIN FETCH` en JPQL, `@EntityGraph(attributePaths = {...})` en repositorios, `@BatchSize`/`hibernate.default_batch_fetch_size` para agrupar cargas perezosas.
- **`spring.jpa.open-in-view=false`**: con open-in-view activo (por defecto, con un aviso), la serialización en el controlador dispara consultas perezosas fuera del servicio y oculta los N+1.
- Proyecciones (interfaces o records/DTOs en la consulta) para listados: menos columnas y sin entidades gestionadas.
- Detectar: `spring.jpa.properties.hibernate.generate_statistics=true`, `datasource-proxy`, Hypersistence Utils (aserciones de número de consultas en tests).

## Transacciones

- `@Transactional` en el servicio de aplicación (caso de uso). Trampas:
  - **Auto-invocación:** llamar a un método `@Transactional` desde otro método de la misma clase no pasa por el proxy y no abre transacción.
  - Solo funciona en métodos públicos de beans de Spring.
  - Rollback por defecto solo ante `RuntimeException`; para checked exceptions, `rollbackFor`.
  - `readOnly = true` en lecturas (optimizaciones y protección).
- Efectos tras el commit: `@TransactionalEventListener(phase = AFTER_COMMIT)`.
- Nunca llamadas HTTP (`RestClient`, `WebClient`, Feign) dentro de un método transaccional.

## Concurrencia

- **Optimista:** `@Version` en la entidad; `ObjectOptimisticLockingFailureException` → 409 o reintento (`spring-retry`/`@Retryable`).
- **Pesimista:** `@Lock(LockModeType.PESSIMISTIC_WRITE)` en el método del repositorio, con hint `jakarta.persistence.lock.timeout`.
- **Atómico:** `@Modifying @Query("update Product p set p.stock = p.stock - :qty where p.id = :id and p.stock >= :qty")` y comprobar el entero devuelto.
- Unicidad: constraint en la base de datos y mapeo de `DataIntegrityViolationException` a 409.
- `SKIP LOCKED`: hint `jakarta.persistence.lock.timeout = -2` (Hibernate) o consulta nativa.

## Pool y operaciones masivas

- HikariCP: `maximum-pool-size` pequeño y explícito, `connection-timeout`, `leak-detection-threshold` en entornos de prueba.
- Statement timeout: `jakarta.persistence.query.timeout` o configuración del driver/base de datos.
- Batch: `hibernate.jdbc.batch_size`, `order_inserts=true`; con `GenerationType.IDENTITY` Hibernate no puede agrupar inserciones (usa secuencias). Para volúmenes grandes, `JdbcTemplate.batchUpdate` o `COPY`.
- Paginación por cursor: Spring Data `ScrollPosition`/`Window` (keyset) en versiones recientes, o consultas con `where (created_at, id) < (:c, :i)`.
