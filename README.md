# GEDASC - Manual para la ejecucion del Proyecto

*Aplicación web desarrollada para la gestión de entradas y salidas de los aprendices en el Centro Tecnologico de la Amazonia, incluyendo autenticacion de sus equipos por medio de firmas.*

*El proyecto está compuesto por un frontend y un backend conectados a una base de datos PostgreSQL.*


## Requisitos del proyecto

-  Node.js (v24.14.1)
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

>config/db.ts

### Ejemplo:

```ts
user: 'postgres', 
password: 'contraseña',
host: 'localhost',
port: 5432,
database: 'GEDASC'
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