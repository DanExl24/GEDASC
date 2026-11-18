# Plugin `fullstack`

Skills para lo que **cruza frontend y backend**: el contrato entre la API y su cliente, la organización del repositorio cuando ambos conviven, el diagnóstico de flujos que fallan "en algún punto entre la pantalla y la base de datos" y una auditoría que combina los dos plugins. También tiene el orquestador para **construir** funcionalidades que encadena skills de ambos plugins hacia un objetivo.

- Mismos modos que el resto del kit: **Construir** y **Auditar**.
- No tiene notas por stack propias: usa las de los plugins `frontend` (`vue.md`, `react.md`, `angular.md`) y `backend` (`node.md`, `python.md`, `java.md`).
- Comparte escala y formato en [`standards/`](standards/) (códigos `FS-*`); cada hallazgo cita la evidencia **en el servidor y en el cliente**.

**Requiere** los plugins `frontend` y `backend` instalados: las skills de este plugin invocan a las suyas (`frontend:<skill>`, `backend:<skill>`). Si falta uno, lo avisan y continúan con lo que pueden cubrir.

## Uso

```bash
/plugin marketplace add <ruta-o-repo-de-este-kit>
/plugin install frontend@sdlc-skills
/plugin install backend@sdlc-skills
/plugin install fullstack@sdlc-skills
```

```text
/fullstack:contracts reconcilia el módulo de pedidos entre apps/web y apps/api
/fullstack:flow-diagnosis al guardar el formulario de perfil la fecha se guarda un día antes
/fullstack:audit auditoría enfocada antes del release
/fullstack:feature añadir pagos con Stripe al checkout
```

## Catálogo

| Skill | Estado | Cubre |
| :--- | :---: | :--- |
| `contracts` | ✅ | Tabla de cruce endpoint ↔ consumidor, 5 dimensiones de desajuste (nombres, envelope, tipos y coerción, errores, sesión y cabeceras), contrato compartido (OpenAPI o esquemas en `shared/`), codegen y orden de despliegue |
| `topology` | ✅ | Estructura del repositorio con frontend y backend: monolito modular, monorepo con paquetes, hexagonal; dependencias ilegítimas, tipos duplicados, migración strangler por fases |
| `flow-diagnosis` | ✅ | Seguir un flujo UI → red → API → dominio → BD (y vuelta) para localizar la capa culpable con evidencia y corregirla en la causa raíz |
| `feature` | ✅ | **Orquestador de construcción:** descompone un objetivo ("añadir pagos", "CRUD con permisos", "subida de archivos") en un plan por capas con recetas, aviso de coste, contrato primero, pasos verificados y registro en `.sdlc/context.md` |
| `audit` | ✅ | **Orquestador:** combina `frontend:audit` y `backend:audit` con un único aviso de coste, añade `contracts`, deduplica entre capas y entrega una puntuación conjunta |

## Skills que trabajan juntas

- **Handoffs** ([standards/handoffs.md](standards/handoffs.md)): cada skill declara disparadores concretos que activan otra skill sobre un alcance acotado, con profundidad máxima de 2, sin reinvocar skills ya aplicadas, aviso de coste en cadenas largas y registro de pendientes si falta un plugin.
- **Contexto compartido** ([standards/context.md](standards/context.md)): `.sdlc/context.md` en la raíz del proyecto guarda stack, convenciones, decisiones, objetivo en curso, hallazgos abiertos y handoffs pendientes, para que la siguiente skill (o sesión) no empiece de cero.

## Estructura de una skill

```text
skills/<skill>/
├── SKILL.md              # cuándo usarla, modos, flujo y principios
└── references/
    ├── patterns.md       # patrones y anti-patrones
    └── checklist.md      # checklist de auditoría con severidad orientativa
```
