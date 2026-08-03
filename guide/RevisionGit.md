# Informe de revisión de GEDASC

## Descripción general

**GEDASC** (Gestor de Entradas Digital Automático del SENA-CTA) es una
aplicación web desarrollada en **Node.js** con **Express** y
**PostgreSQL** para gestionar el control de ingreso y salida de
aprendices y visitantes en el Centro Tecnológico de la Amazonia. El
repositorio combina un backend en TypeScript con **socket.io** para
comunicación en tiempo real y un frontend en **Vue 3** (no analizado en
detalle), además de scripts y bases de datos compartidos. El `README`
describe el proceso de creación de la base de datos y la configuración
inicial; por ejemplo, indica que se debe crear una base de datos
`GEDASC` en PostgreSQL, importar un archivo `.sql` y configurar las
credenciales en `config/db.ts`. También proporciona valores de ejemplo
para el usuario, contraseña, host y
puerto[\[1\]](https://github.com/DanExl24/GEDASC#:~:text=Estructura%20del%20proyecto)
y explica cómo ejecutar el frontend y el backend
localmente[\[2\]](https://github.com/DanExl24/GEDASC#:~:text=Ejecutar%20el%20proyecto).
El proyecto incluye un historial de versiones con mejoras como rediseño
de interfaz, firma digital, estadísticas en tiempo real y sistema de
roles[\[3\]](https://github.com/DanExl24/GEDASC#:~:text=Versi%C3%B3n%201).

## Arquitectura y estructura del repositorio

El árbol de directorios incluye dos áreas principales:

- `database/`: contiene el backend en TypeScript. Dentro de `src` hay
  subcarpetas como `config` (configuración de base de datos),
  `controllers` (lógica de negocio), `middlewares` (autenticación y
  control de acceso), `routes` (definiciones de rutas), `sockets`
  (eventos de tiempo real) y `types`. También existe una carpeta `query`
  con definiciones SQL y `handlersMachine` para operaciones sobre
  equipos.
- `src/`: alberga el frontend en Vue 3, con componentes, servicios y
  rutas (no cubierto en esta revisión). Hay además directorios `public`,
  `Shared/types` y scripts auxiliares.

El proyecto usa **TypeScript** tanto en backend como frontend, lo que
promueve tipado fuerte y mejor mantenimiento. Sin embargo, varios
archivos de configuración y credenciales se encuentran dentro del
repositorio y presentan riesgos de seguridad.

## Backend (Node.js + Express + PostgreSQL)

### Configuración de la base de datos y variables de entorno

El archivo `database/src/config/db.ts` crea un `Pool` de PostgreSQL con
valores codificados: usuario `postgres`, contraseña vacía, host
`localhost`, puerto `5432` y base de datos
`GEDACS`[\[4\]](https://github.com/DanExl24/GEDASC/blob/master/database/src/config/db.ts#L2-L10).
Esta práctica funciona en desarrollo pero es insegura en producción; lo
ideal es leer estas credenciales de variables de entorno y excluirlas
del control de versiones. El `README` sugiere editar estos parámetros
pero no proporciona un mecanismo automático. También se observa la
ausencia de un fichero `.env.example` que guíe a los desarrolladores en
la configuración de variables como `JWT_SECRET`, puerto de la aplicación
o claves de servicio.

### Servidor y configuración básica

El archivo principal `database/src/index.ts` importa módulos, configura
CORS y crea una instancia de Express y de `socket.io`. Utiliza
`dotenv.config()` para cargar variables de entorno, define rutas
(`/api/auth`, `/api/admin`, `/api/entry`, etc.) y delega la lógica a los
controladores. Además inicializa los sockets para características como
la firma digital y el escáner de códigos QR, y escucha en el puerto
`3000`[\[5\]](https://github.com/DanExl24/GEDASC/blob/master/database/src/index.ts#L21-L111).
Esta estructura modular facilita la separación de responsabilidades,
pero la presencia de sockets en el mismo proceso puede generar cuellos
de botella si no se dimensiona adecuadamente.

### Autenticación y control de acceso

Las rutas de autenticación (`auth.routes.ts`) utilizan controladores
para iniciar sesión y crear tokens JWT. En `auth.controller.ts` se
observa que al iniciar sesión se recupera el usuario por correo y se
compara la contraseña en texto plano directamente con la almacenada en
la base de
datos[\[6\]](https://github.com/DanExl24/GEDASC/blob/master/database/src/controllers/auth.controller.ts#L5-L45).
Esto indica que las contraseñas se almacenan sin hashing, lo cual es una
vulnerabilidad crítica. Aunque se utiliza `jsonwebtoken` para generar
tokens firmados con `process.env.JWT_SECRET`, al no haber hashing
cualquiera que acceda a la base de datos podría leer las contraseñas.
Además, en caso de que `JWT_SECRET` no se defina, el controlador lanza
un error.

El archivo `admin.middleware.ts` implementa dos middlewares:
`authMiddleware`, que verifica el token JWT, y `requireRole`, que
restringe el acceso a rutas según los roles (por ejemplo, `ADMIN` o
`CELADOR`)[\[7\]](https://github.com/DanExl24/GEDASC/blob/master/database/src/middlewares/admin.middleware.ts#L14-L40).
Es una buena práctica separar la verificación de autenticación de la
autorización, aunque se debe garantizar que el secreto JWT se obtenga de
una fuente segura (variables de entorno). Las funciones manejan los
errores y devuelven respuestas JSON claras cuando falta el token o es
inválido.

### Controladores y lógica de negocio

Los controladores en `controllers/` implementan la mayoría de
operaciones del sistema. Algunas observaciones destacadas:

- **Consultas parametrizadas**: en general, las funciones utilizan
  `pool.query` con parámetros para evitar inyecciones SQL. Por ejemplo,
  en `admin.controller.ts` se construyen cláusulas `WHERE` dinámicas y
  se pasan como parámetros a
  `pool.query`[\[8\]](https://github.com/DanExl24/GEDASC/blob/master/database/src/controllers/admin.controller.ts#L125-L177).
  Esta práctica reduce el riesgo de inyección, aunque convendría aislar
  la lógica de construcción de consultas en un servicio o utilizar un
  ORM como TypeORM o Prisma.
- **Transacciones y concurrencia**: en `entry.controller.ts` (no
  mostrado por brevity) se usan transacciones para agregar registros de
  ingreso o crear máquinas, asegurando que las operaciones se ejecuten
  de forma atómica. Esto es esencial para mantener la coherencia en
  situaciones de alta concurrencia.
- **Control de errores**: la mayoría de las funciones utilizan bloques
  `try/catch` y devuelven códigos de estado HTTP junto con un mensaje.
  Sin embargo, el manejo de excepciones podría centralizarse en un
  middleware de error para evitar repetición y garantizar respuestas
  consistentes. Además, se utilizan sentencias `console.log` que podrían
  reemplazarse por un sistema de logging configurable (p. ej.,
  `winston`).
- **Lógica de negocio**: hay controladores específicos para operaciones
  como detección de entradas y salidas, registro de máquinas (equipos) y
  consultas de estadísticas. Las funciones de servicio
  (`useAdminService.ts`) encapsulan operaciones complejas, pero en
  ocasiones construyen condiciones dinámicas usando concatenación de
  cadenas; aun cuando se utilizan parámetros, conviene revisar que no
  haya posibilidad de inyección o de filtrado insuficiente.

### Comunicación en tiempo real y firma digital

El servidor incorpora `socket.io` para manejar eventos relacionados con
la firma digital y la interacción con dispositivos móviles. En
`index.ts` se inicializa el socket y se pasan los eventos a módulos como
`initIO` y
`initSockets`[\[5\]](https://github.com/DanExl24/GEDASC/blob/master/database/src/index.ts#L21-L111).
Aunque no se analizó el código de eventos, es importante que estos
canales controlen adecuadamente la autenticación del cliente y validen
los datos recibidos para evitar ataques de inyección o saturación.

### Observaciones de seguridad y calidad

- **Credenciales expuestas**: el archivo de configuración de la base de
  datos contiene credenciales en
  claro[\[4\]](https://github.com/DanExl24/GEDASC/blob/master/database/src/config/db.ts#L2-L10).
  Además, el `README` proporciona datos de ejemplo con contraseña
  `contraseña`[\[1\]](https://github.com/DanExl24/GEDASC#:~:text=Estructura%20del%20proyecto).
  Es fundamental almacenar estos valores en variables de entorno y
  proveer un archivo `.env.example` que sirva de plantilla sin exponer
  datos reales.
- **Contraseñas sin hashing**: la comparación de contraseñas en texto
  plano en
  `auth.controller.ts`[\[6\]](https://github.com/DanExl24/GEDASC/blob/master/database/src/controllers/auth.controller.ts#L5-L45)
  implica que la columna `password` de la tabla `usuarios` almacena
  contraseñas tal cual. Se recomienda utilizar una librería como
  `bcryptjs` para hash y salting, y modificar el proceso de registro y
  autenticación para utilizar estas funciones.
- **Secretos JWT y claves**: el código espera que `JWT_SECRET` esté
  definido en el entorno, pero no incluye un ejemplo ni valida su
  ausencia más allá de lanzar un error. Un fallo en la configuración
  podría permitir tokens inseguros. Debe proporcionarse un valor seguro
  y rotarlo periódicamente.
- **Gestión de roles y permisos**: la implementación de `requireRole` es
  adecuada para delimitar permisos. No obstante, debería añadirse un
  control de acceso más granular en las consultas (por ejemplo, filtrar
  datos según el usuario) y restringir la lectura de información
  sensible.
- **Validación de entradas**: aunque muchas consultas usan parámetros,
  el código no incluye validaciones exhaustivas de los datos de entrada
  (e.g., longitud, formato de correo). Utilizar una librería de
  validación (como `Joi` o `Zod`) mejoraría la robustez.
- **Documentación de API**: el proyecto carece de documentación formal
  (como Swagger u OpenAPI). Dado que ofrece múltiples endpoints (auth,
  admin, entry, etc.), sería beneficioso generar una especificación que
  facilite la integración de clientes externos y la realización de
  pruebas.

## Frontend (Vue)

El frontend se encuentra en la carpeta `src/`. Aunque no se revisó a
profundidad, el `README` indica que se trata de una aplicación Vue 3 con
diferentes vistas y componentes para los roles de administrador y
celador. Algunas buenas prácticas recomendadas para el frontend
incluyen:

- **Uso seguro de tokens**: almacenar el token JWT en `localStorage` o
  `sessionStorage` implica exposición a ataques XSS. Se recomienda
  utilizar cookies HTTP-only y configurar mecanismos de refresco de
  tokens.
- **Validación en el cliente**: validar formularios y entradas antes de
  enviarlas al servidor mejora la experiencia de usuario y previene
  errores.
- **Gestión de estado y modularidad**: emplear soluciones como
  Pinia/Vuex y componentes bien estructurados facilita el mantenimiento
  y escalabilidad de la interfaz.

## Recomendaciones generales

1.  **Variables de entorno y configuración segura**: mover todas las
    credenciales y secretos (base de datos, JWT, claves API) a variables
    de entorno; proporcionar un archivo `.env.example` para ilustrar los
    parámetros necesarios y evitar subir archivos `.env` reales al
    repositorio.
2.  **Hashing de contraseñas**: implementar hashing y salting con
    bibliotecas como `bcryptjs`. Almacenar únicamente hashes en la base
    de datos y comparar usando la función de verificación de la
    librería. Actualizar los flujos de registro e inicio de sesión para
    soportar este cambio.
3.  **Control de acceso robusto**: revisar todos los puntos de entrada
    para garantizar que sólo usuarios autorizados ejecutan determinadas
    acciones. Incorporar verificación de permisos en las consultas y no
    sólo en las rutas.
4.  **Validación de datos**: integrar librerías de validación (Joi/Zod)
    para asegurar que los parámetros recibidos cumplen los formatos
    esperados. Esto previene fallos lógicos y evita que datos mal
    formados lleguen a la base de datos.
5.  **Gestión de errores y logs**: crear un middleware global de manejo
    de errores que capture excepciones y devuelva respuestas
    consistentes con códigos HTTP apropiados. Utilizar una librería de
    logging configurable para registrar eventos relevantes y errores sin
    exponer detalles sensibles al cliente.
6.  **Documentación y pruebas**: generar documentación de la API (por
    ejemplo con Swagger) para facilitar el consumo y mantenimiento.
    Incorporar pruebas unitarias e integrales (con Jest o Mocha) para
    garantizar que los controladores y servicios funcionan correctamente
    tras cambios.
7.  **Mejoras de arquitectura**: evaluar el uso de un ORM como
    **TypeORM** o **Prisma** para gestionar la base de datos de forma
    más estructurada, simplificar la construcción de consultas y
    beneficiarse de migraciones automáticas. También se podrían agrupar
    funciones de consulta en servicios reutilizables para reducir
    duplicación.
8.  **Optimización de sockets**: revisar la implementación de
    `socket.io` para asegurar que sólo usuarios autenticados se conectan
    y que los eventos están correctamente validados. Considerar mover la
    lógica de sockets a un proceso separado o usar colas de mensajería
    si el tráfico es elevado.
9.  **Seguridad del frontend**: en el cliente, utilizar cookies
    HTTP‑only para almacenar tokens, implementar medidas de protección
    contra XSS y CSRF, y aplicar políticas de seguridad en cabeceras
    (Content‑Security‑Policy, etc.).

## Conclusiones

GEDASC es un proyecto ambicioso que integra un backend con Node.js y
PostgreSQL, un frontend moderno y funcionalidades en tiempo real para
gestionar accesos en un entorno educativo. Su estructura modular y el
uso de TypeScript son puntos fuertes. Sin embargo, se identifican
vulnerabilidades significativas como el almacenamiento de contraseñas en
texto plano y la exposición de credenciales en el
código[\[4\]](https://github.com/DanExl24/GEDASC/blob/master/database/src/config/db.ts#L2-L10)[\[6\]](https://github.com/DanExl24/GEDASC/blob/master/database/src/controllers/auth.controller.ts#L5-L45).
Adoptar buenas prácticas de seguridad, mejorar la gestión de errores y
documentar la API elevará la calidad del proyecto y lo hará más seguro y
mantenible. La implementación de hashing de contraseñas, uso de
variables de entorno y validación estricta de entradas son pasos
esenciales para evolucionar hacia una solución de nivel profesional.

---

[\[1\]](https://github.com/DanExl24/GEDASC#:~:text=Estructura%20del%20proyecto)
[\[2\]](https://github.com/DanExl24/GEDASC#:~:text=Ejecutar%20el%20proyecto)
[\[3\]](https://github.com/DanExl24/GEDASC#:~:text=Versi%C3%B3n%201)
GitHub - DanExl24/GEDASC: Sistema de Control de Acceso para el Centro de
Formacion del SENA · GitHub

<https://github.com/DanExl24/GEDASC>

[\[4\]](https://github.com/DanExl24/GEDASC/blob/master/database/src/config/db.ts#L2-L10)
db.ts

<https://github.com/DanExl24/GEDASC/blob/master/database/src/config/db.ts>

[\[5\]](https://github.com/DanExl24/GEDASC/blob/master/database/src/index.ts#L21-L111)
index.ts

<https://github.com/DanExl24/GEDASC/blob/master/database/src/index.ts>

[\[6\]](https://github.com/DanExl24/GEDASC/blob/master/database/src/controllers/auth.controller.ts#L5-L45)
auth.controller.ts

<https://github.com/DanExl24/GEDASC/blob/master/database/src/controllers/auth.controller.ts>

[\[7\]](https://github.com/DanExl24/GEDASC/blob/master/database/src/middlewares/admin.middleware.ts#L14-L40)
admin.middleware.ts

<https://github.com/DanExl24/GEDASC/blob/master/database/src/middlewares/admin.middleware.ts>

[\[8\]](https://github.com/DanExl24/GEDASC/blob/master/database/src/controllers/admin.controller.ts#L125-L177)
admin.controller.ts

<https://github.com/DanExl24/GEDASC/blob/master/database/src/controllers/admin.controller.ts>
