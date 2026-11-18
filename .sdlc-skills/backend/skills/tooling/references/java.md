# Tooling — notas Java / Spring Boot

- **Build:** Maven o Gradle con **wrapper** versionado; toolchain de Java declarada (`<release>`/`java.toolchain.languageVersion`); `./mvnw -B -ntp verify` o `./gradlew build` en CI con caché.
- **Calidad:** Spotless para formato (falla en CI con `spotless:check`), Error Prone y/o SpotBugs (con FindSecBugs), Checkstyle o PMD si el equipo lo usa; ArchUnit en los tests.
- **Configuración:** `@ConfigurationProperties` con `@Validated` (falla al arrancar si un valor es inválido) en lugar de `@Value` disperso; perfiles para diferencias reales de entorno; secretos con Spring Cloud Vault/AWS/Azure o variables de entorno, nunca en `application.yml` versionado.
- **Local:** `spring-boot-docker-compose` levanta automáticamente los servicios de `compose.yaml` al arrancar en desarrollo; Testcontainers con `@ServiceConnection` también en desarrollo (`TestApplication` con contenedores).
- **Imagen:** `./mvnw spring-boot:build-image` (Buildpacks, sin Dockerfile, imagen sin root y en capas) o Dockerfile multi-stage con *layered jars* sobre una base JRE mínima (distroless/`eclipse-temurin:<v>-jre`).
- **Dependencias:** BOM de Spring Boot para versiones coherentes; Renovate/Dependabot; OWASP Dependency-Check u OSV-Scanner en CI.
