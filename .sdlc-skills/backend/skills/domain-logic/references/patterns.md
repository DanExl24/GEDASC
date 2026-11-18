# Patrones de lógica de dominio

Ejemplos en TypeScript; los equivalentes por lenguaje están en las referencias de stack.

## Casos de uso

```ts
// modules/orders/application/place-order.ts
export class PlaceOrder {
  constructor(
    private readonly orders: OrderRepository,
    private readonly products: ProductRepository,
    private readonly tx: TransactionRunner,
    private readonly events: EventPublisher,
    private readonly clock: Clock,
  ) {}

  async execute(input: PlaceOrderInput): Promise<Order> {
    const order = await this.tx.run(async () => {
      const products = await this.products.findByIds(input.items.map((i) => i.productId))
      const order = Order.place({                       // las reglas viven en el modelo
        customerId: input.customerId,
        lines: input.items.map((i) => ({ product: products.get(i.productId), quantity: i.quantity })),
        now: this.clock.now(),
      })
      for (const line of order.lines) {
        await this.products.reserveStock(line.productId, line.quantity)   // atómico (→ data-access)
      }
      await this.orders.save(order)
      return order
    })
    await this.events.publish(order.pullEvents())       // después del commit (o outbox → async-messaging)
    return order
  }
}
```

- Un caso de uso = una operación de negocio con nombre del dominio.
- Recibe datos ya validados en forma (de `http-layer`) y la identidad del actor; comprueba las **reglas de negocio**.
- Define el **límite de la transacción** (→ `data-access`).
- No conoce `req`/`res`, códigos HTTP ni el framework.

## Entidades con invariantes

```ts
export class Order {
  private constructor(
    readonly id: OrderId,
    readonly customerId: CustomerId,
    private _status: OrderStatus,
    private readonly _lines: OrderLine[],
    readonly createdAt: Date,
    private readonly events: DomainEvent[] = [],
  ) {}

  static place(props: { customerId: CustomerId; lines: NewLine[]; now: Date }): Order {
    if (props.lines.length === 0) throw new BusinessRuleError('Un pedido necesita al menos una línea')
    const lines = props.lines.map((l) => {
      if (!l.product) throw new NotFoundError('Producto no encontrado')
      if (!l.product.isActive) throw new BusinessRuleError(`El producto ${l.product.sku} no está a la venta`)
      return OrderLine.create(l.product, l.quantity)    // precio del servidor, no del cliente
    })
    const order = new Order(OrderId.new(), props.customerId, 'pending', lines, props.now)
    order.events.push({ type: 'OrderPlaced', orderId: order.id })
    return order
  }

  get total(): Money {
    return this._lines.reduce((sum, l) => sum.add(l.subtotal), Money.zero(this._lines[0].subtotal.currency))
  }

  cancel(reason: string, now: Date) {
    this.transition('cancelled')
    this.events.push({ type: 'OrderCancelled', orderId: this.id, reason, at: now })
  }

  private transition(to: OrderStatus) {
    if (!canTransition(this._status, to)) {
      throw new BusinessRuleError(`No se puede pasar de ${this._status} a ${to}`)
    }
    this._status = to
  }

  get status() { return this._status }
  pullEvents() { return this.events.splice(0) }
}
```

- Constructor privado + fábricas con nombre: imposible crear un pedido inválido.
- Estado modificado solo mediante métodos con intención (`cancel`, `ship`), no setters.
- **Pragmatismo:** con un ORM de tipo Active Record o entidades del ORM como modelo, aplica el mismo principio con métodos en el modelo o un servicio de dominio que concentre las reglas; lo importante es el sitio único, no la pureza.

## Máquina de estados

```ts
const transitions: Record<OrderStatus, readonly OrderStatus[]> = {
  pending:   ['paid', 'cancelled'],
  paid:      ['shipped', 'refunded'],
  shipped:   ['delivered', 'returned'],
  delivered: ['returned'],
  cancelled: [],
  refunded:  [],
  returned:  ['refunded'],
}
export const canTransition = (from: OrderStatus, to: OrderStatus) => transitions[from].includes(to)
```

- Tabla explícita, revisable por negocio, probada exhaustivamente.
- En la base de datos, un `CHECK` sobre los valores válidos y, si la concurrencia lo exige, actualización condicional (`UPDATE ... SET status='paid' WHERE id=$1 AND status='pending'`) (→ `data-access`).

## Value objects

```ts
export class Money {
  private constructor(readonly amount: Decimal, readonly currency: Currency) {}
  static of(amount: string | Decimal, currency: Currency) {
    const value = new Decimal(amount)
    if (value.decimalPlaces() > minorUnits(currency)) throw new BusinessRuleError('Precisión inválida para la moneda')
    return new Money(value, currency)
  }
  static zero(currency: Currency) { return new Money(new Decimal(0), currency) }
  add(other: Money) { this.assertSame(other); return new Money(this.amount.plus(other.amount), this.currency) }
  multiply(qty: number) { return new Money(this.amount.times(qty), this.currency) }
  private assertSame(o: Money) { if (o.currency !== this.currency) throw new Error('Monedas distintas') }
  toString() { return this.amount.toFixed(minorUnits(this.currency)) }
}
```

- **Nunca `float`/`number` para dinero** (`0.1 + 0.2 !== 0.3`): decimal exacto o enteros en la unidad mínima (céntimos).
- Redondeo explícito y documentado (bancario o half-up según el negocio), en un solo sitio.
- Otros candidatos: `Email`, `Quantity`, `DateRange`, `Percentage`, identificadores tipados.
- Inmutables y comparados por valor.

## Errores de dominio

- Tipados por categoría (no encontrado, conflicto, regla de negocio violada, prohibido), con mensaje y datos útiles.
- `http-layer` los traduce a 404/409/422/403; un worker los registra y decide si reintentar.
- No lances errores genéricos (`throw new Error('error')`) desde reglas de negocio.

## Reloj y aleatoriedad inyectables

```ts
export interface Clock { now(): Date }
export const systemClock: Clock = { now: () => new Date() }
```

Permite probar vencimientos, plazos y horarios sin esperar ni manipular el reloj global. Lo mismo para generadores de IDs o códigos.

## Efectos tras el commit

- Emails, notificaciones, llamadas a APIs externas y publicación de eventos **después** de confirmar la transacción; si se hacen dentro y la transacción falla, el email ya salió; si se hacen dentro y son lentos, retienen la conexión (→ `data-access`).
- Si el efecto no puede perderse, **outbox** (se guarda en la misma transacción y un proceso lo envía) (→ `async-messaging`).

## Dónde no poner lógica de negocio

| Lugar | Por qué no |
| :--- | :--- |
| Controlador | No reutilizable desde jobs/CLI; mezcla HTTP con reglas |
| Frontend | Manipulable por el cliente; el servidor debe recalcular |
| Triggers y procedimientos de la base de datos | Ocultos al código, difíciles de probar y versionar (salvo casos justificados: auditoría, integridad) |
| Callbacks/hooks del ORM (`beforeSave`) con reglas complejas | Efectos ocultos, orden impredecible |
| Utilidades genéricas (`utils/calculate.ts`) | Las reglas pierden su contexto y se duplican |

## Anti-patrones

| Anti-patrón | Consecuencia | Corrección |
| :--- | :--- | :--- |
| Controlador obeso | Reglas no reutilizables ni testeables | Caso de uso |
| `order.status = 'shipped'` desde cualquier sitio | Transiciones ilegales | Métodos con intención + máquina de estados |
| Precio o total aceptado del cliente | Fraude | Recalcular en servidor |
| Dinero en `float` | Errores de céntimos acumulados | Decimal + moneda |
| `new Date()` dentro de reglas | Tests frágiles | Reloj inyectado |
| Email enviado dentro de la transacción | Efectos de operaciones fallidas | Tras el commit / outbox |
| Servicios que reciben `req` | Acoplamiento a HTTP | Parámetros de dominio |
| Misma regla en 3 endpoints y un job | Divergencia | Un caso de uso compartido |
