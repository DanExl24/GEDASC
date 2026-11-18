# Checklist de auditoría: contratos

Severidad orientativa; ajústala con [severity.md](../../../standards/severity.md). Cada hallazgo cita **servidor y cliente**.

## Tabla de cruce

- [ ] Existe la tabla de cruce para todos los endpoints consumidos en el alcance (o los del flujo crítico, declarándolo).
- [ ] Cada consumidor llama a un endpoint que existe con el método correcto. *(HIGH si un flujo principal llama a una ruta inexistente)*
- [ ] El servidor no envía campos sensibles o internos que el cliente no necesita. *(HIGH–CRITICAL según el dato → `backend:http-layer`)*

## 1. Nombres y casing

- [ ] Un solo casing en el cable, convertido en la serialización del servidor. *(MEDIUM si es mixto)*
- [ ] Ningún campo que el cliente lee falta o se llama distinto en la respuesta. *(HIGH si deja vacío un dato de un flujo principal)*

## 2. Envelope

- [ ] Formato de respuesta único (recurso directo o envelope único) en toda la API. *(MEDIUM)*
- [ ] Las colecciones tienen la misma forma de paginación y el cliente la usa (no pide "todo"). *(MEDIUM; HIGH si la lista se trunca sin avisar)*

## 3. Tipos y coerción

- [ ] IDs de 64 bits viajan como string. *(HIGH si se usan para buscar o editar registros)*
- [ ] Dinero en unidades mínimas o decimal en string con moneda; el cliente no suma ni redondea `float`. *(HIGH)*
- [ ] Instantes en ISO 8601 con zona; fechas de calendario como `YYYY-MM-DD` sin `new Date()` en el cliente. *(HIGH si desplaza días en datos de negocio)*
- [ ] Query strings y formularios: el servidor convierte y valida los tipos (booleanos, números) explícitamente. *(MEDIUM)*
- [ ] El cliente tolera valores de enum desconocidos. *(MEDIUM)*

## 4. Errores y códigos de estado

- [ ] Formato de error único (RFC 9457 o equivalente) con `code` estable. *(MEDIUM)*
- [ ] Ningún error se devuelve con `200`; validación con `400/422`, conflicto con `409`, sin permiso con `403`, inexistente con `404`. *(MEDIUM; HIGH si el cliente trata un fallo como éxito)*
- [ ] El cliente mapea los errores por campo al formulario y distingue validación, permisos, conflicto y fallo del servidor. *(HIGH en formularios de flujos principales)*
- [ ] Todo endpoint responde en todas las ramas (sin `catch` que no envía respuesta y deja la petición colgada). *(HIGH)*

## 5. Sesión, cabeceras y CORS

- [ ] Estrategia de sesión coherente entre capas (tabla de [patterns.md § Sesión](patterns.md#sesión-y-cabeceras)). *(HIGH si es incoherente; CRITICAL si permite secuestro de sesión)*
- [ ] Cookies con `HttpOnly`, `Secure` y `SameSite` adecuados; el cliente envía credenciales. *(HIGH)*
- [ ] CORS con orígenes explícitos; nunca reflejar cualquier `Origin` con credenciales. *(HIGH)*
- [ ] Un único refresh en vuelo; la petición original se reintenta una vez. *(MEDIUM)*

## Lógica entre capas

- [ ] Precios, totales, descuentos, permisos y estados se calculan o validan en el servidor; lo que envía el cliente se recalcula. *(CRITICAL si el servidor acepta el valor del cliente con impacto económico o de acceso)*
- [ ] La UI no oculta acciones como única protección: el endpoint autoriza. *(CRITICAL → `backend:authorization`)*

## Fuente de verdad y verificación

- [ ] Existe una fuente única (OpenAPI, esquemas compartidos o RPC tipado). *(MEDIUM si hay tipos duplicados a mano que ya divergen; INFO si aún coinciden)*
- [ ] Los tipos generados se comprueban en CI. *(MEDIUM)*
- [ ] Hay tests de contrato en el servidor o mocks del cliente derivados del contrato. *(MEDIUM)*
- [ ] Los cambios incompatibles siguen el orden ampliar → migrar cliente → retirar. *(HIGH si hay clientes en circulación y se rompe el contrato)*
