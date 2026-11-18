---
name: data-access
description: "Construye y audita el acceso a datos desde el código del backend (Prisma, TypeORM, Drizzle, SQLAlchemy, Django ORM, JPA/Hibernate, SQL directo): repositorios, consultas N+1, selección de columnas, transacciones y niveles de aislamiento, concurrencia (lost updates, bloqueo optimista y pesimista, actualizaciones atómicas, condiciones de carrera), pool de conexiones, timeouts, paginación y operaciones masivas. Úsala al escribir consultas o transacciones, o ante endpoints lentos, duplicados, saldos o stock incorrectos y pools agotados. No para diseño de esquema, índices y migraciones (schema-and-migrations)."
---

# Acceso a datos

El acceso a datos es donde un backend correcto en local se rompe en producción: **con más datos (N+1, consultas sin límite), con más usuarios a la vez (condiciones de carrera) y con dependencias lentas (pool agotado)**. Esta skill cubre cómo el código habla con la base de datos; el esquema y los índices están en `schema-and-migrations`.

## Cuándo usarla

- Escribir repositorios, consultas o transacciones.
- Endpoints que se vuelven lentos al crecer los datos; cientos de consultas por petición.
- Datos incorrectos bajo concurrencia: stock negativo, doble reserva, saldo que se gasta dos veces, actualizaciones que se pierden.
- Errores de pool agotado, timeouts de conexión, transacciones bloqueadas.

**No es para:** modelado, constraints, índices y migraciones → `schema-and-migrations` · reglas de negocio → `domain-logic` · inyección SQL como vulnerabilidad → `api-security` (aquí se usan siempre consultas parametrizadas) · caché → `caching`.

## Paso 0: contexto (ambos modos)

1. Detecta base de datos y versión, ORM o query builder, driver y configuración del pool. Carga [node.md](references/node.md), [python.md](references/python.md) o [java.md](references/java.md).
2. Si es posible, activa el log de consultas (o usa la herramienta del ORM) y observa cuántas consultas hace un endpoint típico.
3. Identifica operaciones con riesgo de concurrencia: todo lo que lee un valor y luego lo modifica (stock, saldo, plazas, contadores, estados).

## Modo Construir

1. **Repositorio o capa de datos** por agregado/feature; el resto del código no construye consultas.
2. **Carga eficiente:** relaciones necesarias cargadas en la misma consulta o en lote; solo las columnas necesarias; siempre con límite. Ver [patterns.md § N+1](references/patterns.md#n1).
3. **Transacciones** alrededor del caso de uso completo; sin llamadas de red externas dentro. Ver [patterns.md § Transacciones](references/patterns.md#transacciones).
4. **Concurrencia:** para cada "leer-modificar-escribir", elige actualización atómica, bloqueo optimista o pesimista, y respáldalo con constraints. Ver [patterns.md § Concurrencia](references/patterns.md#concurrencia).
5. **Pool y timeouts:** tamaño acorde a los workers y a los límites de la base de datos; timeout de adquisición y de sentencia.
6. **Paginación por cursor** en listados grandes; **lotes** en operaciones masivas.
7. Entrega según [output-formats.md § Construir](../../standards/output-formats.md#modo-construir), con un test de concurrencia en las operaciones críticas cuando sea posible.

## Modo Auditar

1. Para los endpoints principales: número de consultas, columnas traídas, filas máximas.
2. Para cada operación de escritura de varios pasos: ¿transacción?, ¿qué pasa con dos peticiones simultáneas?
3. Revisa la configuración del pool, timeouts y transacciones largas.
4. Recorre [checklist.md](references/checklist.md).
5. Clasifica con [severity.md](../../standards/severity.md) y entrega según [output-formats.md § Auditar](../../standards/output-formats.md#modo-auditar) con código `BE-DATA`. Describe la secuencia de las condiciones de carrera.

## Principios

1. **Ninguna consulta en un bucle** sobre resultados de otra consulta.
2. **Ninguna consulta sin límite** sobre tablas que crecen.
3. **Lo que se modifica en varios pasos, se modifica en una transacción.**
4. **Leer-modificar-escribir es una condición de carrera** hasta que se demuestre lo contrario.
5. **La base de datos es la última defensa:** constraints únicos y checks impiden lo que el código no evitó.
6. **Las transacciones son cortas:** sin llamadas HTTP, colas ni esperas del usuario dentro.
7. **Siempre parametrizado:** nunca SQL construido concatenando valores.

## Referencias

| Archivo | Cuándo cargarlo |
| :--- | :--- |
| [patterns.md](references/patterns.md) | Modo Construir; en Auditar para escribir las correcciones. |
| [checklist.md](references/checklist.md) | Modo Auditar. |
| [node.md](references/node.md) · [python.md](references/python.md) · [java.md](references/java.md) | Según el stack. |

## Skills relacionadas

- `schema-and-migrations`: índices que necesitan las consultas, constraints que respaldan la concurrencia.
- `domain-logic`: el caso de uso define el límite de la transacción.
- `http-layer`: topes de paginación en la entrada.
- `authorization`: consultas acotadas por tenant y propietario, row-level security.
- `api-security`: inyección en consultas dinámicas y límites de recursos.
- `caching`: cuando la consulta ya es razonable y sigue haciendo falta.
- `integrations`: por qué no llamar a terceros dentro de una transacción.
- `performance`: localizar las consultas que más pesan con trazas y métricas.
- `testing`: tests de concurrencia con la base de datos real.
