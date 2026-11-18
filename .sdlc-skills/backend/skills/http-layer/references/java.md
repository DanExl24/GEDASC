# Capa HTTP — notas Java / Spring Boot

## Validación y DTOs

```java
public record CreateOrderRequest(
    @NotNull UUID customerId,
    @NotEmpty @Size(max = 100) List<@Valid OrderItemRequest> items,
    @Size(max = 500) String note
) {}

@PostMapping("/orders")
public ResponseEntity<OrderResponse> create(@Valid @RequestBody CreateOrderRequest body, @AuthenticationPrincipal AppUser user) {
    Order order = createOrder.execute(body, user.id());
    return ResponseEntity.created(URI.create("/orders/" + order.getId())).body(OrderResponse.from(order));
}
```

- **Records como DTOs** de entrada y salida; nunca `@RequestBody` de una entidad JPA (mass assignment) ni devolver entidades (fugas, carga perezosa disparada al serializar, `LazyInitializationException`).
- Jackson en Spring Boot **ignora** propiedades desconocidas por defecto (`FAIL_ON_UNKNOWN_PROPERTIES=false`): con DTOs dedicados es seguro; si se quiere rechazar, actívalo explícitamente.
- `@Validated` en el controlador para validar `@PathVariable`/`@RequestParam` (`@Min`, `@Max`, `@Pattern`).
- Paginación: `spring.data.web.pageable.max-page-size` para limitar `Pageable`.

## Errores

```java
@RestControllerAdvice
class ApiExceptionHandler extends ResponseEntityExceptionHandler {
  @ExceptionHandler(NotFoundException.class)
  ProblemDetail notFound(NotFoundException ex) {
    ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
    pd.setType(URI.create("https://api.miapp.com/errors/not-found"));
    return pd;
  }
}
```

- `ProblemDetail` (RFC 9457) nativo desde Spring 6; `spring.mvc.problemdetails.enabled=true` para los errores del framework.
- `server.error.include-stacktrace=never`, `include-message=never` en producción.
- Mapea `DataIntegrityViolationException` (unicidad) a 409 de forma centralizada.

## Robustez

- `server.shutdown=graceful` y `spring.lifecycle.timeout-per-shutdown-phase=25s`.
- Tamaños: `spring.servlet.multipart.max-file-size`, `server.tomcat.max-swallow-size`, `max-http-form-post-size`.
- Timeouts: `server.tomcat.connection-timeout`, y timeouts propios en clientes HTTP y en la base de datos.
- CORS con `CorsConfigurationSource` y orígenes explícitos (no `allowedOriginPatterns("*")` con credenciales).
- Controladores delgados que llaman a servicios de aplicación; `@Transactional` en el servicio, no en el controlador (→ `data-access`).
