# Patrones de privacidad y protección de datos

## Inventario y clasificación

| Clase | Ejemplos | Tratamiento mínimo |
| :--- | :--- | :--- |
| **Credenciales** | Contraseñas, tokens, claves de API, secretos MFA | Hash o cifrado; nunca en logs (→ `authentication`) |
| **Datos de pago** | Número de tarjeta (PAN), CVV, cuentas bancarias | No almacenar tarjetas: tokens del proveedor (PCI DSS); cuentas bancarias cifradas |
| **Categorías especiales** | Salud, biometría, origen étnico, religión, orientación sexual, datos de menores | Base legal reforzada, cifrado por campo, acceso muy restringido y auditado |
| **Identificadores sensibles** | Documento de identidad, número fiscal, pasaporte | Cifrado por campo, enmascarado al mostrar |
| **Datos personales comunes** | Nombre, email, teléfono, dirección, IP, ubicación, ID de dispositivo | Minimización, control de acceso, fuera de logs |
| **Datos derivados** | Perfiles, puntuaciones, preferencias inferidas | Igual que el dato de origen; transparencia |
| **Anónimos / agregados** | Estadísticas sin posibilidad de reidentificación | Fuera del alcance (si de verdad son anónimos) |

Para cada campo personal: finalidad, base legal (la confirma legal), dónde se guarda, quién accede, a qué terceros se envía y cuánto tiempo se conserva. Ese mapa alimenta el registro de actividades de tratamiento.

## Dónde se copian los datos (mapa de copias)

```text
BD principal ─┬─ réplicas y copias de seguridad
              ├─ índices de búsqueda (Elasticsearch/OpenSearch, Algolia)
              ├─ cachés (Redis)
              ├─ colas y tópicos (payloads de mensajes)
              ├─ almacenamiento de objetos (uploads, exportaciones generadas)
              ├─ data warehouse / analítica
              ├─ logs, trazas, herramientas de errores
              ├─ proveedores: email, CRM, soporte, pagos, IA
              └─ entornos de staging/desarrollo (no debería)
```

Cada copia necesita su protección y su procedimiento de borrado.

## Minimización

- No pidas un dato "por si acaso"; cada campo nuevo con datos personales necesita una finalidad.
- Reduce la precisión cuando basta: año de nacimiento en lugar de fecha, ciudad en lugar de dirección, IP truncada para analítica.
- **Logs y trazas:** identificadores internos (`userId`) en lugar de emails o nombres; redacción en el logger (→ `observability`).
- **URLs:** sin datos personales en rutas ni query strings (quedan en logs de proxies y en `Referer`).
- **Mensajes y eventos:** IDs y datos mínimos (→ `async-messaging`).
- **Proveedores:** envía solo lo que el proveedor necesita para su servicio.

## Entornos no productivos

- **Sin copias de producción** en desarrollo o staging. Si hace falta volumen realista: datos sintéticos, o anonimización irreversible (no solo cambiar nombres: emails, teléfonos, direcciones, textos libres, archivos adjuntos y combinaciones que permiten reidentificar).
- Los seeds y fixtures no contienen datos reales (→ `tooling`).
- Accesos de soporte a producción controlados y auditados.

## Retención

| Dato | Ejemplo de política (a definir con legal) |
| :--- | :--- |
| Cuentas inactivas | Aviso y borrado/anonimización tras N años sin actividad |
| Pedidos y facturas | Conservación según obligaciones fiscales; anonimizar lo no exigido |
| Logs de aplicación | 14–90 días |
| Logs de auditoría | Según requisitos regulatorios (años), en almacenamiento protegido |
| Uploads temporales, exportaciones generadas | Horas o días |
| Copias de seguridad | Rotación con caducidad conocida (el borrado alcanza las copias cuando caducan) |

- Implementa la retención con **jobs programados** (→ `async-messaging`) que borran o anonimizan, con métricas y registro.
- TTL nativos donde existan (Redis, índices con ILM, políticas de ciclo de vida del almacenamiento de objetos).

## Derecho de supresión

```text
Solicitud verificada (identidad del solicitante)
  → marcar la cuenta como "en borrado" (deja de usarse, de enviarse a proveedores y de aparecer)
  → job de borrado:
       BD: borrar o anonimizar filas (mantener lo que obliga la ley, anonimizado o separado)
       índices de búsqueda, cachés
       almacenamiento de objetos (archivos del usuario)
       proveedores (API de borrado del CRM, email, soporte, analítica)
       registrar la ejecución (sin guardar los datos borrados)
  → copias de seguridad: caducan según su rotación (documentado)
  → confirmar al usuario
```

- **Borrado lógico (`deleted_at`) no es supresión:** los datos siguen ahí.
- **Anonimizar** cuando hay registros que deben conservarse (contabilidad): sustituir los datos identificativos por valores no reversibles y romper los vínculos con la persona.
- Dependencias: datos del usuario en tablas de otros módulos (→ `architecture`: cada módulo implementa su parte del borrado ante un evento `user.deletion_requested`).

## Derecho de acceso y portabilidad

- Exportación de los datos del usuario en formato estructurado (JSON/CSV) con todos los módulos implicados, generada en background y entregada de forma segura (enlace firmado de corta duración, tras reautenticación).
- Plazos de respuesta según la normativa (el RGPD da un mes, prorrogable).

## Consentimiento

- Cuando la base legal es el consentimiento: registro de qué se aceptó, cuándo, versión del texto y cómo; retirada tan fácil como el otorgamiento; el sistema respeta la retirada (deja de enviar a analítica/marketing).
- Las preferencias de comunicación son datos del usuario y se respetan en todos los envíos (→ `integrations`).

## Cifrado

| Nivel | Cómo |
| :--- | :--- |
| En tránsito | TLS en todo el tráfico externo y, idealmente, interno (base de datos, Redis, entre servicios) |
| En reposo | Cifrado del disco/volumen y de la base de datos gestionada (activado por defecto en la mayoría de proveedores cloud) |
| **Por campo** | Datos muy sensibles cifrados en la aplicación antes de guardarlos |

### Cifrado por campo con KMS (envelope encryption)

```text
1. Clave maestra en un KMS (AWS KMS, GCP KMS, Azure Key Vault, Vault Transit): nunca sale del KMS.
2. Clave de datos por registro o por lote, generada por el KMS; se cifra el campo con AES-256-GCM.
3. Se guarda: ciphertext + clave de datos cifrada + id/versión de la clave.
4. Rotación: nuevas claves de datos con la nueva versión; re-cifrado progresivo de lo antiguo.
```

- **Búsqueda sobre campos cifrados:** índice ciego (HMAC del valor normalizado con una clave separada) para búsquedas por igualdad (`WHERE email_hmac = $1`).
- Librerías de alto nivel (AWS Encryption SDK, Google Tink) mejor que construir el esquema a mano.
- El cifrado por campo no protege si la aplicación descifra para todos: combínalo con autorización y auditoría.

## Seudonimización

- Para analítica y logs: identificadores sustituidos por un HMAC con clave secreta (estable para correlacionar, no reversible sin la clave).
- Los datos seudonimizados siguen siendo datos personales (con menos riesgo); los anónimos no.

## Pagos

- **No almacenes números de tarjeta** ni CVV: usa los formularios o SDK del proveedor (tokenización) para que los datos de tarjeta no pasen por tu backend y reducir el alcance de PCI DSS.
- Guarda solo el token del proveedor, la marca y los últimos 4 dígitos.

## Logs de auditoría

```json
{ "at": "2026-01-15T10:30:00Z", "actor": "u_7", "actorRole": "support", "action": "customer.view_document",
  "resource": "customer:c_981", "tenantId": "42", "reason": "ticket #4521", "ip": "203.0.113.0/24", "requestId": "…" }
```

- Separados de los logs operativos: quién hizo qué sobre qué dato, cuándo, desde dónde y con qué motivo (en accesos de soporte).
- **Solo añadir** (append-only), con acceso restringido y retención propia; sin copiar los datos sensibles a los que se accedió.
- Cubre: accesos a datos sensibles, exportaciones, cambios de permisos, impersonaciones, borrados.

## Encargados de tratamiento (proveedores)

- Inventario de proveedores que reciben datos personales, con contrato de encargo de tratamiento.
- Región de alojamiento y transferencias internacionales (requisitos según la normativa).
- Envío de datos mínimos; borrado en el proveedor incluido en el flujo de supresión.

## Incidentes

- Detección (alertas, logs de auditoría) y procedimiento de respuesta documentado.
- Plazos de notificación a la autoridad y a los afectados según la normativa (RGPD: 72 horas a la autoridad cuando hay riesgo); el equipo técnico debe poder responder rápido qué datos, de quién y desde cuándo.

## Anti-patrones

| Anti-patrón | Consecuencia | Corrección |
| :--- | :--- | :--- |
| Emails, documentos o cuerpos de peticiones en logs | Datos personales dispersos sin control ni borrado | IDs + redacción |
| Copia de producción en staging | Fuga y obligación de proteger otro entorno | Datos sintéticos o anonimizados |
| `deleted_at` como "borrado de la cuenta" | Supresión incumplida | Borrado o anonimización real en todas las copias |
| Borrar solo en la BD principal | Datos en búsqueda, cachés, archivos y proveedores | Flujo de borrado completo |
| Números de tarjeta almacenados | Alcance PCI completo, riesgo grave | Tokenización del proveedor |
| Claves de cifrado en el código o junto a los datos | Cifrado inútil | KMS |
| Retención indefinida "por si acaso" | Más datos expuestos en una fuga | Plazos + purga automática |
| Datos personales en URLs | Fugas por logs y `Referer` | Cuerpo de la petición o IDs |
| Auditoría en los mismos logs operativos con retención corta | Sin trazabilidad cuando hace falta | Logs de auditoría separados |
