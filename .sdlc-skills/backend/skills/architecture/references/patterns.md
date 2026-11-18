# Patrones de arquitectura de backend

## Elegir la forma

| Situación | Forma recomendada |
| :--- | :--- |
| Producto nuevo, un equipo, dominio en descubrimiento | **Monolito modular** |
| Varios equipos sobre el mismo producto, dominio estable | Monolito modular con fronteras estrictas; extraer servicios solo donde un equipo necesite desplegar de forma independiente |
| Una parte con necesidades de escalado o tecnología muy distintas (procesamiento de vídeo, ML, ingestión masiva) | Extraer **esa parte** como servicio |
| Tareas puntuales disparadas por eventos (redimensionar imágenes, webhooks) | Funciones serverless junto al servicio principal |
| Muchos equipos autónomos, dominio bien entendido, plataforma madura (CI/CD, observabilidad, mensajería) | Microservicios por contexto de negocio |

Los microservicios exigen, como mínimo: base de datos por servicio, contratos versionados, comunicación asíncrona para lo que no necesita respuesta inmediata, trazas distribuidas, despliegue independiente y un equipo capaz de operarlo. Sin eso se obtiene un **monolito distribuido**: todos los costes de los microservicios y ninguno de sus beneficios.

## Monolito modular

```text
src/
├── modules/
│   ├── orders/
│   │   ├── http/              # controladores, rutas, DTOs de entrada/salida (→ http-layer)
│   │   ├── consumers/         # handlers de eventos y jobs del módulo (→ async-messaging)
│   │   ├── application/       # casos de uso (→ domain-logic)
│   │   ├── domain/            # entidades, value objects, reglas, eventos de dominio
│   │   ├── infrastructure/    # repositorios, adaptadores de proveedores, mapeos ORM
│   │   └── index.ts           # API pública del módulo: casos de uso y tipos que otros pueden usar
│   ├── billing/
│   └── inventory/
├── shared/                    # kernel compartido mínimo: tipos (Money, ids), errores base, utilidades puras
├── platform/                  # infraestructura transversal: config, db, logger, auth, colas, http server
└── main.ts                    # composition root
```

### Reglas entre módulos

- **API pública:** un módulo solo usa lo que otro exporta en su punto de entrada (casos de uso, consultas de lectura, tipos).
- **Propiedad de los datos:** cada tabla pertenece a un módulo; solo ese módulo la lee y escribe. Si otro necesita datos, llama a su API pública o mantiene una proyección propia alimentada por eventos.
- **Sin joins entre tablas de módulos distintos** en el código de un módulo (las vistas de lectura de informes son la excepción consciente, aisladas en su propio módulo de reporting).
- **Comunicación:** llamada síncrona a la API pública cuando se necesita la respuesta; evento de dominio cuando el otro módulo solo debe reaccionar (→ `async-messaging`).
- **Sin ciclos:** si `orders` necesita `billing` y `billing` necesita `orders`, falta un concepto, sobra una dependencia o hay que usar eventos.

## Capas dentro de un módulo

```text
http / consumers / cli   →   application   →   domain
                                  ↓
                          ports (interfaces)
                                  ↑
                           infrastructure  (implementa los puertos)
```

| Capa | Contiene | No contiene |
| :--- | :--- | :--- |
| Transporte (`http`, `consumers`, `cli`) | Traducción del protocolo, validación de forma, autenticación del actor | Reglas de negocio, SQL |
| Aplicación | Casos de uso, límites de transacción, orquestación, autorización por objeto | Detalles de HTTP, SQL concreto |
| Dominio | Entidades, value objects, invariantes, eventos | Framework, ORM concreto, red |
| Infraestructura | Repositorios, clientes de proveedores, mapeos, publicación de eventos | Reglas de negocio |

### Hexagonal pragmática

- **Puertos** para lo que es externo, lento, caro o variable: pasarela de pagos, email/SMS, almacenamiento de archivos, colas, proveedores de identidad, APIs de terceros, reloj.
- **Repositorios:** una interfaz por agregado si el dominio es rico o se quiere probar sin base de datos; en CRUD simples, usar el ORM desde la capa de aplicación es aceptable.
- **No** crear interfaces con una sola implementación que nunca se va a sustituir ni simular: solo añaden indirección.

```ts
// modules/billing/application/ports.ts
export interface PaymentGateway {
  charge(input: { customerRef: string; amount: Money; idempotencyKey: string }): Promise<ChargeResult>
  refund(chargeId: string, amount: Money): Promise<RefundResult>
}

// modules/billing/infrastructure/stripe-payment-gateway.ts  → implementa PaymentGateway
// tests → FakePaymentGateway en memoria
```

## Inyección de dependencias

- **Inyección por constructor** (o por parámetros de función); nada de `new Client()` dentro de la lógica ni de service locators globales.
- **Composition root:** un único lugar (el `main`, o el contenedor del framework) crea las instancias y las conecta.
- Contenedores de framework (NestJS, Spring, FastAPI con `Depends`, Django con servicios propios) son válidos; evita que la lógica de dominio dependa de sus decoradores cuando el dominio es complejo.
- Ámbito: singletons para clientes y pools; por petición para contexto del actor y transacciones.

## Verificar las reglas

| Ecosistema | Herramienta |
| :--- | :--- |
| Node/TypeScript | dependency-cruiser, eslint-plugin-boundaries, Nx module boundaries, madge (ciclos) |
| Python | import-linter (contratos de capas e independencia de módulos), pydeps |
| Java | ArchUnit, Spring Modulith (verifica módulos y documenta dependencias), jMolecules |

Ejemplo de contratos a verificar: "el dominio no importa `http` ni `infrastructure`", "ningún módulo importa internos de otro", "sin ciclos entre módulos".

## Extraer un servicio (strangler fig)

1. Aislar primero el módulo **dentro del monolito**: API pública, tablas propias, comunicación por eventos. Si no se puede aislar dentro, tampoco funcionará fuera.
2. Duplicar la escritura o publicar eventos para alimentar la base de datos del nuevo servicio.
3. Redirigir el tráfico de lectura y después el de escritura al servicio (enrutamiento en el gateway o en el propio monolito).
4. Retirar el código y las tablas antiguas.

Cada paso es desplegable y reversible.

## Señales de alarma

- Un servicio `utils`/`common`/`core` que crece sin fin y del que dependen todos los módulos.
- "Servicios de dominio" de miles de líneas que orquestan media aplicación.
- Módulos que se despliegan siempre juntos o que comparten base de datos siendo "microservicios".
- Llamadas síncronas en cadena entre servicios (A → B → C → D) en una petición de usuario: la latencia y la tasa de error se multiplican.
- Lógica de negocio en triggers, en el gateway o en los consumers en lugar de en el módulo.

## Plantilla ADR

```markdown
# ADR-<nnn>: <decisión>
- Estado: propuesta | aceptada | reemplazada por ADR-<nnn>
- Fecha: YYYY-MM-DD

## Contexto
## Decisión
## Alternativas consideradas
## Consecuencias
```

Guarda los ADR en `docs/adr/`; uno por decisión; no se editan, se reemplazan.

## Anti-patrones

| Anti-patrón | Consecuencia | Corrección |
| :--- | :--- | :--- |
| Carpetas por tipo técnico (`controllers/`, `services/`, `models/`) en un servicio grande | Cambios de una feature dispersos por todo el árbol | Módulos por negocio |
| Módulos que leen y escriben tablas de otros | Acoplamiento invisible, migraciones que rompen a terceros | Propiedad de datos + API pública/eventos |
| Microservicios con base de datos compartida | Monolito distribuido | Base de datos por servicio o volver a monolito modular |
| Interfaces para todo | Indirección sin beneficio | Puertos solo para lo externo o variable |
| `new StripeClient()` dentro del caso de uso | Imposible de probar y de cambiar | Inyección por constructor |
| Reglas de capas solo en un documento | Se incumplen en semanas | Verificación en CI |
| Reescritura completa | Meses sin entregar, riesgo enorme | Strangler fig |
