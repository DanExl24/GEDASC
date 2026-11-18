# Checklist de auditoría — observabilidad del backend

Severidad orientativa entre corchetes ([severity.md](../../../standards/severity.md)).

## 1. Logs

- [ ] Logs estructurados (JSON) con campos estándar (timestamp, nivel, servicio, entorno, versión). **[MEDIUM]**
- [ ] Request id y traceId en todos los logs de una petición (contexto automático). **[MEDIUM]**
- [ ] Sin contraseñas, tokens, cabeceras de autenticación, datos de tarjeta ni documentos en logs; redacción configurada. **[HIGH]**; **[CRITICAL]** si hay credenciales o datos de tarjeta.
- [ ] Niveles usados con criterio; `debug` desactivado en producción. **[LOW]**
- [ ] Cada error se registra una vez, con stack. **[LOW]**
- [ ] Log de acceso por petición con ruta como plantilla, estado y duración. **[LOW–MEDIUM]**

## 2. Trazas y correlación

- [ ] Trazas distribuidas (OpenTelemetry u otra) en servidor HTTP, clientes, base de datos y colas. **[MEDIUM]** en sistemas con varios servicios o workers.
- [ ] `traceparent` propagado a servicios propios y en los mensajes. **[MEDIUM]**
- [ ] Muestreo que conserva errores y peticiones lentas. **[LOW]**
- [ ] Sin datos personales ni valores literales de SQL en atributos de spans. **[MEDIUM]**

## 3. Métricas

- [ ] Métricas RED por endpoint con histogramas de latencia. **[MEDIUM]**
- [ ] Métricas de recursos: pool de conexiones, colas, memoria/GC, event loop o hilos. **[MEDIUM]**
- [ ] Métricas de negocio de los flujos críticos. **[LOW–MEDIUM]**
- [ ] Etiquetas de baja cardinalidad (rutas como plantilla, sin IDs). **[MEDIUM]**

## 4. Health checks

- [ ] Liveness sin dependencias externas. **[HIGH]** si comprueba la base de datos o terceros.
- [ ] Readiness con dependencias propias imprescindibles y que se desactiva durante el apagado. **[MEDIUM]**
- [ ] Readiness no depende de APIs de terceros. **[HIGH]**
- [ ] Health checks baratos y sin detalles internos públicos. **[MEDIUM]**

## 5. Errores, SLOs y alertas

- [ ] Errores inesperados enviados a una herramienta de tracking con release y entorno. **[MEDIUM]**
- [ ] SLOs definidos para los recorridos críticos. **[LOW–MEDIUM]**
- [ ] Alertas por síntomas (error rate, latencia, colas, DLQ), con destinatario y runbook. **[HIGH]** si una caída de un flujo crítico no generaría ninguna alerta.
- [ ] Sin alertas ruidosas ignoradas habitualmente. **[MEDIUM]**
- [ ] Versión desplegada visible en las señales y marcadores de despliegue. **[LOW]**

## Cómo inspeccionar rápido

- Logs: buscar `console.log`, `print(`, `System.out.println`, `logger.info(f"…{`, concatenación en mensajes de log; revisar la configuración de redacción (`redact`, filtros, máscaras).
- Datos sensibles: buscar `password`, `token`, `authorization`, `req.body`, `request.data` cerca de llamadas al logger.
- Métricas: etiquetas con `req.url`/`request.path` en lugar de la ruta plantilla; etiquetas `user_id`, `email`, `order_id`.
- Health: implementación de `/health`, `/livez`, `/readyz`, Actuator `health` groups, y qué comprueba cada uno.
- Propagación: clientes HTTP y productores de mensajes sin instrumentación de trazas.
