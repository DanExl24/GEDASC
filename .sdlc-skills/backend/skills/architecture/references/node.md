# Arquitectura — notas Node.js / TypeScript

## NestJS

- Un `@Module` por contexto de negocio; `exports` define su API pública (los providers no exportados son internos).
- `forwardRef()` para resolver dependencias circulares entre módulos es un **síntoma**: revisa la frontera o usa eventos (`@nestjs/event-emitter`, o una cola).
- Puertos con tokens de inyección: `{ provide: PAYMENT_GATEWAY, useClass: StripePaymentGateway }`; en tests, `overrideProvider(PAYMENT_GATEWAY).useValue(fake)`.
- Mantén el dominio en clases TypeScript sin decoradores de Nest cuando sea complejo; los casos de uso pueden ser providers.
- Módulos de plataforma (`ConfigModule`, `DatabaseModule`, `LoggerModule`) globales y pequeños.

## Express / Fastify

- Composition root manual en `main.ts` (o una función `buildApp(deps)`), que crea pools, clientes y casos de uso y registra las rutas de cada módulo (`registerOrdersRoutes(app, { placeOrder, … })`).
- `buildApp(deps)` facilita los tests de integración con dependencias simuladas.
- Fastify: plugins por módulo con `fastify-plugin` y `decorate` para exponer dependencias; el encapsulamiento de plugins ayuda a mantener las fronteras.
- Contenedores opcionales: Awilix, tsyringe, InversifyJS; con TypeScript, la inyección manual suele bastar.

## Verificación

- **dependency-cruiser** (`.dependency-cruiser.cjs`): reglas `forbidden` como "`src/modules/*/domain` no puede depender de `infrastructure` ni de `http`" y "un módulo no importa rutas internas de otro (solo su `index.ts`)", más `no-circular`.
- Monorepo: workspaces + Nx o Turborepo con `@nx/enforce-module-boundaries` por etiquetas.
