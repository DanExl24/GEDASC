# Checklist de auditoría — arquitectura

Severidad orientativa entre corchetes; ajústala según impacto real ([severity.md](../../../standards/severity.md)).

## 1. Organización

- [ ] La estructura agrupa por dominio/feature y no solo por tipo de archivo. **[MEDIUM]** si la app es mediana o grande y está plana.
- [ ] Es fácil responder "¿dónde está todo lo de X?": la feature cabe en una carpeta.
- [ ] No hay carpetas cajón de sastre (`utils/`, `helpers/`, `common/`) con cientos de líneas sin relación. **[LOW–MEDIUM]**
- [ ] `shared/` contiene solo código genérico y sin dependencias de negocio.
- [ ] La convención de nombres de archivos y carpetas es consistente (kebab-case o PascalCase, pero una).

## 2. Dependencias

- [ ] No hay dependencias circulares entre módulos. **[MEDIUM]**; **[HIGH]** si causan errores de inicialización (`undefined` en import) o rompen HMR.
- [ ] `shared/` no importa nada de `features/`. **[MEDIUM]**
- [ ] Las features no importan los internos de otras features; usan su API pública o se componen en una capa superior. **[MEDIUM]**
- [ ] Los límites se hacen cumplir con lint/herramienta en CI. **[LOW]** si no existe; **[MEDIUM]** si el proyecto ya sufre violaciones.
- [ ] Existen alias de rutas; no hay imports del tipo `../../../../`. **[LOW]**

## 3. API pública

- [ ] Cada feature expone un punto de entrada explícito (`index.ts`).
- [ ] No hay barrels en carpetas internas que oculten ciclos o arrastren módulos innecesarios. **[LOW]**
- [ ] La API pública no usa `export *` sin revisar.

## 4. Responsabilidades

- [ ] Las páginas/vistas componen; no contienen llamadas HTTP directas. **[MEDIUM]** → detalle en skill `data-fetching`.
- [ ] La lógica de negocio no está en componentes de UI. **[MEDIUM]**; **[HIGH]** si son reglas que deberían estar en el backend (precios, permisos). → escalar a backend.
- [ ] No hay componentes de más de ~400–500 líneas que mezclen varias responsabilidades. **[LOW–MEDIUM]**
- [ ] Los componentes de `shared/ui` no conocen el dominio (no reciben un `Order`, reciben props primitivas o genéricas).

## 5. Escala y decisiones

- [ ] La complejidad de la arquitectura es proporcional al tamaño (ni plana en una app grande ni FSD/monorepo en una pequeña). **[INFO–MEDIUM]**
- [ ] En monorepo: los paquetes declaran sus dependencias y no importan rutas internas de otros paquetes.
- [ ] Las decisiones no obvias están documentadas (ADR o equivalente). **[INFO]**
- [ ] El build distingue configuración por entorno sin código condicional disperso.

## Cómo inspeccionar rápido

- Árbol: `tree src -L 3 -d` o `Get-ChildItem src -Directory -Recurse -Depth 2`.
- Archivos más grandes: ordenar por líneas los `.ts/.tsx/.vue` de `src`.
- Ciclos: `npx madge --circular --extensions ts,tsx,vue src` (si el usuario permite ejecutar npx).
- Imports cruzados: buscar `from '@/features/` dentro de `src/features/<x>/` que apunten a otra feature distinta de `<x>`.
- Contaminación de shared: buscar `features/` dentro de `src/shared/`.
