# Privacidad — notas Java / Spring

- **Logs:** máscaras en Logback/Log4j2 (patrones de reemplazo o `MaskingJsonGeneratorDecorator` de logstash-logback-encoder) y, sobre todo, no registrar entidades completas (`toString()` de entidades con datos personales: exclúyelos o no los implementes con todos los campos).
- **Cifrado por campo:** `AttributeConverter` de JPA que cifra/descifra con AES-GCM y claves de datos del KMS (AWS Encryption SDK for Java, Google Tink, Spring Vault Transit); columna adicional con el índice ciego (HMAC) para búsquedas por igualdad.
- **Auditoría:** Hibernate Envers (historial de cambios; excluye con `@NotAudited` los campos que no deben copiarse) y Spring Data auditing (`@CreatedBy`, `@LastModifiedDate`); logs de acceso a datos sensibles en un registro propio.
- **Retención:** `@Scheduled` con ShedLock o Spring Batch para purgas por lotes.
- **Borrado coordinado:** evento `UserDeletionRequested` con `@ApplicationModuleListener` en cada módulo (Spring Modulith) para que cada uno borre o anonimice sus datos y registre el resultado.
