---
name: domain-logic
description: "Diseña y audita la lógica de negocio de un backend: casos de uso y servicios de aplicación, entidades con comportamiento, value objects (dinero, fechas, identificadores), invariantes, máquinas de estado, errores de dominio, eventos y efectos secundarios tras el commit, y desacople de HTTP y del framework. Úsala al modelar reglas de negocio o ante controladores obesos, estados inválidos en la base de datos o lógica duplicada. No para consultas y transacciones en detalle (data-access) ni para la capa HTTP (http-layer)."
---

# Lógica de dominio

Las reglas de negocio son lo que hace valioso al sistema y lo más caro de romper. Esta skill las coloca **en un sitio identificable, independiente de HTTP y del framework, y protegidas por invariantes** que hacen imposible guardar un estado inválido. Es DDD táctico pragmático: tanto como la complejidad del dominio pida, no más.

## Cuándo usarla

- Modelar un dominio nuevo o una feature con reglas no triviales (pedidos, pagos, reservas, inventario, contabilidad).
- Controladores o vistas con cientos de líneas de lógica.
- Estados imposibles en la base de datos (pedido "enviado" y "cancelado", saldo negativo).
- Reglas duplicadas en varios endpoints, jobs y scripts.
- Lógica que no se puede reutilizar desde un worker o una CLI porque depende de `req`/`res`.

**No es para:** consultas, transacciones y concurrencia en detalle → `data-access` · validación de forma de la entrada → `http-layer` · estructura de módulos y capas del servicio → `architecture` · mensajería y outbox → `async-messaging`.

## Paso 0: contexto (ambos modos)

1. Detecta lenguaje, framework y ORM. Carga [node.md](references/node.md), [python.md](references/python.md) o [java.md](references/java.md).
2. Identifica las operaciones de negocio importantes del alcance (las que mueven dinero, stock o estados) y dónde vive hoy su lógica.
3. Pregunta por las reglas que no estén claras en el código: el dominio no se inventa.

## Modo Construir

1. **Casos de uso explícitos:** una función o clase por operación de negocio (`PlaceOrder`, `CancelReservation`) que orquesta: cargar → comprobar reglas → modificar → persistir → publicar efectos. Ver [patterns.md § Casos de uso](references/patterns.md#casos-de-uso).
2. **Invariantes en el modelo:** las entidades y value objects no se pueden construir ni modificar en un estado inválido.
3. **Máquinas de estado** para entidades con ciclo de vida: transiciones permitidas en un solo lugar.
4. **Value objects** para conceptos con reglas: dinero (decimal + moneda), email, rangos de fechas, cantidades.
5. **Errores de dominio tipados** que `http-layer` traduce a HTTP.
6. **Dependencias invertidas:** el dominio recibe repositorios, reloj y servicios externos por parámetro/constructor; no importa el framework web ni crea clientes.
7. **Efectos secundarios tras el commit** (emails, eventos, llamadas externas), nunca dentro de la transacción.
8. Entrega según [output-formats.md § Construir](../../standards/output-formats.md#modo-construir), con tests de las reglas (sin base de datos cuando sea posible).

## Modo Auditar

1. Localiza las operaciones de negocio y traza dónde se decide cada regla (controlador, servicio, modelo, base de datos, frontend).
2. Busca reglas duplicadas o contradictorias y estados que el código permite pero el negocio no.
3. Recorre [checklist.md](references/checklist.md).
4. Clasifica con [severity.md](../../standards/severity.md) y entrega según [output-formats.md § Auditar](../../standards/output-formats.md#modo-auditar) con código `BE-DOM`.

## Principios

1. **Cada regla de negocio vive en un solo sitio** identificable.
2. **Los estados inválidos no se pueden representar ni persistir:** invariantes en el modelo y, como última defensa, constraints en la base de datos (→ `schema-and-migrations`).
3. **El dominio no conoce HTTP, el ORM concreto ni el framework.** Se puede ejecutar desde un controlador, un worker, un test o una CLI.
4. **El servidor es la fuente de verdad:** precios, permisos, totales y disponibilidad se calculan aquí, nunca se aceptan del cliente.
5. **Dinero con decimales exactos y moneda;** tiempo con un reloj inyectable.
6. **Los efectos externos ocurren después de confirmar los datos.**
7. **Proporcionalidad:** un CRUD sin reglas no necesita agregados ni eventos; un dominio financiero sí.

## Referencias

| Archivo | Cuándo cargarlo |
| :--- | :--- |
| [patterns.md](references/patterns.md) | Modo Construir; en Auditar para escribir las correcciones. |
| [checklist.md](references/checklist.md) | Modo Auditar. |
| [node.md](references/node.md) · [python.md](references/python.md) · [java.md](references/java.md) | Según el stack. |

## Skills relacionadas

- `data-access`: límites de transacción alrededor del caso de uso, bloqueo optimista, consultas.
- `http-layer`: controladores delgados que invocan casos de uso y traducen errores de dominio.
- `schema-and-migrations`: constraints que respaldan las invariantes.
- `architecture`: módulos, capas y puertos donde vive esta lógica.
- `async-messaging`: eventos de dominio publicados de forma fiable (outbox).
- `testing`: tests unitarios de reglas e invariantes, incluidos casos negativos.
