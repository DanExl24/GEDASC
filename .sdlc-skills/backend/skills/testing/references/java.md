# Testing — notas Java / Spring Boot

- **Slices:** `@WebMvcTest` (controladores con MockMvc, validación y serialización), `@DataJpaTest` (repositorios; con `@AutoConfigureTestDatabase(replace = NONE)` para usar la BD real de Testcontainers en lugar de H2), `@SpringBootTest` para tests de API completos.
- **Testcontainers:** `@Testcontainers` + `@Container` + **`@ServiceConnection`** (Spring Boot 3.1+) configura automáticamente la conexión; reutiliza contenedores entre clases (contenedores estáticos o `@ImportTestcontainers`). Flyway/Liquibase aplican las migraciones reales al arrancar.
- **Aislamiento:** `@Transactional` en el test revierte al final, pero no sirve si el código usa `REQUIRES_NEW`, hilos o colas; en ese caso, limpieza explícita (truncado) entre tests.
- **Seguridad:** `spring-security-test` (`@WithMockUser`, `jwt()` en MockMvc) para la matriz de permisos.
- **HTTP externo:** WireMock (`@EnableWireMock` o `wiremock-spring-boot`), `MockRestServiceServer`.
- **Tiempo:** `Clock` inyectado y `Clock.fixed(...)` en tests.
- **Aserciones:** AssertJ; `Awaitility` para esperar condiciones en código asíncrono (nunca `Thread.sleep`).
- **Arquitectura:** ArchUnit (→ `architecture`). **Contrato:** Pact JVM o Spring Cloud Contract. **Mutación:** PIT (`pitest-maven`).
