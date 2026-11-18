# Checklist de auditoría — seguridad de la API

Severidad orientativa entre corchetes ([severity.md](../../../standards/severity.md)). Indica CWE: CWE-89 (SQL), CWE-943 (NoSQL), CWE-78 (comandos), CWE-22 (rutas), CWE-1336 (SSTI), CWE-611 (XXE), CWE-918 (SSRF), CWE-434 (uploads), CWE-502 (deserialización), CWE-798 (credenciales en código), CWE-770 (recursos sin límite), CWE-1333 (ReDoS).

## 1. Inyecciones

- [ ] Consultas SQL parametrizadas; identificadores dinámicos desde lista blanca. **[CRITICAL]**
- [ ] Consultas NoSQL construidas con valores de tipo validado; sin operadores de la entrada ni `$where`. **[CRITICAL]**
- [ ] Sin `exec`/`system`/`shell=True` con datos externos; procesos con argumentos separados. **[CRITICAL]**
- [ ] Rutas de archivo derivadas de la entrada normalizadas y confinadas a un directorio base (mejor: IDs propios). **[HIGH]**
- [ ] Sin compilación de plantillas ni evaluación de expresiones con entrada del usuario. **[CRITICAL]**
- [ ] Parsers XML sin entidades externas. **[HIGH]**
- [ ] Regex sobre entrada del usuario sin riesgo de ReDoS y con longitud limitada. **[MEDIUM]**

## 2. Consumo de recursos (API4)

- [ ] Rate limiting con almacén compartido en endpoints de autenticación, costosos y públicos. **[HIGH]**
- [ ] Límites de body, archivos, arrays, strings y paginación (→ `http-layer`). **[HIGH]** si faltan en endpoints públicos.
- [ ] Timeouts en peticiones, consultas y llamadas externas. **[MEDIUM]**
- [ ] Límites de coste en operaciones de pago (SMS, emails, APIs externas, IA, PDFs). **[HIGH]**
- [ ] GraphQL: profundidad y coste limitados. **[HIGH]** si no hay límites en una API pública.
- [ ] IP del cliente obtenida de forma segura detrás de proxies. **[MEDIUM]**

## 3. Flujos de negocio sensibles (API6)

- [ ] Flujos de valor (registro, compras limitadas, cupones, referidos) con límites de negocio y anti-automatización. **[MEDIUM–HIGH]** según el impacto económico.

## 4. SSRF (API7)

- [ ] URLs de usuarios validadas: esquema, host (lista blanca si es posible), IP resuelta fuera de rangos privados/reservados/metadatos, redirecciones validadas o desactivadas, IP fijada en la conexión. **[CRITICAL]** en entornos cloud con acceso a metadatos; **[HIGH]** en otros.
- [ ] Respuestas de URLs externas con tamaño y tiempo limitados. **[MEDIUM]**

## 5. Archivos

- [ ] Tamaño máximo de upload. **[HIGH]**
- [ ] Tipo validado por contenido con lista blanca. **[HIGH]**
- [ ] Nombre generado por el servidor; almacenamiento aislado sin ejecución. **[HIGH]**
- [ ] Entrega desde otro dominio o con `Content-Disposition: attachment` + `nosniff`. **[HIGH]** si se sirven HTML/SVG subidos por usuarios desde el dominio principal.
- [ ] Protección contra zip bombs y zip slip al descomprimir. **[HIGH]**
- [ ] Imágenes re-codificadas (sin EXIF con ubicación). **[LOW–MEDIUM]**

## 6. Deserialización

- [ ] Sin `pickle`, `yaml.load` inseguro, serialización nativa de Java/.NET ni equivalentes con datos externos. **[CRITICAL]**
- [ ] Jackson u otros sin tipado polimórfico por defecto. **[HIGH]**

## 7. Secretos

- [ ] Sin secretos en el repositorio (actual ni historial), imágenes o configuración versionada. **[CRITICAL]**
- [ ] Secretos inyectados desde gestor o entorno de ejecución; rotables. **[MEDIUM]**
- [ ] Escaneo de secretos en CI/pre-commit. **[LOW–MEDIUM]**
- [ ] Credenciales con mínimo privilegio (la app no usa un usuario de BD con DDL o superusuario). **[MEDIUM]**
- [ ] Secretos fuera de logs y mensajes de error. **[HIGH]**

## 8. Configuración (API8) e inventario (API9)

- [ ] Debug y errores detallados desactivados en producción. **[HIGH]**
- [ ] Actuators, métricas, consolas y paneles de administración no expuestos públicamente. **[CRITICAL]** si exponen variables de entorno, heap dumps o ejecución; **[HIGH]** en otros casos.
- [ ] Documentación interna de la API no pública. **[LOW–MEDIUM]**
- [ ] Servicios internos (Redis, BD, colas) sin acceso público y con autenticación. **[CRITICAL]**
- [ ] Almacenamiento de objetos sin acceso público no intencionado. **[CRITICAL]** si expone datos de usuarios.
- [ ] TLS en tráfico externo y verificación de certificados en llamadas salientes. **[HIGH]**
- [ ] Endpoints documentados; versiones antiguas y rutas de depuración retiradas. **[MEDIUM]**

## 9. Terceros y dependencias (API10)

- [ ] Respuestas de APIs externas validadas antes de usarlas. **[MEDIUM]**
- [ ] Webhooks entrantes con firma y protección contra replay. **[HIGH]**
- [ ] Auditoría de dependencias en CI sin vulnerabilidades altas explotables pendientes. **[HIGH]**
- [ ] Actualizaciones automatizadas; imágenes base mínimas y actualizadas; contenedores sin root. **[MEDIUM]**

## Cómo inspeccionar rápido

- Inyección: template strings o concatenación en `query(`, `execute(`, `raw(`, `$queryRawUnsafe`, `createNativeQuery`, `cursor.execute(f"`; `exec(`, `execSync(`, `child_process`, `os.system`, `subprocess(..., shell=True)`, `Runtime.exec(` con strings; `eval(`, `new Function(`, `render_template_string(`, `SpelExpressionParser` con entrada.
- Rutas: `path.join(`/`os.path.join(`/`Paths.get(` con nombres de archivo de la petición; `sendFile(`, `FileResponse(`.
- SSRF: `fetch(`/`axios(`/`requests.get(`/`RestTemplate`/`WebClient` con URLs de la petición o de configuración del usuario (webhooks, imágenes por URL).
- Uploads: configuración de `multer`, `UploadFile`, `MultipartFile`; validación por `originalname`/extensión o `mimetype` del cliente.
- Deserialización: `pickle.loads`, `yaml.load(` sin `SafeLoader`, `ObjectInputStream`, `enableDefaultTyping`/`activateDefaultTyping`.
- Secretos: `gitleaks detect` / `trufflehog git file://.`; búsqueda de `password=`, `secret`, `api_key`, `BEGIN PRIVATE KEY` en el repositorio.
- Configuración: `DEBUG = True`, `management.endpoints.web.exposure.include=*`, `app.run(debug=True)`, Swagger habilitado en producción.
- Dependencias: `npm audit --omit=dev`, `pip-audit`, `mvn org.owasp:dependency-check-maven:check`, `osv-scanner`.
