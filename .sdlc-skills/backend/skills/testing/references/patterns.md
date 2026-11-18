# Patrones de testing del backend

## Qué probar en cada nivel

| Nivel | Qué | Dependencias | Velocidad |
| :--- | :--- | :--- | :--- |
| **Unitario** | Reglas de dominio, value objects, máquinas de estado, cálculos, políticas de autorización, mapeos | Ninguna (o fakes en memoria de los puertos) | Milisegundos |
| **Integración** | Repositorios, consultas, transacciones, constraints, migraciones, adaptadores (contra proveedor simulado) | BD real (Testcontainers), Redis/broker reales si se usan | Segundos |
| **API / componente** | El servicio por HTTP en proceso: validación, códigos, errores, autenticación, autorización, serialización, idempotencia | BD real; externos simulados en la frontera HTTP | Segundos |
| **Contrato** | Que la API cumple su especificación o lo que esperan sus consumidores | Especificación OpenAPI o contratos Pact | Segundos |
| **E2E** | Flujos entre varios sistemas desplegados | Entorno completo | Minutos (dominio QA) |

Proporción orientativa: muchos unitarios de reglas, una base sólida de integración y API (donde se detectan la mayoría de bugs reales de backend), pocos E2E.

## Base de datos real

- **Testcontainers** levanta el mismo motor y versión que producción (PostgreSQL 16, MySQL 8…) en el test o una vez por suite.
- Aplica las **migraciones reales** al arrancar (también detecta migraciones rotas).
- **Aislamiento**, de más rápido a más robusto:
  1. Transacción por test revertida al final (rápido; no sirve si el código bajo prueba gestiona sus propias transacciones o si hay varias conexiones).
  2. Truncado de tablas entre tests.
  3. Base de datos o esquema por worker de tests (permite paralelizar).
- **No uses SQLite/H2 en lugar del motor real:** cambian tipos, constraints, bloqueos, funciones y SQL.

## Factorías de datos

```ts
const orderFactory = Factory.define<Order>(({ sequence }) => ({
  id: `o_${sequence}`, tenantId: 't_1', status: 'pending', total: Money.of('100.00', 'EUR'), createdAt: fixedNow,
}))

const order = await orderFactory.create({ status: 'paid' }, { transient: { db } })   // solo lo relevante para el test
```

- Valores por defecto válidos y realistas; cada test sobrescribe lo que le importa.
- Nada de fixtures globales compartidas y mutadas por varios tests.

## Dependencias externas

- **Servidor HTTP simulado** en la frontera (WireMock, nock/MSW, respx): se prueba el adaptador real (timeouts, parseo, errores) contra respuestas grabadas o escritas.
- **Bloquea la red real** en tests (falla si algo intenta salir): evita tests que pasan por casualidad o que cobran de verdad en un sandbox.
- **Fakes en memoria** de los puertos (pasarela de pago, email) para tests unitarios y de casos de uso.
- **No mockees** el ORM, los repositorios propios ni módulos internos en tests de integración: el test dejaría de verificar lo que importa.

## Tiempo, aleatoriedad e IDs

- Reloj inyectado (→ `domain-logic`) o congelado en el test; nunca `sleep` para esperar a que "pase el tiempo".
- Semillas fijas para aleatoriedad; IDs deterministas en factorías cuando ayuden a leer los fallos.

## Casos críticos

### Autorización entre tenants

```ts
it('un usuario de otro tenant recibe 404 al leer una factura ajena', async () => {
  const invoice = await invoiceFactory.create({ tenantId: tenantA.id })
  const res = await api.as(userOfTenantB).get(`/invoices/${invoice.id}`)
  expect(res.status).toBe(404)
})
// y lo mismo para listados, búsquedas, exportaciones y updates (→ authorization)
```

### Idempotencia

Dos peticiones con la misma `Idempotency-Key` y cuerpo → una sola operación y la misma respuesta; con cuerpo distinto → 409 (→ `api-design`). Un mensaje entregado dos veces → un solo efecto (→ `async-messaging`).

### Concurrencia

```ts
it('no vende más stock del disponible con peticiones simultáneas', async () => {
  await productFactory.create({ id: 'p1', stock: 1 })
  const results = await Promise.allSettled(Array.from({ length: 10 }, () => placeOrder({ productId: 'p1', qty: 1 })))
  expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1)
  expect((await products.get('p1')).stock).toBe(0)
})
```

Con la base de datos real y conexiones distintas; demuestra que la actualización atómica o el bloqueo funcionan (→ `data-access`).

### Migraciones

- Aplicar todas las migraciones sobre una base vacía en CI.
- Para migraciones de riesgo, ejecutarlas sobre una copia con datos y volumen representativos (anonimizada).
- Comprobar que el esquema resultante coincide con lo que espera el ORM (p. ej. `ddl-auto=validate`, `makemigrations --check`).

### Webhooks y consumidores

Firma válida, inválida, caducada y duplicada; evento fuera de orden; consumidor que recibe el mismo mensaje dos veces.

### Jobs asíncronos

- Probar el **handler** del job directamente (unitario/integración).
- Probar que el caso de uso **encola** el job (o escribe en el outbox) con los datos correctos.
- Evita depender de un worker real corriendo en segundo plano con esperas.

## Contract testing

- **Proveedor contra especificación:** validar en los tests de API que las respuestas cumplen el OpenAPI (validadores de respuesta), y diff de especificaciones en CI (→ `api-design`).
- **Consumer-driven (Pact):** los consumidores publican sus expectativas y el proveedor las verifica en CI; útil con varios equipos y servicios.

## Estabilidad (tests intermitentes)

| Causa | Solución |
| :--- | :--- |
| Datos compartidos entre tests | Aislamiento por test/worker |
| Orden de resultados no determinista (`SELECT` sin `ORDER BY`) | Ordenar o comparar sin orden |
| Tiempo real, zonas horarias | Reloj controlado, TZ fija en CI |
| Red real | Bloquearla; simular |
| Esperas fijas en procesos asíncronos | Probar handlers directamente; esperar condiciones |
| Puertos o recursos fijos en paralelo | Puertos aleatorios, contenedores por worker |

## Cobertura y mutación

- Cobertura para encontrar zonas sin tests, no como objetivo numérico.
- **Mutation testing** (Stryker, mutmut, PIT) en módulos críticos (dinero, permisos, reglas de estado): si al cambiar `>=` por `>` ningún test falla, ese límite no está protegido.

## Anti-patrones

| Anti-patrón | Consecuencia | Corrección |
| :--- | :--- | :--- |
| Mockear el ORM o los repositorios en tests de integración | No detecta consultas, constraints ni migraciones rotas | BD real |
| SQLite/H2 en lugar del motor de producción | Tests verdes y producción rota | Testcontainers con el mismo motor |
| Tests que dependen del orden | Fallos aleatorios | Aislamiento |
| Red real a proveedores | Lentitud, coste, intermitencia | Servidor simulado + red bloqueada |
| `sleep` para esperar jobs | Lento e intermitente | Probar el handler; esperar condiciones |
| Solo caminos felices | Permisos y errores sin proteger | Casos negativos explícitos |
| Aserciones débiles (`toBeDefined`, `not.toThrow`) | Tests que no detectan regresiones | Aserciones sobre resultado y efectos |
| 100 % de cobertura como meta | Tests sin valor para cumplir el número | Casos críticos + mutación |
