# Autorización — notas Java / Spring Security

- **Deny by default:** `authorizeHttpRequests(a -> a.requestMatchers(...públicas...).permitAll().anyRequest().authenticated())`, y `denyAll()` para prefijos que no deben existir.
- **Seguridad por método:** `@EnableMethodSecurity` y `@PreAuthorize("hasAuthority('invoice:approve')")`; para decisiones por objeto, un bean de políticas: `@PreAuthorize("@invoicePolicy.canRead(authentication, #id)")`, o comprobación explícita en el servicio de aplicación tras cargar el recurso con una consulta acotada.
- `@PostFilter` filtra colecciones en memoria tras cargarlas: no lo uses para listados grandes ni como única barrera; acota la consulta.
- **Autoridades vs roles:** comprueba autoridades (permisos); los roles (`ROLE_ADMIN`) agrupan autoridades.
- **Consultas acotadas:** métodos de repositorio con el tenant (`findByIdAndTenantId`), o filtros automáticos.
- **Multi-tenant en Hibernate:** `@TenantId` (Hibernate 6) con un `CurrentTenantIdentifierResolver` que lee el tenant del contexto de seguridad, filtra automáticamente las entidades marcadas; o `@Filter`/`@FilterDef` habilitados por sesión; o esquema/base de datos por tenant con `MultiTenantConnectionProvider`. RLS de PostgreSQL como defensa adicional.
- **Por propiedad:** DTOs de entrada y salida distintos por rol; `@JsonView` es una opción para salida, pero DTOs explícitos son más claros.
- **Tests:** `@WithMockUser(authorities = ...)` o `SecurityMockMvcRequestPostProcessors.jwt()` para la matriz de permisos; tests con dos tenants en integración.
- **ArchUnit:** regla que exige que los controladores (o métodos públicos de servicios) tengan una anotación de autorización o estén en una lista explícita de públicos.
