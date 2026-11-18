# Escala de severidad (backend)

Toda skill del plugin clasifica sus hallazgos con esta escala. Se juzga el **impacto real sobre los datos, el dinero, la disponibilidad y los usuarios**, no la estética del código.

| Nivel | Criterio | Ejemplos backend | Acción |
| :--- | :--- | :--- | :--- |
| 🔴 **CRITICAL** | Pérdida o corrupción de datos, acceso a datos ajenos, pérdida económica, caída garantizada. | Endpoint que devuelve recursos de otro tenant (IDOR); inyección SQL; condición de carrera que permite gastar dos veces el mismo saldo; migración que bloquea o borra una tabla de producción; secretos en el repositorio; respuesta que serializa el hash de contraseña. | Detener el despliegue hasta corregir. |
| 🟠 **HIGH** | Un flujo principal falla, se corrompe parcialmente o se degrada para muchos usuarios. | Operación de varios pasos sin transacción; N+1 en un endpoint principal que provoca timeouts; endpoint público sin validación de entrada; stack traces en respuestas de producción; llamada externa dentro de una transacción que agota el pool bajo carga normal; índice ausente en una tabla grande muy consultada. | Corregir antes de liberar el módulo afectado. |
| 🟡 **MEDIUM** | Deuda que ya causa fricción o que hará fallar el próximo cambio. | Controladores con lógica de negocio; formato de error inconsistente entre endpoints; transiciones de estado sin control centralizado; consultas sin límite en endpoints internos; FK sin índice en tablas medianas. | Planificar en el siguiente ciclo. |
| 🔵 **LOW** | Mejora de mantenibilidad sin impacto actual. | Nombres inconsistentes; DTOs duplicados; índices redundantes pequeños. | Corregir de forma oportunista. |
| ℹ️ **INFO** | Observación u oportunidad, sin defecto. | Valorar paginación por cursor; adoptar value objects para importes. | Informativo. |

## Reglas de clasificación

1. **Impacto × alcance.** Un defecto grave en un endpoint interno poco usado puede bajar un nivel; uno leve en pagos o autenticación puede subir uno. Justifica el ajuste en una línea.
2. **Sin evidencia no hay hallazgo.** Archivo y líneas, consulta concreta o escenario reproducible; si no, es una pregunta abierta.
3. **No infles.** Ante la duda, el nivel menor, explicando qué haría falta para subirlo.
4. **Datos y dinero primero.** A igual probabilidad, un riesgo de integridad de datos pesa más que uno de rendimiento.
5. **Todo CRITICAL está verificado** y el informe dice cómo (archivo y líneas, comando como `git ls-files` o `npm audit`, petición reproducible).

## Calibración en casos frontera

| Situación | Severidad | Sube a CRITICAL si… |
| :--- | :--- | :--- |
| Condición de carrera que duplica o desordena registros **sin impacto económico ni legal** (asistencia, actividad, contadores informativos) | HIGH | mueve dinero, stock vendible, permisos o tiene consecuencias legales |
| Ausencia total de tests, CI u observabilidad | HIGH (con tope de área en la rúbrica de `audit`) | — (es riesgo de detección, no un daño directo) |
| Secreto en el repositorio | CRITICAL si es de producción o firma tokens/sesiones | — · si es de desarrollo local y sin uso real, MEDIUM (verifícalo antes de bajarlo) |
| Falta de rate limiting | HIGH en login, recuperación de cuenta y endpoints costosos; MEDIUM en endpoints internos autenticados | permite abuso económico directo (SMS, pagos, IA) |
| Vulnerabilidad de una dependencia | Según su explotabilidad en el uso real del proyecto, no solo la severidad del aviso | es explotable de forma remota en una ruta expuesta |
| Endpoint sin autenticación | HIGH si expone datos no sensibles o de solo lectura | expone datos personales o permite escrituras |
| Error 500 que filtra detalles internos | HIGH | incluye secretos o credenciales |
