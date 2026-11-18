# Checklist de auditoría: flujos críticos

Aplícalo a cada flujo crítico (login, alta, pago, guardado de los datos principales). Severidad orientativa; ajústala con [severity.md](../../../standards/severity.md). Cada hallazgo cita la etapa y la evidencia en ambas capas cuando aplique.

## Entrada y envío (cliente)

- [ ] El formulario valida en el cliente para dar feedback, sin sustituir la validación del servidor. *(HIGH si el servidor no valida → `backend:http-layer`)*
- [ ] El envío no se puede duplicar (botón deshabilitado o petición en vuelo ignorada). *(MEDIUM; HIGH en pagos o pedidos sin idempotencia en el servidor)*
- [ ] Fechas, importes e IDs se envían con las convenciones del contrato. *(HIGH si altera datos de negocio)*

## Servidor

- [ ] La validación del servidor rechaza lo inválido con errores por campo. *(HIGH)*
- [ ] Los valores sensibles (precios, totales, roles, propietario) se calculan o comprueban en el servidor. *(CRITICAL si se acepta el valor del cliente)*
- [ ] Todas las ramas del controlador responden; los errores pasan por el error handler. *(HIGH)*
- [ ] Las escrituras de varios pasos son atómicas (transacción) y las operaciones con efectos son idempotentes. *(HIGH; CRITICAL con impacto económico)*
- [ ] Constraints de la base de datos respaldan las reglas críticas (unicidad, claves foráneas, no nulos). *(MEDIUM–HIGH)*

## Respuesta y estado (cliente)

- [ ] El cliente distingue éxito, error de validación, permisos, conflicto y fallo del servidor, y muestra un mensaje accionable. *(HIGH)*
- [ ] Tras guardar, la UI refleja el estado real (caché actualizada o invalidada). *(MEDIUM; HIGH si provoca acciones sobre datos obsoletos)*
- [ ] Respuestas obsoletas no pisan a las nuevas (cancelación o descarte). *(MEDIUM)*
- [ ] Ningún `catch` vacío o que solo hace `console.log` en el flujo. *(MEDIUM; HIGH si oculta un fallo de guardado)*

## Diagnosticabilidad

- [ ] Existe un ID de correlación del cliente a los logs del servidor. *(MEDIUM)*
- [ ] Los errores del flujo quedan registrados con contexto suficiente y sin datos sensibles. *(MEDIUM)*
- [ ] Hay un test E2E o de integración que cubre el camino feliz y al menos un error del flujo. *(MEDIUM; HIGH en el flujo de pago o de login sin ningún test)*

## Entornos

- [ ] Cookies, CORS, proxy y zonas horarias están configurados igual (o de forma explícitamente distinta) entre local, staging y producción. *(HIGH si el flujo falla solo en producción)*
- [ ] Las variables de entorno del flujo se validan al arrancar. *(MEDIUM)*
