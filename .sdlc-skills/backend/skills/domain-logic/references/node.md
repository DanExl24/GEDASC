# Lógica de dominio — notas Node.js / TypeScript

- **Dinero:** `decimal.js`, `big.js` o `dinero.js` (que trabaja en unidades mínimas con moneda). Nunca `number` para importes; serializa como string.
- **Tipos de dominio:** uniones literales para estados (`type OrderStatus = 'pending' | 'paid' | …`) y branded types para IDs (`type OrderId = string & { __brand: 'OrderId' }`).
- **Prisma / TypeORM / Drizzle** no imponen un modelo de dominio: con Prisma, los tipos generados son estructuras de datos; mantén las reglas en clases o módulos de dominio y mapea en el repositorio, o concentra las reglas en servicios por agregado. Evita que los tipos de Prisma se filtren a toda la aplicación como si fueran el modelo.
- **NestJS:** los casos de uso como providers (`@Injectable()`) dentro del módulo de la feature; el dominio puede ser TypeScript puro sin decoradores de Nest, inyectado mediante el contenedor.
- **Errores:** clases que extienden `Error` con `code`; en NestJS, mapéalas en un `ExceptionFilter` en lugar de lanzar `HttpException` desde el dominio.
- **Reloj:** interfaz `Clock` inyectada; en tests, un reloj fijo (o `vi.setSystemTime` como último recurso).
- **Máquinas de estado complejas:** XState es útil cuando hay estados anidados, temporizadores o guardas numerosas; para tablas simples, un objeto de transiciones basta.
