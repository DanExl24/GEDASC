# Checklist de auditoría — privacidad y protección de datos

Severidad orientativa entre corchetes ([severity.md](../../../standards/severity.md)). Marca por separado los puntos que requieren confirmación legal (base legal, plazos, transferencias).

## 1. Inventario

- [ ] Existe un mapa de los campos personales y de sus copias (BD, búsqueda, cachés, colas, almacenamiento, logs, analítica, proveedores). **[MEDIUM]**
- [ ] Los datos de categorías especiales y los identificadores sensibles están identificados. **[HIGH]** si se tratan sin identificar.

## 2. Minimización y exposición

- [ ] Sin datos personales innecesarios en logs, trazas ni herramientas de errores (IDs en su lugar; redacción activa). **[HIGH]**; **[CRITICAL]** si hay documentos, datos de salud o de tarjeta.
- [ ] Sin datos personales en URLs. **[MEDIUM]**
- [ ] Mensajes y eventos con datos mínimos. **[MEDIUM]**
- [ ] Proveedores reciben solo los datos que necesitan. **[MEDIUM]**
- [ ] Sin copias de producción en entornos no productivos; datos sintéticos o anonimizados de forma irreversible. **[HIGH]**

## 3. Protección

- [ ] TLS en todo el tráfico externo y hacia la base de datos. **[HIGH]**
- [ ] Cifrado en reposo activado en bases de datos, volúmenes y almacenamiento. **[MEDIUM]**
- [ ] Datos muy sensibles cifrados por campo con claves en un KMS. **[HIGH]** para categorías especiales e identificadores oficiales en claro.
- [ ] Ningún número de tarjeta ni CVV almacenado. **[CRITICAL]**
- [ ] Claves de cifrado fuera del código y de la base de datos, con rotación. **[CRITICAL]** si están junto a los datos.

## 4. Retención y borrado

- [ ] Plazos de conservación definidos por tipo de dato. **[MEDIUM]**
- [ ] Jobs automáticos de purga o anonimización que cumplen los plazos. **[MEDIUM]**
- [ ] Borrado de cuenta que alcanza BD, búsqueda, cachés, almacenamiento y proveedores, con registro. **[HIGH]**
- [ ] El borrado lógico no se presenta como supresión. **[HIGH]**
- [ ] La caducidad de las copias de seguridad está documentada. **[LOW–MEDIUM]**

## 5. Derechos y consentimiento

- [ ] Exportación de los datos del usuario completa y entregada de forma segura. **[MEDIUM]**
- [ ] Registro de consentimientos (cuándo, qué versión) y retirada efectiva cuando la base legal es el consentimiento. **[MEDIUM–HIGH]**
- [ ] Preferencias de comunicación respetadas en todos los envíos. **[MEDIUM]**

## 6. Auditoría y terceros

- [ ] Accesos y cambios a datos sensibles, exportaciones e impersonaciones registrados en logs de auditoría separados, append-only y con acceso restringido. **[MEDIUM]**; **[HIGH]** en datos de salud o financieros.
- [ ] Inventario de proveedores con datos personales, región de alojamiento y contrato de encargo (confirmar con legal). **[MEDIUM]**
- [ ] Procedimiento de respuesta a incidentes que permite saber qué datos y de quién se vieron afectados. **[MEDIUM]**

## Cómo inspeccionar rápido

- Campos personales: modelos/esquemas con `email`, `phone`, `address`, `birth`, `document`, `dni`, `ssn`, `tax_id`, `passport`, `iban`, `card`, `health`, `diagnosis`.
- Logs: llamadas al logger con objetos de usuario completos, `req.body`, `request.data`; configuración de redacción.
- Entornos: scripts de "restore de producción en staging", dumps en el repositorio, seeds con nombres o emails reales.
- Borrado: implementación de "eliminar cuenta" (¿solo `deleted_at`?), ausencia de borrado en búsqueda, almacenamiento y proveedores.
- Tarjetas: columnas `card_number`/`pan`/`cvv`, formularios de pago que envían la tarjeta al backend propio.
- Cifrado: columnas sensibles en claro; claves en variables de entorno de la app junto a los datos sin KMS.
