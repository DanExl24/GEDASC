---
name: data-privacy
description: "Diseña y audita el tratamiento de datos personales en el backend: inventario y clasificación (PII, categorías especiales, financieros, credenciales), minimización, datos personales en logs, trazas, cachés y analítica, entornos no productivos sin datos reales, retención y borrado (derecho de supresión en base de datos, búsqueda, almacenamiento, copias y terceros), exportación de datos del usuario, cifrado en tránsito, en reposo y por campo con KMS, seudonimización, tokenización de pagos, logs de auditoría y encargados de tratamiento. Úsala al manejar datos personales, preparar el cumplimiento de RGPD o leyes locales o atender solicitudes de usuarios. No sustituye al asesoramiento legal."
---

# Privacidad y protección de datos

Los datos personales son un pasivo además de un activo: cada copia en un log, una caché, un entorno de pruebas o un proveedor es una superficie más de fuga y una obligación más de borrado. Esta skill aplica **privacidad desde el diseño**: saber qué datos hay y dónde, recoger solo lo necesario, protegerlos, conservarlos solo el tiempo justificado y poder entregarlos o borrarlos cuando el usuario lo pide.

## Cuándo usarla

- Diseñar funcionalidades que recogen o procesan datos personales.
- Preparar el cumplimiento de RGPD, CCPA/CPRA, LGPD (Brasil) o leyes latinoamericanas (Colombia Ley 1581, México LFPDPPP, Argentina Ley 25.326, Chile, Perú…).
- Implementar el borrado de cuentas, la exportación de datos o políticas de retención.
- Cifrar datos sensibles, revisar qué datos llegan a logs, analítica o proveedores.
- Copiar datos de producción a otros entornos (no se debería).

**No es para:** controles de acceso → `authorization` · seguridad de la API en general → `api-security` · consentimiento de cookies y analítica en el navegador → `frontend:observability` · interpretación legal (esta skill da la base técnica; las obligaciones concretas las confirma el equipo legal o el DPO).

## Paso 0: contexto (ambos modos)

1. Detecta dónde se almacenan datos: bases de datos, almacenamiento de objetos, cachés, índices de búsqueda, colas, logs, trazas, herramientas de analítica y de errores, proveedores (email, CRM, pagos, soporte). Carga [node.md](references/node.md), [python.md](references/python.md) o [java.md](references/java.md).
2. Pregunta qué normativas aplican (países de los usuarios y de la empresa), si hay datos de categorías especiales (salud, biometría, menores) y si existe un registro de actividades de tratamiento.
3. Identifica qué funcionalidades existen para borrado y exportación.

## Modo Construir

1. **Inventario y clasificación** de los campos personales del modelo y de sus copias. Ver [patterns.md § Inventario](references/patterns.md#inventario-y-clasificación).
2. **Minimización:** recoger y conservar solo lo necesario para una finalidad; no registrar datos personales en logs ni trazas por defecto.
3. **Protección:** TLS siempre; cifrado en reposo; cifrado por campo con KMS para lo muy sensible; tokenización de pagos con el proveedor (nunca guardar números de tarjeta).
4. **Retención:** plazos por tipo de dato y procesos automáticos de purga o anonimización.
5. **Derechos del usuario:** exportación en formato legible por máquina y borrado que alcanza todas las copias (base de datos, búsqueda, almacenamiento, cachés, terceros) con registro de su ejecución.
6. **Entornos no productivos** con datos sintéticos o anonimizados.
7. **Auditoría** de accesos y cambios a datos sensibles.
8. Entrega según [output-formats.md § Construir](../../standards/output-formats.md#modo-construir), indicando qué decisiones requieren validación legal.

## Modo Auditar

1. Construye el mapa de datos personales: qué campos, dónde se copian (logs, trazas, cachés, búsqueda, colas, proveedores, entornos de prueba).
2. Revisa cifrado, retención, borrado, exportación y auditoría.
3. Recorre [checklist.md](references/checklist.md).
4. Clasifica con [severity.md](../../standards/severity.md) y entrega según [output-formats.md § Auditar](../../standards/output-formats.md#modo-auditar) con código `BE-PRIV`, distinguiendo hallazgos técnicos de puntos a confirmar con legal.

## Principios

1. **Saber qué datos personales hay y dónde está cada copia.**
2. **Lo que no se recoge no se filtra:** minimización por defecto.
3. **Los datos personales no van a logs, trazas, URLs ni entornos de prueba** salvo necesidad justificada y protegida.
4. **Cada dato tiene un plazo de conservación** y un proceso que lo hace cumplir.
5. **Borrar es borrar en todas partes,** incluidos índices, cachés, almacenamiento y terceros; el borrado lógico no es supresión.
6. **Lo más sensible se cifra por campo** con claves gestionadas fuera de la aplicación; los datos de tarjeta no se almacenan.
7. **Los accesos a datos sensibles quedan auditados.**

## Referencias

| Archivo | Cuándo cargarlo |
| :--- | :--- |
| [patterns.md](references/patterns.md) | Siempre en modo Construir; en Auditar para las correcciones. |
| [checklist.md](references/checklist.md) | Modo Auditar. |
| [node.md](references/node.md) · [python.md](references/python.md) · [java.md](references/java.md) | Según el stack. |

## Skills relacionadas

- `observability`: redacción en logs y trazas; separación entre logs operativos y de auditoría.
- `authorization`: quién puede acceder a qué datos; auditoría de accesos privilegiados.
- `schema-and-migrations`: columnas cifradas, retención y borrado en el esquema.
- `async-messaging`: jobs de purga y de exportación; datos mínimos en mensajes.
- `integrations`: datos enviados a proveedores (encargados de tratamiento).
- `caching`: datos personales en cachés y su invalidación al borrar.
