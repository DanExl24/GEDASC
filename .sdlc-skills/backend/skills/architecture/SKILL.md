---
name: architecture
description: "Diseña y audita la arquitectura de un servicio backend: monolito modular frente a microservicios, módulos por contexto de negocio con API pública y propiedad de sus tablas, capas dentro del módulo (transporte, aplicación, dominio, infraestructura), hexagonal pragmática con puertos para dependencias externas, inyección de dependencias y composition root, reglas de dependencia verificadas con herramientas, extracción gradual (strangler fig) y ADRs. Úsala al arrancar un servicio, reorganizar código enredado o decidir si partir en servicios. No para reglas de negocio concretas (domain-logic) ni para el contrato HTTP (api-design)."
---

# Arquitectura del servicio

La arquitectura de un backend decide **cuánto cuesta el próximo cambio**. La meta no es aplicar un patrón de libro, sino que cada módulo de negocio se pueda entender, probar y cambiar sin romper los demás, y que la complejidad del diseño sea proporcional a la del problema.

## Cuándo usarla

- Arrancar un servicio o un módulo grande.
- Código enredado: controladores que importan repositorios de otros módulos, tablas que escribe medio sistema, dependencias circulares.
- Decidir entre monolito, monolito modular, microservicios o funciones serverless.
- Extraer un módulo a un servicio propio, o volver a unir servicios demasiado acoplados.
- Documentar decisiones de arquitectura.

**No es para:** las reglas de negocio dentro del módulo → `domain-logic` · el contrato de la API → `api-design` · comunicación asíncrona en detalle (colas, outbox, sagas) → `async-messaging` · estructura de un monorepo frontend + backend → `fullstack:topology`.

## Paso 0: contexto (ambos modos)

1. Detecta lenguaje, framework y forma de despliegue (un proceso, varios servicios, funciones). Carga [node.md](references/node.md), [python.md](references/python.md) o [java.md](references/java.md).
2. Mapea los módulos o carpetas actuales, quién importa a quién y qué tablas toca cada parte.
3. Pregunta por el contexto que decide la arquitectura: tamaño del equipo, número de equipos, requisitos de escalado o despliegue independiente, criticidad.

## Modo Construir

1. **Elige la forma** con la [tabla de decisión](references/patterns.md#elegir-la-forma): monolito modular por defecto.
2. **Módulos por contexto de negocio** (pedidos, facturación, inventario), no por tipo técnico. Cada módulo es dueño de sus tablas y expone una API pública.
3. **Capas dentro del módulo** con dependencias hacia dentro: transporte → aplicación → dominio; la infraestructura implementa los puertos. Ver [patterns.md § Capas](references/patterns.md#capas-dentro-de-un-módulo).
4. **Puertos solo donde aportan:** proveedores externos (pagos, email, almacenamiento, colas). No una interfaz por cada repositorio "por si acaso".
5. **Composition root:** las dependencias se crean y conectan en un único sitio (o el contenedor del framework); el resto del código las recibe.
6. **Reglas de dependencia verificadas** con una herramienta en CI.
7. **Documenta con ADRs** las decisiones no obvias. Entrega según [output-formats.md § Construir](../../standards/output-formats.md#modo-construir).

## Modo Auditar

1. Construye el grafo de dependencias entre módulos y la matriz módulo × tablas.
2. Busca: ciclos, módulos que acceden a tablas ajenas, lógica de negocio en la capa de transporte, infraestructura importada desde el dominio, "servicios" compartidos que lo saben todo.
3. Si hay varios servicios, busca síntomas de monolito distribuido (base de datos compartida, despliegues en cadena, llamadas síncronas en cascada).
4. Recorre [checklist.md](references/checklist.md).
5. Clasifica con [severity.md](../../standards/severity.md) y entrega según [output-formats.md § Auditar](../../standards/output-formats.md#modo-auditar) con código `BE-ARCH`, con el árbol objetivo y el plan de migración por pasos si propones reestructurar.

## Principios

1. **Monolito modular hasta que haya una razón concreta para partir.** Los microservicios resuelven problemas de organización y escalado, y crean problemas de consistencia y operación.
2. **Módulos por negocio, con fronteras explícitas:** API pública, tablas propias, sin atajos a los internos de otro módulo.
3. **Las dependencias apuntan hacia el dominio;** el dominio no conoce HTTP, el ORM concreto ni los proveedores.
4. **Abstrae lo que cambia o lo que hay que simular en tests,** no todo.
5. **Las reglas de dependencia se comprueban con herramientas,** no con disciplina.
6. **Se evoluciona por pasos** (strangler fig), nunca con una reescritura de golpe.
7. **Las decisiones se documentan** con su contexto y sus alternativas.

## Referencias

| Archivo | Cuándo cargarlo |
| :--- | :--- |
| [patterns.md](references/patterns.md) | Modo Construir; en Auditar para proponer la estructura objetivo. |
| [checklist.md](references/checklist.md) | Modo Auditar. |
| [node.md](references/node.md) · [python.md](references/python.md) · [java.md](references/java.md) | Según el stack. |

## Skills relacionadas

- `domain-logic`: el contenido de las capas de aplicación y dominio.
- `data-access` y `schema-and-migrations`: propiedad de las tablas por módulo.
- `async-messaging`: eventos entre módulos o servicios, outbox y sagas.
- `integrations`: adaptadores para proveedores externos.
- `api-design`: el contrato que expone la capa de transporte.
