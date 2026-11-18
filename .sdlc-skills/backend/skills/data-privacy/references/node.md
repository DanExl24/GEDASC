# Privacidad — notas Node.js / TypeScript

- **Logs:** `pino` con `redact` (rutas a campos personales y credenciales, también anidados con comodines: `'*.email'`, `'*.document'`); serializadores propios para `req`/`res` que no incluyan cuerpos.
- **Cifrado por campo:** AWS Encryption SDK for JavaScript, Google Tink, o `crypto` (AES-256-GCM con IV aleatorio por valor) con claves de datos del KMS; encapsula el cifrado en el repositorio (o en una extensión de Prisma `$extends` con `result`/`query`) para que el resto del código vea valores en claro solo donde se autoriza.
- **Índice ciego:** `crypto.createHmac('sha256', blindIndexKey).update(normalize(email)).digest('hex')` en una columna aparte, indexada.
- **Retención:** jobs programados (BullMQ/pg-boss) de purga por lotes con métricas.
- **Exportación:** job que reúne los datos de cada módulo (cada módulo expone `exportUserData(userId)`), genera el archivo en almacenamiento privado y entrega una URL firmada de corta duración.
- **Seudonimización:** HMAC con clave secreta para identificadores enviados a analítica.
