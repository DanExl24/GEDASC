# Checklist de auditoría — arquitectura del servicio

Severidad orientativa entre corchetes ([severity.md](../../../standards/severity.md)).

## 1. Forma

- [ ] La forma (monolito, modular, microservicios, serverless) está justificada por el equipo y los requisitos, no por moda. **[INFO–MEDIUM]**
- [ ] Si hay varios servicios: cada uno tiene su base de datos y se despliega de forma independiente. **[HIGH]** si comparten base de datos o se despliegan siempre juntos.
- [ ] Sin cadenas largas de llamadas síncronas entre servicios en peticiones de usuario. **[MEDIUM–HIGH]**

## 2. Módulos

- [ ] El código se organiza en módulos por contexto de negocio. **[MEDIUM]** en servicios medianos o grandes organizados por tipo técnico.
- [ ] Cada módulo expone una API pública y los demás solo usan esa API. **[MEDIUM]**
- [ ] Cada tabla tiene un módulo propietario; ningún módulo escribe tablas ajenas. **[HIGH]** si varios módulos escriben la misma tabla con reglas distintas.
- [ ] Sin ciclos de dependencia entre módulos. **[MEDIUM]**
- [ ] `shared`/`common` contiene solo un núcleo mínimo (tipos, errores base, utilidades puras), sin lógica de negocio. **[MEDIUM]**

## 3. Capas

- [ ] La capa de transporte no contiene reglas de negocio ni SQL. **[MEDIUM]** (→ `http-layer`, `domain-logic`).
- [ ] El dominio no importa el framework web, el cliente del ORM concreto ni SDKs de proveedores. **[MEDIUM]**
- [ ] Las dependencias externas (pagos, email, almacenamiento, colas, terceros) están detrás de adaptadores. **[MEDIUM]**; **[HIGH]** si un cambio de proveedor obliga a tocar la lógica de negocio en muchos sitios.
- [ ] Sin abstracciones vacías (interfaces con una implementación que nunca se sustituye ni se simula). **[LOW]**

## 4. Dependencias e inicialización

- [ ] Dependencias inyectadas (constructor/parámetros), no instanciadas dentro de la lógica. **[MEDIUM]**
- [ ] Un composition root claro (o el contenedor del framework) conecta las piezas. **[LOW–MEDIUM]**
- [ ] Clientes y pools son singletons; el contexto de petición no se guarda en singletons. **[HIGH]** si un singleton guarda datos de usuario entre peticiones.
- [ ] La configuración se carga y valida en un único módulo (→ `tooling`). **[LOW–MEDIUM]**

## 5. Gobernanza

- [ ] Las reglas de dependencia (capas, módulos, ciclos) se verifican con una herramienta en CI. **[LOW–MEDIUM]**
- [ ] Las decisiones de arquitectura no obvias están documentadas (ADR). **[INFO]**
- [ ] Hay un plan incremental para la deuda estructural importante (no una reescritura). **[INFO–LOW]**

## Cómo inspeccionar rápido

- Grafo de dependencias: `npx depcruise src --output-type dot`, `npx madge --circular src`, `lint-imports`, `pydeps`, tests de ArchUnit o `ApplicationModules.of(App.class).verify()` (Spring Modulith).
- Acceso a tablas ajenas: buscar, en cada módulo, referencias a modelos/entidades/repositorios definidos en otro módulo.
- Infraestructura en el dominio: imports de `express`, `fastapi`, `django.http`, `org.springframework.web`, SDKs (`stripe`, `boto3`, `aws-sdk`) dentro de `domain/`.
- Instanciación directa: `new PrismaClient()`, `new Stripe(`, `boto3.client(`, `new RestTemplate()` dentro de servicios o casos de uso.
- Base de datos compartida entre servicios: mismas credenciales/esquema en la configuración de varios servicios.
