# Autenticación — notas Java / Spring Security

## Configuración base

```java
@Bean
SecurityFilterChain api(HttpSecurity http) throws Exception {
  return http
    .authorizeHttpRequests(a -> a
      .requestMatchers("/auth/login", "/auth/register", "/actuator/health").permitAll()
      .anyRequest().authenticated())                          // deny by default
    .oauth2ResourceServer(o -> o.jwt(Customizer.withDefaults()))
    .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
    .build();
}
```

- **Resource server con JWT:** `spring.security.oauth2.resourceserver.jwt.issuer-uri` (descubre el JWKS y valida `iss`) y `audiences` (Spring Boot 3.x) para validar `aud`; algoritmos según el JWKS. Validadores adicionales con `JwtValidators.createDefaultWithIssuer` + un `OAuth2TokenValidator` propio si hace falta.
- **Sesiones (web con login propio):** Spring Security aplica protección contra session fixation por defecto (`changeSessionId`) y CSRF por defecto; no los desactives salvo en APIs sin cookies. Spring Session con Redis para sesiones compartidas entre instancias.
- **Contraseñas:** `PasswordEncoderFactories.createDelegatingPasswordEncoder()` (permite migrar algoritmos con prefijo `{bcrypt}`, `{argon2}`), o `Argon2PasswordEncoder.defaultsForSpringSecurity_v5_8()`/`BCryptPasswordEncoder(12)`.
- **Proveedor de identidad propio:** Spring Authorization Server; como cliente OIDC, `spring-boot-starter-oauth2-client` (Authorization Code + PKCE).
- **Logout:** invalida la sesión (`HttpSession.invalidate`) y, con tokens, revoca los refresh tokens en el servidor de autorización.

## Detalles

- Fuerza bruta: no viene incluido; usa Bucket4j o límites en el gateway, con un `AuthenticationFailureHandler` que registre y cuente fallos por cuenta e IP.
- Mensajes: `BadCredentialsException` es genérica por defecto; evita personalizar mensajes que distingan usuario inexistente (`hideUserNotFoundExceptions` es `true` por defecto en `DaoAuthenticationProvider`).
- Tokens aleatorios: `SecureRandom` + `Base64.getUrlEncoder().withoutPadding()`; comparación con `MessageDigest.isEqual`.
- MFA: soporte en versiones recientes de Spring Security (autenticación multifactor y passkeys/WebAuthn); compruébalo en la versión del proyecto, o delega en el proveedor de identidad.
