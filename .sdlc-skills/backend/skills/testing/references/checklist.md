# Checklist de auditoría — testing del backend

Severidad orientativa entre corchetes ([severity.md](../../../standards/severity.md)). Un hueco de tests vale según el riesgo del comportamiento que no protege.

## 1. Estrategia

- [ ] Hay tests automáticos y bloquean el merge en CI. **[HIGH]** si no hay tests en un servicio con flujos críticos.
- [ ] Reglas de dominio cubiertas con tests unitarios rápidos, incluidos casos negativos y valores frontera. **[MEDIUM]**; **[HIGH]** en reglas de dinero o estado.
- [ ] Repositorios y casos de uso probados contra la base de datos real del mismo motor. **[MEDIUM]**
- [ ] Endpoints principales con tests de API (validación, códigos, errores, autenticación). **[MEDIUM]**

## 2. Calidad

- [ ] La base de datos, el ORM y los módulos internos no se mockean en tests de integración. **[MEDIUM]**
- [ ] No se usa SQLite/H2 como sustituto del motor de producción. **[MEDIUM]**
- [ ] Aserciones sobre resultados y efectos (filas, eventos, respuestas), no solo ausencia de errores. **[MEDIUM]**
- [ ] Factorías de datos; sin fixtures globales mutadas. **[LOW–MEDIUM]**

## 3. Aislamiento y estabilidad

- [ ] Cada test crea sus datos y queda aislado; la suite pasa en cualquier orden y en paralelo. **[MEDIUM]**
- [ ] Red real bloqueada; proveedores simulados en la frontera HTTP. **[MEDIUM]**; **[HIGH]** si los tests llaman a proveedores reales con efectos.
- [ ] Tiempo y aleatoriedad controlados. **[MEDIUM]**
- [ ] Sin esperas fijas; sin tests intermitentes conocidos ignorados. **[MEDIUM]**

## 4. Casos críticos

- [ ] Acceso entre tenants o usuarios probado (detalle, listados, updates, exportaciones). **[HIGH]** si no existe en sistemas multi-tenant.
- [ ] Matriz de permisos de los recursos principales. **[MEDIUM]**
- [ ] Idempotencia de las operaciones con `Idempotency-Key` y de los consumidores. **[HIGH]** en pagos/pedidos.
- [ ] Condiciones de carrera de las operaciones críticas probadas con peticiones simultáneas. **[MEDIUM–HIGH]**
- [ ] Migraciones aplicadas sobre base vacía en CI y coherencia esquema-ORM verificada. **[MEDIUM]**
- [ ] Webhooks: firma válida, inválida, caducada y duplicada. **[MEDIUM]**
- [ ] Handlers de jobs y consumidores probados; el encolado o escritura en outbox verificado. **[MEDIUM]**

## 5. Contrato y cobertura

- [ ] Respuestas validadas contra la especificación o contratos de consumidores verificados. **[LOW–MEDIUM]**; **[MEDIUM]** con clientes externos.
- [ ] Cobertura usada para encontrar huecos; mutation testing en módulos críticos. **[INFO–LOW]**
- [ ] La suite corre en un tiempo razonable y en paralelo en CI. **[LOW]**

## Cómo inspeccionar rápido

- Mocks de infraestructura propia: `jest.mock('../repositories`, `vi.mock('@prisma/client')`, `mocker.patch("app.repositories`, `@MockBean`/`@MockitoBean` de repositorios en tests de integración.
- Motor sustituto: `sqlite` en configuración de tests de un proyecto PostgreSQL/MySQL, `h2` en Spring.
- Red real: tests sin nock/respx/WireMock que usan clientes HTTP; URLs de sandbox en configuración de test.
- Tiempo: `new Date()`, `datetime.now()`, `Instant.now()` en código bajo test sin reloj inyectable; `sleep` en tests.
- Aserciones débiles: `toBeDefined()`, `assert response is not None`, `assertNotNull` como única comprobación.
- Ausencia de tests: buscar tests que mencionen otro tenant, `Idempotency-Key`, concurrencia (`Promise.all`, `ThreadPoolExecutor`, `CompletableFuture`) en la suite.
