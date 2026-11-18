# Lógica de dominio — notas Java / Spring

- **Dinero:** `BigDecimal` construido desde `String` (`new BigDecimal("19.99")`, nunca desde `double`), con `setScale` y `RoundingMode` explícitos; compara con `compareTo`, no `equals` (que tiene en cuenta la escala). JSR 354 (`javax.money`, Moneta) si se necesita moneda y conversión.
- **Value objects:** `record` con validación en el constructor compacto:
  ```java
  public record Email(String value) {
    public Email { if (value == null || !value.contains("@")) throw new InvalidEmailException(value); }
  }
  ```
- **Estados:** `enum` con la tabla de transiciones (`Set<OrderStatus> allowedNext()`); Spring State Machine solo para flujos realmente complejos.
- **Entidades JPA y dominio:** usar las entidades JPA como modelo de dominio es aceptable si concentran el comportamiento (métodos con intención, sin setters públicos para el estado, constructor protegido para JPA). Separar modelo de dominio y entidades de persistencia solo cuando la complejidad lo justifique.
- **Servicios de aplicación:** `@Service` con `@Transactional` en el método del caso de uso (límite de transacción); los controladores no llevan `@Transactional`.
- **Eventos:** `ApplicationEventPublisher` + `@TransactionalEventListener(phase = AFTER_COMMIT)` para efectos tras el commit; o `AbstractAggregateRoot` con `registerEvent` en Spring Data.
- **Reloj:** inyecta `java.time.Clock` y usa `Instant.now(clock)`; en tests, `Clock.fixed(...)`.
- **Errores:** excepciones de dominio propias (no `ResponseStatusException` en el dominio), mapeadas en `@RestControllerAdvice`.
- **Arquitectura verificable:** ArchUnit para comprobar que el dominio no depende de `org.springframework.web`.
