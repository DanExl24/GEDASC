# Checklist de auditoría: topología

Severidad orientativa; ajústala con [severity.md](../../../standards/severity.md).

## Estructura

- [ ] El arquetipo (monolito modular, monorepo, hexagonal) es explícito y encaja con el tamaño del equipo y el número de apps. *(LOW–MEDIUM)*
- [ ] Los módulos se cortan por negocio con el mismo nombre en ambas capas. *(MEDIUM)*
- [ ] Cada módulo expone una API pública y oculta sus internos. *(MEDIUM)*
- [ ] No hay `utils/`/`helpers/` gigantes con responsabilidades mezcladas. *(MEDIUM)*

## Dependencias

- [ ] El frontend no importa código del servidor (modelos, servicios, configuración). *(HIGH; CRITICAL si arrastra secretos o credenciales al bundle)*
- [ ] No hay imports a los internos de otros módulos. *(MEDIUM)*
- [ ] No hay ciclos entre módulos o paquetes. *(MEDIUM)*
- [ ] Las reglas de dependencias se verifican en lint o CI (ESLint, Nx, dependency-cruiser, import-linter, ArchUnit). *(MEDIUM)*
- [ ] Las apps declaran sus dependencias internas en su manifiesto; sin rutas relativas que salen de la app. *(LOW)*

## Lo compartido

- [ ] Los contratos del cable viven en un único sitio y ambos lados los importan. *(MEDIUM si hay copias en espejo → `contracts`)*
- [ ] El paquete compartido no contiene lógica de negocio, acceso a datos ni secretos. *(MEDIUM; HIGH si contiene reglas de dinero o permisos que el servidor no revalida)*
- [ ] Las reglas de negocio con impacto (precios, permisos, estados) viven en el backend; la UI solo las muestra. *(HIGH)*

## Herramientas y CI

- [ ] Workspaces y lockfile únicos; versiones de herramientas fijadas. *(LOW)*
- [ ] Build, lint y tests incrementales por app o paquete si el repositorio es grande. *(LOW–MEDIUM)*
- [ ] La generación de tipos del contrato se comprueba en CI. *(MEDIUM)*

## Migración

- [ ] Si hay una reestructuración en curso, sigue fases desplegables y cada fase deja reglas activas. *(MEDIUM si es un "big bang" sin fases)*
- [ ] Hay un ADR o documento breve con el arquetipo y las reglas. *(LOW)*
