# GEDASC - Manual para la ejecucion del Proyecto

_Aplicación web desarrollada para la gestión de entradas y salidas de los aprendices en el Centro Tecnologico de la Amazonia, incluyendo autenticacion de sus equipos por medio de firmas._

_El proyecto está compuesto por un frontend y un backend conectados a una base de datos PostgreSQL._

## Requisitos del proyecto

- Node.js (v24.14.1)
- PostgreSQL (v17 o superior)

## Estructura del proyecto

```py
GEDASC/
│
├── Database/   # Backend
├── src/        # Frontend
└── README.md
```

---

## Configuración de la base de datos

Crear una base de datos en PostgreSQL con el nombre:

**GEDASC**

Luego, importar el archivo `.sql` incluido en el proyecto

Configurar las credenciales en el archivo:

> config/db.ts

### Ejemplo:

```ts
user: 'postgres',
password: 'contraseña',
host: 'localhost',
port: 5432,
database: 'GEDACS'
```

# Ejecutar el proyecto

## Frontend

Ubicado en la raíz del proyecto:

```bash
npm install
npm run dev
```

## Backend

Ubicado en la carpeta _Database_

```bash
npm install
npx ts-node src/index.ts
```

```bash
## Acceso a la aplicación

Frontend:
http://localhost:5173

Backend:
http://localhost:3000

```

# Versionamiento del Proyecto

## 🔹 Versión 1.1

**Optimización de experiencia de usuario y rendimiento**

- Rediseño completo de la interfaz web
- Eliminación de firma digital para agilizar registros
- Mejora en tiempos de interacción

**Estado:**  
Versión optimizada en velocidad, con reducción de funcionalidades (~60% del alcance original)

---

## 🔹 Versión 1.2

**Reincorporación de seguridad y mejoras estructurales**

- Reimplementación de firma digital
- Rediseño completo de la interfaz
- Datos en tiempo real de aprendices
- Corrección de errores en comunicación Tablet–PC
- Mejora en arquitectura frontend

**Estado:**  
Versión estable y más cercana al objetivo final (~90% del alcance de la versión 1)

---

## 🔹 Versión 1.3

- Base de reportes (sin exportación aún)
- Estructura inicial de datos para analítica

**Estado:**  
Implementado

## 🔹 Versión 1.4

- Exportación a PDF / Excel
- Primeros reportes básicos

**Estado:**  
Implementado

## 🔹 Versión 1.5

- Sistema de roles (Admin vs Celador)
- Permisos básicos

**Estado:**  
Implementado

## 🔹 Versión 1.6

- Gestión de equipos (registro + validación)
- Detección de duplicados

**Estado:**  
Implementado

## 🔹 Versión 1.7

- Notificaciones del sistema
- Alertas por anomalías

**Estado:**  
Implementado

## 🔹 Versión 1.8

- Optimización del scanner (concurrencia y mayor precisión)

**Estado:**  
Implementado

## 🔹 Versión 1.9

- Pulido general e integración de módulos
- Preparación para salto a versión 2.0

**Estado:**  
Implementado

## 🚀 Próxima versión: 2.0

### Leer archivo documentacion/nuevaImplementacion/documentacion-v2.md
