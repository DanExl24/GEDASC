---
name: topology
description: Diseña y audita la topología de un repositorio que contiene frontend y backend; elige entre monolito modular, monorepo con paquetes (apps/web, apps/api, packages/contracts) o arquitectura hexagonal; límites entre módulos de negocio que atraviesan ambas capas, dependencias ilegítimas (UI que importa código del servidor, utils gigantes, tipos duplicados en espejo), herramientas de workspace y reglas de dependencias verificadas en CI, y migración incremental (strangler) por fases. Úsala al arrancar un proyecto fullstack, cuando el repositorio se ha vuelto difícil de navegar o antes de separar en paquetes. No para la arquitectura interna de una sola capa (frontend:architecture, backend:architecture).
---

# Topología del repositorio

Cuando frontend y backend conviven en un mismo repositorio, la estructura decide si un cambio de negocio toca tres carpetas con límites claros o veinte archivos repartidos por `utils/`. Esta skill organiza **el conjunto**: qué apps hay, qué se comparte entre ellas y por dónde no puede cruzar nadie. La arquitectura interna de cada capa la llevan `frontend:architecture` y `backend:architecture`.

## Cuándo usarla

- Arrancar un proyecto con frontend y backend.
- El repositorio es difícil de navegar: `utils/` o `helpers/` gigantes, tipos duplicados, imports cruzados entre capas.
- Antes de pasar a monorepo con paquetes, o de extraer un módulo a servicio aparte.
- Builds o CI lentos porque todo depende de todo.

**No es para:** capas, módulos y estado dentro del frontend → `frontend:architecture` · módulos, capas y puertos dentro del backend → `backend:architecture` · el contenido del contrato entre capas → `contracts`.

## Paso 0: contexto (ambos modos)

1. Mapea la estructura actual: apps, carpetas de primer nivel, gestor de paquetes y workspaces, manifiestos, configuración de build y CI.
2. Mide en lugar de suponer: imports entre capas y módulos (`madge`, `dependency-cruiser`, `nx graph`, `grep` de rutas relativas largas), tamaño de `utils/`/`shared/`, tipos definidos en ambos lados.
3. Identifica el equipo y el ritmo: cuántas personas, si frontend y backend se despliegan juntos, si hay otros clientes (móvil, terceros).
4. Si vas a entrar en una capa, carga su skill de arquitectura (`frontend:architecture`, `backend:architecture`) y su nota de stack; si un plugin no está instalado, avísalo.
5. Si existe `.sdlc/context.md`, léelo y respeta sus convenciones y decisiones ([context.md](../../standards/context.md)).

## Modo Construir

1. **Elige el arquetipo** según el contexto con [patterns.md § Arquetipos](references/patterns.md#arquetipos). Por defecto, el más simple que resuelva el problema.
2. **Módulos de negocio verticales:** el mismo nombre de módulo (`orders`, `billing`) en backend y frontend, con su API pública. Ver [patterns.md § Módulos verticales](references/patterns.md#módulos-verticales).
3. **Lo compartido, mínimo y explícito:** contratos, `ui-kit`, configuración. Ver [patterns.md § Qué se comparte](references/patterns.md#qué-se-comparte).
4. **Reglas de dependencias verificadas** en lint y CI. Ver [patterns.md § Reglas](references/patterns.md#reglas-de-dependencias).
5. **Migración por fases** si partes de un repositorio existente. Ver [patterns.md § Migración strangler](references/patterns.md#migración-strangler).
6. Documenta la decisión en un ADR breve y entrega según [output-formats.md § Construir](../../standards/output-formats.md#modo-construir).

## Modo Auditar

1. Dibuja el grafo de dependencias real entre apps, paquetes y módulos.
2. Busca los síntomas de [patterns.md § Síntomas](references/patterns.md#síntomas).
3. Recorre [checklist.md](references/checklist.md).
4. Propón el arquetipo objetivo y las fases para llegar, sin "big bang".
5. Clasifica con [severity.md](../../standards/severity.md) y entrega según [output-formats.md § Auditar](../../standards/output-formats.md#modo-auditar) con código `FS-TOPO`.

## Principios

1. **El arquetipo más simple que funcione;** un monorepo con herramientas no arregla módulos mal cortados.
2. **Cortar por negocio, no por tipo técnico:** `orders/` antes que `controllers/` + `components/` + `utils/`.
3. **Las dependencias apuntan en una dirección** y se verifican con herramientas, no con disciplina.
4. **Compartir contratos, no lógica:** el frontend nunca importa código de servidor.
5. **Migrar sin parar el producto:** fases pequeñas, cada una desplegable.

## Handoffs

Según [handoffs.md](../../standards/handoffs.md): profundidad máxima de 2, alcance acotado, sin reinvocar skills ya aplicadas y registro de pendientes.

| Disparador (observable) | Skill | Alcance y contexto que se pasa |
| :--- | :--- | :--- |
| El frontend importa configuración, secretos o código del servidor | `frontend:security` | Imports y lo que arrastran al bundle |
| Ciclos o módulos sin API pública dentro del backend | `backend:architecture` | Módulos y ciclos (grafo) |
| Ciclos, features acopladas o imports cruzados dentro del frontend | `frontend:architecture` | Módulos y ciclos (grafo) |
| Tipos o esquemas del cable copiados en ambas capas | `contracts` | Ubicaciones de las copias |
| Vistas con reglas de negocio que afectan a dinero, permisos o estados | `backend:domain-logic` | Vista, regla y endpoint que debería aplicarla |
| Sin verificación de dependencias, workspaces o build incremental en CI | `frontend:tooling` · `backend:tooling` | Configuración de CI y manifiestos |

## Referencias

| Archivo | Cuándo cargarlo |
| :--- | :--- |
| [patterns.md](references/patterns.md) | Siempre: síntomas, arquetipos, módulos, lo compartido, reglas y migración. |
| [checklist.md](references/checklist.md) | Modo Auditar. |

## Skills relacionadas

- `frontend:architecture` y `backend:architecture`: estructura interna de cada capa.
- `contracts`: qué contiene el paquete de contratos compartido.
- `frontend:tooling` y `backend:tooling`: workspaces, builds y CI.
