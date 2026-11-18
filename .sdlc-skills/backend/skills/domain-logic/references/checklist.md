# Checklist de auditoría — lógica de dominio

Severidad orientativa entre corchetes ([severity.md](../../../standards/severity.md)).

## 1. Ubicación de las reglas

- [ ] Los controladores se limitan a recibir, invocar el caso de uso y responder. **[MEDIUM]**
- [ ] Cada operación de negocio importante tiene un caso de uso o servicio identificable. **[MEDIUM]**
- [ ] No hay reglas duplicadas (o contradictorias) entre endpoints, jobs y scripts. **[MEDIUM]**; **[HIGH]** si divergen en operaciones con dinero o stock.
- [ ] Sin reglas de negocio complejas escondidas en hooks del ORM o triggers sin justificar. **[LOW–MEDIUM]**

## 2. Invariantes y estados

- [ ] Las entidades no se pueden crear ni modificar en estados inválidos (validación en fábricas/métodos). **[MEDIUM]**; **[HIGH]** si ya hay datos inválidos en producción.
- [ ] Las transiciones de estado se controlan en un solo sitio y rechazan las ilegales. **[HIGH]** si se puede, por ejemplo, enviar un pedido cancelado o reembolsar dos veces.
- [ ] Las invariantes críticas tienen respaldo en la base de datos (constraints, actualizaciones condicionales). **[MEDIUM]** (→ `schema-and-migrations`, `data-access`).
- [ ] Precios, totales, descuentos, permisos y disponibilidad se calculan en el servidor, nunca se aceptan del cliente. **[CRITICAL]**

## 3. Valores

- [ ] Dinero con tipo decimal exacto (o enteros en unidad mínima) y moneda explícita; nunca `float`/`double`. **[HIGH]** en cálculos de importes.
- [ ] Redondeo explícito y centralizado. **[MEDIUM]**
- [ ] Conceptos con reglas modelados como value objects o con validación centralizada. **[LOW–MEDIUM]**
- [ ] Fechas y horas con zona explícita (UTC en almacenamiento); fechas de calendario sin hora tratadas como tales. **[MEDIUM]**

## 4. Acoplamiento

- [ ] Los servicios de dominio no reciben `req`/`res` ni dependen del framework web. **[MEDIUM]**
- [ ] Dependencias (repositorios, clientes externos, reloj) inyectadas, no instanciadas dentro de la lógica. **[MEDIUM]**
- [ ] La lógica es invocable desde un worker o una CLI sin levantar el servidor HTTP. **[LOW–MEDIUM]**

## 5. Errores y efectos

- [ ] Errores de dominio tipados, mapeados a HTTP en la capa HTTP. **[LOW–MEDIUM]**
- [ ] Emails, notificaciones, eventos y llamadas externas se ejecutan tras el commit (o vía outbox). **[HIGH]** si pueden enviarse efectos de operaciones que luego fallan.
- [ ] Operaciones de varios pasos dentro de una transacción (→ `data-access`). **[HIGH]**

## 6. Mantenibilidad

- [ ] Funciones de reglas de negocio con tamaño y complejidad manejables (orientativo: < ~50 líneas, complejidad ciclomática < 10). **[LOW]**
- [ ] Las reglas importantes tienen tests unitarios sin base de datos. **[MEDIUM]** (→ `testing`).
- [ ] El modelo es proporcional al dominio (ni anémico en un dominio complejo, ni sobre-diseñado en un CRUD). **[INFO–LOW]**

## Cómo inspeccionar rápido

- Controladores largos: ordenar archivos de controladores/vistas/routers por número de líneas.
- Asignaciones de estado dispersas: buscar `.status =`, `status:` en updates, `setStatus(` fuera del modelo.
- Dinero en float: `parseFloat(` con importes, `Number(price`, `float`/`double` en campos `price`/`amount`/`total`, `toFixed` usado para cálculos.
- Valores del cliente: `req.body.price`, `body.total`, `payload.discount` usados en persistencia.
- Efectos en transacción: llamadas a `sendEmail`, `publish`, `axios`/`fetch`/`requests` dentro de bloques `transaction`/`atomic`/`@Transactional`.
- Acoplamiento: servicios con parámetros `req`, `request`, `HttpServletRequest`.
