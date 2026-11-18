# SDLC Skills — índice para agentes

Esta carpeta contiene tres colecciones de skills (instrucciones de trabajo) para auditar y construir este proyecto:

- `frontend/skills/` — 18 skills de frontend (Vue, React, Angular).
- `backend/skills/` — 18 skills de backend (Node/TypeScript, Python, Java).
- `fullstack/skills/` — 5 skills entre capas (contratos API ↔ cliente, topología, diagnóstico de flujos, construcción de funcionalidades y auditoría conjunta). Usan las de frontend y backend.

## Cómo usar una skill

Cada skill es una carpeta con un `SKILL.md` (cuándo usarla, modos, flujo y principios) y una carpeta `references/` con checklists, patrones y notas por stack. Para aplicar una skill: **lee su `SKILL.md` y sigue sus instrucciones**, cargando las referencias que indique cuando las necesite. Los enlaces dentro de cada skill son relativos a su propio archivo.

## Cómo resolver referencias entre skills

Las skills se mencionan entre sí con la forma `<plugin>:<skill>`, o solo `<skill>` dentro del mismo plugin. Si no tienes una herramienta de skills que las cargue por nombre, tradúcelas así:

| Referencia | Archivo |
| :--- | :--- |
| `frontend:<skill>` (o `<skill>` dentro de una skill de frontend) | `.sdlc-skills/frontend/skills/<skill>/SKILL.md` |
| `backend:<skill>` (o `<skill>` dentro de una skill de backend) | `.sdlc-skills/backend/skills/<skill>/SKILL.md` |
| `fullstack:<skill>` (o `<skill>` dentro de una skill de fullstack) | `.sdlc-skills/fullstack/skills/<skill>/SKILL.md` |
| `standards/…` | `.sdlc-skills/<plugin>/standards/…` (severidad, formato de informe, viewports) |

Las menciones a `domains/…` se refieren a material del repositorio de origen que no está copiado aquí: indícalo como "fuera de alcance" en lugar de buscarlo.

## Handoffs y contexto compartido

Las skills pueden pasarse trabajo entre ellas según `.sdlc-skills/fullstack/standards/handoffs.md` (profundidad máxima de 2, sin reinvocar, aviso de coste). El contexto compartido vive en `.sdlc/context.md` en la raíz de este proyecto (formato en `.sdlc-skills/fullstack/standards/context.md`): léelo antes de empezar si existe.

## Puntos de entrada

| Objetivo | Skill |
| :--- | :--- |
| Auditoría completa del frontend | `.sdlc-skills/frontend/skills/audit/SKILL.md` |
| Auditoría completa del backend | `.sdlc-skills/backend/skills/audit/SKILL.md` |
| Auditoría de la aplicación completa (frontend + backend) | `.sdlc-skills/fullstack/skills/audit/SKILL.md` |
| Desajustes entre la API y el cliente | `.sdlc-skills/fullstack/skills/contracts/SKILL.md` |
| Construir una funcionalidad que toca varias skills o ambas capas | `.sdlc-skills/fullstack/skills/feature/SKILL.md` |
| Un flujo que falla sin saber en qué capa | `.sdlc-skills/fullstack/skills/flow-diagnosis/SKILL.md` |
| Un área concreta | La skill de esa área (ver los catálogos en `frontend/README.md`, `backend/README.md` y `fullstack/README.md`) |

## Estructura de este proyecto (GEDASC)

- Frontend: raíz del repositorio (`src/`, Vue 3 + Pinia + Vite + Tailwind + TypeScript).
- Backend: `DataBase/` (Express + PostgreSQL con `pg` + JWT + Socket.IO, TypeScript).
- Código compartido: `Shared/`.
