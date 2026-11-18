# Seguridad de la API — notas Java / Spring

- **SQL:** JPQL/Criteria con parámetros (`:name`); `JdbcTemplate`/`NamedParameterJdbcTemplate` con parámetros; nunca concatenación en `createQuery`/`createNativeQuery`. Para ordenación dinámica, `Sort` de Spring Data con propiedades de lista blanca.
- **Procesos:** `ProcessBuilder` con lista de argumentos; nunca `Runtime.exec(String)` con datos externos (tokeniza de forma insegura).
- **Expresiones:** nunca evaluar SpEL con entrada del usuario (`SpelExpressionParser.parseExpression(input)`); si es imprescindible, `SimpleEvaluationContext`.
- **XML (XXE):** `DocumentBuilderFactory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true)` y equivalentes en SAX/StAX/JAXB; preferible JSON.
- **Deserialización:** sin `ObjectInputStream` con datos externos; Jackson sin `activateDefaultTyping` global (si hace falta polimorfismo, `@JsonTypeInfo` con una lista cerrada de subtipos y `PolymorphicTypeValidator`).
- **Actuator:** `management.endpoints.web.exposure.include=health,info` (nunca `*` en producción); endpoints de gestión en un puerto interno (`management.server.port`) y protegidos; `env`, `heapdump`, `threaddump`, `loggers` y `configprops` exponen secretos o permiten cambios.
- **Rate limiting:** Bucket4j (con Redis/Hazelcast para varias instancias) o Resilience4j RateLimiter, o en el API gateway.
- **Uploads:** `spring.servlet.multipart.max-file-size`/`max-request-size`; Apache Tika para detectar el tipo real; almacenamiento en S3 con URLs prefirmadas.
- **SSRF:** `InetAddress.getAllByName` y comprobación (`isSiteLocalAddress`, `isLoopbackAddress`, `isLinkLocalAddress`, `isAnyLocalAddress` + rangos adicionales como `100.64.0.0/10` y metadatos); clientes HTTP sin seguir redirecciones automáticamente.
- **Análisis y dependencias:** SpotBugs con FindSecBugs, Semgrep, OWASP Dependency-Check u OSV-Scanner, Dependabot/Renovate; imágenes base mínimas (distroless, JRE slim) sin root.
- **Secretos:** Spring Cloud Vault / AWS Secrets Manager / Azure Key Vault con `spring.config.import`; nunca en `application.yml` versionado.
