# Patrones de seguridad de la API

## Inyecciones

### SQL

```ts
db.query(`SELECT * FROM users WHERE email = '${email}'`)             // ❌ inyección
db.query('SELECT id, name FROM users WHERE email = $1', [email])      // ✅ parametrizado

// orden dinámico: los identificadores no se parametrizan → lista blanca
const SORTABLE = { createdAt: 'created_at', total: 'total' } as const
const column = SORTABLE[query.sort as keyof typeof SORTABLE] ?? 'created_at'
```

Los ORMs protegen salvo en sus vías "raw" (`$queryRawUnsafe`, `.raw()`, `extra()`, `createNativeQuery` con concatenación).

### NoSQL (MongoDB)

```js
// body: { "email": "a@b.com", "password": { "$ne": null } } → login sin contraseña
User.findOne({ email: body.email, password: body.password })   // ❌
```

Valida tipos con un schema (que `password` sea string) antes de construir la consulta; desactiva operadores en la entrada (`sanitizeFilter` en Mongoose, o librerías que eliminan claves con `$`). Nunca `$where` con datos del usuario.

### Comandos del sistema

```ts
exec(`convert ${file} out.png`)                         // ❌ shell: `; rm -rf /`
execFile('convert', [file, 'out.png'], { timeout })     // ✅ sin shell, argumentos separados
```

- Evita llamar a procesos externos si hay una librería.
- Valida los argumentos (lista blanca) y usa `--` para separar opciones de argumentos cuando el comando lo soporte (evita inyección de opciones como `--output=/etc/...`).

### Rutas de archivo (path traversal)

```ts
const base = path.resolve(UPLOAD_DIR)
const target = path.resolve(base, userFileName)
if (!target.startsWith(base + path.sep)) throw new ForbiddenError()   // ../../etc/passwd
```

Mejor aún: no uses nombres de archivo del usuario; usa IDs propios y busca el archivo por ID.

### Plantillas, expresiones y otros intérpretes

- **SSTI:** nunca compiles plantillas (Jinja2, Handlebars, Thymeleaf, FreeMarker) con contenido del usuario; pasa los datos como variables.
- **Expresiones** (SpEL, OGNL, `eval`, `vm`): nunca evaluar entrada del usuario.
- **XML:** desactiva entidades externas (XXE) en los parsers; prefiere JSON.
- **LDAP, XPath, cabeceras HTTP, logs:** escapa o valida (saltos de línea en cabeceras → response splitting; en logs → falsificación de entradas).
- **ReDoS:** expresiones regulares con cuantificadores anidados (`(a+)+`) sobre entrada del usuario pueden bloquear la CPU; limita la longitud de la entrada y usa motores con tiempo lineal (RE2) donde aplique.

## Consumo de recursos

| Dimensión | Control |
| :--- | :--- |
| Peticiones | Rate limiting por IP, usuario, API key y endpoint; más estricto en endpoints costosos o sensibles; almacén compartido (Redis) entre instancias |
| Tamaño | Límite de body, de archivos, de arrays y de strings (→ `http-layer`) |
| Filas | Paginación con tope; exportaciones en background |
| Tiempo | Timeouts de petición, de consultas y de llamadas externas |
| Complejidad | GraphQL: profundidad máxima, coste por consulta, desactivar introspección pública si no es una API pública; búsquedas con comodines limitadas |
| Coste económico | Límites por usuario/día en SMS, emails, llamadas a APIs de pago, generación de PDFs o IA |
| Concurrencia | Límite de operaciones pesadas simultáneas por usuario; colas para trabajos largos |

```ts
// límites por coste: más estricto en lo caro
app.post('/auth/login', rateLimit({ key: (r) => `login:${r.ip}`, points: 10, duration: 60 }))
app.post('/reports',    rateLimit({ key: (r) => `report:${r.auth.userId}`, points: 5, duration: 3600 }))
app.post('/sms/verify', rateLimit({ key: (r) => `sms:${r.auth.userId}`, points: 3, duration: 3600 }))
```

- Responde `429 Too Many Requests` con `Retry-After`.
- Detrás de un proxy, obtén la IP real de forma segura (configuración de proxies de confianza; no aceptes `X-Forwarded-For` de cualquiera).

## Flujos de negocio sensibles (API6)

Flujos que, automatizados, dañan al negocio aunque cada petición sea "válida": registro de cuentas, compra de stock limitado, canje de cupones, reservas, publicación de contenido, referidos.

- Límites de negocio (una compra por usuario de un producto limitado, cupones de un solo uso por cuenta).
- Anti-automatización: CAPTCHA o desafíos en los pasos críticos, detección de patrones (velocidad, huellas de dispositivo), verificación de email/teléfono antes de acciones de valor.
- Monitorización y alertas de uso anómalo.

## SSRF (API7)

Cualquier funcionalidad que hace que el servidor pida una URL dada por el usuario: webhooks, importar desde URL, previsualización de enlaces, avatares por URL, conversores de documentos, integraciones configurables.

```ts
async function safeFetch(rawUrl: string) {
  const url = new URL(rawUrl)
  if (!['https:'].includes(url.protocol)) throw new ValidationError('Solo HTTPS')
  if (ALLOWED_HOSTS && !ALLOWED_HOSTS.has(url.hostname)) throw new ValidationError('Host no permitido')

  const addresses = await dns.lookup(url.hostname, { all: true })
  if (addresses.some((a) => isPrivateOrReserved(a.address))) throw new ValidationError('Destino no permitido')

  // conectar a la IP ya validada (evita DNS rebinding) y NO seguir redirecciones automáticamente
  return fetchPinned(url, addresses[0].address, { redirect: 'manual', timeout: 5_000, maxBytes: 5_000_000 })
}
```

- Bloquea rangos privados y reservados: `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `127.0.0.0/8`, `169.254.0.0/16` (**metadatos de la nube: 169.254.169.254**), `0.0.0.0/8`, `100.64.0.0/10`, y sus equivalentes IPv6 (`::1`, `fc00::/7`, `fe80::/10`, IPv4 mapeadas `::ffff:…`).
- Valida **cada redirección** (o no las sigas).
- Fija la IP resuelta para la conexión (si resuelves para validar y luego la librería resuelve de nuevo, un DNS rebinding cambia el destino).
- Lista blanca de hosts cuando el caso lo permite (integraciones conocidas).
- Defensa en profundidad: proxy de salida con reglas, IMDSv2 en AWS (exige token para los metadatos), red de la aplicación sin acceso a servicios internos que no necesita.
- Respuestas: tamaño máximo, tipos de contenido esperados, sin devolver al usuario el contenido de errores internos.

## Subida de archivos

1. **Tamaño máximo** en el proxy y en la aplicación (y de las imágenes en píxeles: bombas de descompresión).
2. **Tipo por contenido** (magic bytes), no por extensión ni por el `Content-Type` del cliente; lista blanca de tipos.
3. **Nombre aleatorio** generado por el servidor; el nombre original solo como metadato (saneado).
4. **Almacenamiento aislado:** almacenamiento de objetos (S3, GCS, Azure Blob) o directorio fuera de la raíz web, sin permisos de ejecución.
5. **Entrega segura:** desde otro dominio (o CDN) con `Content-Disposition: attachment` para tipos no previsualizables, `Content-Type` correcto y `X-Content-Type-Options: nosniff`; URLs firmadas de corta duración tras autorizar (→ `authorization`).
6. **Procesamiento:** re-codificar imágenes (elimina contenido incrustado y metadatos EXIF con ubicación); SVG solo saneado o rasterizado.
7. **Archivos comprimidos:** límites de tamaño descomprimido y de número de entradas (zip bombs); rechazar rutas con `..` al extraer (zip slip).
8. **Antivirus** para archivos que otros usuarios descargarán.
9. Uploads grandes: subida directa al almacenamiento con URL firmada, y validación posterior asíncrona.

## Deserialización insegura

- Nunca deserializar datos no confiables con formatos que instancian objetos arbitrarios: `pickle`, `yaml.load` (sin `SafeLoader`), serialización nativa de Java (`ObjectInputStream`), `BinaryFormatter`, `node-serialize`.
- JSON con schema. En Jackson, sin *default typing* polimórfico global.
- Cookies o tokens con estado serializado: firmados y, si contienen datos sensibles, cifrados.

## Secretos

- **Origen:** gestor de secretos (Vault, AWS Secrets Manager, GCP Secret Manager, Azure Key Vault, Doppler) o variables de entorno inyectadas en el despliegue; nunca en el repositorio, en la imagen de contenedor ni en el código del cliente.
- **Escaneo:** gitleaks o trufflehog en pre-commit y CI; si un secreto llega al repositorio, **se rota** (borrarlo del historial no basta).
- **Rotación** posible sin downtime (dos credenciales válidas durante la transición).
- **Mínimo privilegio:** credenciales por servicio y entorno, con permisos mínimos (usuario de base de datos sin DDL para la app, claves de cloud acotadas).
- **Nunca en logs** ni en mensajes de error (→ `observability`).

## Configuración insegura (API8)

- Modo debug y páginas de error detalladas desactivadas en producción.
- Endpoints de gestión no expuestos públicamente: actuators de Spring (solo `health`), `/metrics`, `/debug`, paneles de administración del framework, consolas de base de datos.
- Documentación (Swagger/OpenAPI UI) pública solo si la API es pública; si no, protegida.
- Métodos HTTP no usados deshabilitados; `TRACE` desactivado.
- Credenciales por defecto cambiadas; servicios internos (Redis, bases de datos, colas) sin acceso desde internet y con autenticación.
- Buckets y almacenamiento sin acceso público salvo lo que deba serlo.
- TLS en todo el tráfico externo; verificación de certificados activada en las llamadas salientes.

## Inventario (API9)

- Todos los endpoints documentados (OpenAPI generado desde el código o contract-first) y revisados.
- Versiones antiguas de la API retiradas con un plan de deprecación; sin endpoints "zombis" sin mantenimiento.
- Sin rutas de depuración, de prueba o temporales en producción.
- Entornos de staging no expuestos o protegidos, y sin datos reales de producción.

## Consumo inseguro de APIs de terceros (API10)

- Las respuestas de terceros son entrada no confiable: valida su forma antes de usarlas o guardarlas.
- Timeouts, límites de tamaño y TLS verificado; no seguir redirecciones a destinos no esperados.
- Webhooks entrantes con firma verificada (HMAC con comparación en tiempo constante) y protección contra replay (marca de tiempo + id) (→ `integrations`).

## Dependencias

- Lockfile versionado e instalación reproducible.
- Auditoría en CI: `npm audit`/`pnpm audit`, `pip-audit`, OWASP Dependency-Check, OSV-Scanner, Snyk, Trivy (también imágenes de contenedor); fallar en vulnerabilidades altas explotables.
- Actualizaciones automatizadas (Renovate, Dependabot).
- Minimizar dependencias; revisar las nuevas (mantenimiento, scripts de instalación, número de dependencias transitivas).
- Imágenes base mínimas, fijadas por versión/digest y actualizadas; contenedores sin root.
- SBOM si hay requisitos de cumplimiento.

## Criptografía básica

- Librerías estándar o mantenidas; nunca algoritmos propios.
- Aleatoriedad de seguridad con CSPRNG (`crypto.randomBytes`, `secrets`, `SecureRandom`), nunca `Math.random`/`random`.
- HMAC-SHA256 para firmar; comparación en tiempo constante.
- Cifrado autenticado (AES-GCM, ChaCha20-Poly1305) con claves gestionadas por un KMS; nunca ECB ni claves en el código.

## Anti-patrones

| Anti-patrón | Consecuencia | Corrección |
| :--- | :--- | :--- |
| SQL o comandos construidos con strings | Inyección, ejecución remota | Parámetros, `execFile` |
| Filtros de Mongo con el body tal cual | Bypass de autenticación | Schema de tipos + sanitizar operadores |
| Rate limiting en memoria con varias instancias | Límites multiplicados | Almacén compartido |
| Sin límites en SMS/email | Facturas desorbitadas | Límites por usuario y globales |
| Fetch de URLs de usuarios sin validar | SSRF, robo de credenciales de la nube | Validación de destino e IP, sin redirecciones |
| Tipo de archivo por extensión | Ejecución o XSS almacenado | Magic bytes + entrega segura |
| `pickle`/`yaml.load`/`ObjectInputStream` con datos externos | Ejecución remota | JSON con schema |
| Secretos en el repositorio o la imagen | Compromiso total | Gestor de secretos + rotación |
| Actuators o debug expuestos | Fuga de configuración y secretos | Solo `health`, debug desactivado |
| Dependencias sin auditar | Vulnerabilidades conocidas explotables | Auditoría y actualización en CI |
