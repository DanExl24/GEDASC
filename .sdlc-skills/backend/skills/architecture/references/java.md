# Arquitectura — notas Java / Spring

## Paquetes por feature

```text
com.miapp
├── orders            ← módulo: su paquete raíz es la API pública
│   ├── OrderService.java              (public)
│   ├── OrderPlaced.java               (evento public)
│   └── internal/                      (repositorios, entidades, adaptadores: package-private o en subpaquete interno)
├── billing
└── inventory
```

- Organiza por feature, no por capa (`controller/`, `service/`, `repository/` globales).
- Usa la **visibilidad de paquete** de Java: clases internas `package-private`, solo lo necesario `public`.

## Spring Modulith

- Considera cada paquete directo bajo el paquete de la aplicación como un módulo; `ApplicationModules.of(App.class).verify()` en un test falla ante ciclos o accesos a tipos internos de otros módulos.
- Eventos entre módulos con `ApplicationEventPublisher` y `@ApplicationModuleListener` (asíncrono, transaccional); el **registro de publicación de eventos** persiste los eventos y reintenta los no procesados (comportamiento tipo outbox dentro del monolito).
- Genera documentación de módulos (diagramas C4/PlantUML) desde el código.

## ArchUnit

```java
@ArchTest
static final ArchRule domainIsPure = noClasses().that().resideInAPackage("..domain..")
    .should().dependOnClassesThat().resideInAnyPackage("org.springframework.web..", "..infrastructure..");

@ArchTest
static final ArchRule noCycles = slices().matching("com.miapp.(*)..").should().beFreeOfCycles();
```

## Inyección

- Inyección por constructor (sin `@Autowired` en campos); con un solo constructor, Spring lo usa automáticamente.
- Puertos como interfaces en el módulo y adaptadores como `@Component` en `internal`/`infrastructure`; en tests, beans de prueba o `@MockitoBean` (versiones recientes; antes `@MockBean`) solo para dependencias externas.
- `jMolecules` permite anotar conceptos (`@AggregateRoot`, `@ValueObject`, capas) y verificarlos con ArchUnit.
