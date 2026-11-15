# Syllab

**La agenda personal de los estudiantes.** Plataforma web Full Stack para organizar asignaturas, períodos académicos, evaluaciones, tareas y subtareas.

Desarrollo Web y Móvil · Segundo Semestre 2026 · Hito 3 (caso 3.2: Agenda académica personal)

## Integrantes

| Integrante | Usuario GitHub |
|---|---|
| Sebastián Hidalgo | sebastianihg05 |
| Hector Peña | htoletole |
| Vanessa Lagos | vlagostorres |
| Claudio Ojeda | claudio6767 |

## Problema y usuarios

Un estudiante universitario maneja evaluaciones, tareas y proyectos de varios ramos al mismo tiempo. Esa información suele quedar repartida entre cuadernos, mensajes y la memoria, por lo que se olvidan fechas y no se ve qué es urgente. Syllab junta todo en un solo lugar: el estudiante registra sus ramos por período, sus evaluaciones y sus tareas, y la aplicación le muestra qué está atrasado, qué vence pronto y cómo va su avance.

**Usuario objetivo:** estudiantes de educación superior que quieren planificar su semestre.

## Continuidad con el Taller 2

| | Detalle |
|---|---|
| **Se conserva** | El caso, las pantallas (login, dashboard, tareas, ramos, calendario), el diseño visual, los componentes y el flujo de navegación del Taller 2. La API pública Nager.Date para los feriados. |
| **Se modifica** | Los datos ya no se guardan en `localStorage`: ahora se leen y guardan en la API propia. El login deja de usar `users.json` y pasa a la base de datos con contraseñas cifradas y token de sesión. Los ramos ahora pertenecen a un período académico. |
| **Se amplía** | Períodos académicos, evaluaciones con ponderación y nota, subtareas, seguimiento de avance y cumplimiento, dashboard de pendientes y vencimientos, historial de actividad y eventos de planificación en MongoDB, documentación Swagger, pruebas y Docker Compose. |

### Funcionalidades del caso 3.2

| Funcionalidad obligatoria | Dónde está |
|---|---|
| Gestión de asignaturas y períodos académicos | Pantalla Ramos: selector de período, crear/eliminar períodos, crear/editar/eliminar ramos |
| Evaluaciones, tareas y subtareas | Detalle del ramo (evaluaciones), pantalla Tareas y detalle de cada tarea (subtareas) |
| Calendario, fechas, prioridades y estados | Pantalla Calendario (tareas, evaluaciones y feriados) y filtros de Tareas |
| Seguimiento de avance y cumplimiento | Detalle del ramo (avance de tareas, ponderación rendida, promedio parcial) y Dashboard (cumplimiento a tiempo) |
| Dashboard de pendientes y vencimientos | Inicio: vencidas, próximas 7 días y próximas evaluaciones |
| Historial de actividad y cambios | Inicio: actividad reciente; detalle de tarea: historial de fechas (MongoDB) |

## Arquitectura

```mermaid
flowchart LR
  A["React + Vite<br/>(frontend)"] -- "HTTP/JSON + token" --> B["API REST NestJS<br/>/api"]
  B -- "Prisma 7 (adaptador pg)" --> C[("PostgreSQL<br/>Neon o Docker")]
  B -- "Mongoose" --> D[("MongoDB<br/>Atlas o Docker")]
  A -- "fetch" --> E["Nager.Date<br/>(API pública)"]
  B -. "documentación" .-> F["Swagger<br/>/api/docs"]
```

| Componente | Responsabilidad |
|---|---|
| React (`src/`) | Pantallas, componentes, servicios HTTP (`src/services/*Api.ts`), formularios y estados de carga, error y vacío |
| API REST (`backend/src/`) | Controladores, servicios con las reglas de negocio, DTO con validaciones, filtro de errores y autenticación JWT |
| PostgreSQL | Datos estructurados y transaccionales: usuarios, períodos, asignaturas, evaluaciones, tareas y subtareas |
| MongoDB | Historial de actividad y eventos de planificación |
| Swagger | Contrato y pruebas de la API en `/api/docs` |
| Docker Compose | Levanta PostgreSQL, MongoDB, backend y frontend |

### Estructura del backend

```
backend/
├── prisma/            schema.prisma, migraciones y datos de prueba (seed.ts)
├── prisma.config.ts   conexión de Prisma 7
├── src/
│   ├── auth/          registro, login, recuperación y AuthGuard
│   ├── periodos/      CRUD de períodos académicos
│   ├── asignaturas/   CRUD de ramos y cálculo de avance
│   ├── evaluaciones/  CRUD de evaluaciones
│   ├── tareas/        CRUD de tareas
│   ├── subtareas/     CRUD de subtareas
│   ├── dashboard/     resumen de pendientes, vencimientos y avance
│   ├── historial/     MongoDB: historial de actividad
│   ├── planificacion/ MongoDB: eventos de planificación
│   ├── prisma/        cliente de Prisma
│   └── comun/         fechas, filtro de errores y utilidades
└── test/              pruebas e2e
```

## Tecnologías y versiones

| Parte | Tecnologías |
|---|---|
| Frontend | React 19.2, Vite 8, TypeScript 6.0, Bootstrap 5.3, React Router 7 |
| Backend | Node.js 24, NestJS 12.3, TypeScript 6.0, Prisma 7.10, Mongoose 9.12, class-validator, JWT, bcryptjs |
| Bases de datos | PostgreSQL 17 (Docker) o Neon; MongoDB 8 (Docker) o MongoDB Atlas |
| Documentación y pruebas | Swagger (@nestjs/swagger 12), Jest 30, Supertest |
| Ejecución | Docker Compose, nginx (sirve el frontend compilado) |

## Modelo de datos SQL (PostgreSQL)

```mermaid
erDiagram
  USUARIOS ||--o{ PERIODOS : tiene
  USUARIOS ||--o{ TAREAS : tiene
  PERIODOS ||--o{ ASIGNATURAS : agrupa
  ASIGNATURAS ||--o{ EVALUACIONES : tiene
  ASIGNATURAS ||--o{ TAREAS : tiene
  TAREAS ||--o{ SUBTAREAS : tiene

  USUARIOS { int id PK; string username UK; string password }
  PERIODOS { int id PK; string nombre; date fechaInicio; date fechaFin; int usuarioId FK }
  ASIGNATURAS { int id PK; string codigo; string nombre; enum modalidad; string color; int periodoId FK }
  EVALUACIONES { int id PK; string nombre; enum tipo; date fecha; int ponderacion; float nota; int asignaturaId FK }
  TAREAS { int id PK; string nombre; enum estado; enum prioridad; date fecha; string horaEntrega; int asignaturaId FK }
  SUBTAREAS { int id PK; string nombre; boolean completada; int tareaId FK }
```

Restricciones del modelo:

- Claves foráneas con borrado en cascada (al borrar un ramo se borran sus tareas y evaluaciones) y `RESTRICT` para no borrar un período con ramos.
- Únicos: `username`; nombre del período por usuario; código y nombre del ramo dentro del período.
- `CHECK` en la base: el período termina después de empezar, ponderación entre 1 y 100, nota entre 1.0 y 7.0, hora con formato `HH:mm`.
- Las migraciones están en `backend/prisma/migrations` y los datos de prueba en `backend/prisma/seed.ts`.

## MongoDB: por qué y para qué

| Colección | Qué guarda | Dónde se usa |
|---|---|---|
| `historial_actividad` | Cada acción del usuario (crear, editar, eliminar, completar, ingresar) con el antes y el después de los campos que cambiaron | Inicio → Actividad reciente; `GET /api/historial` |
| `eventos_planificacion` | Cada vez que se programa, se mueve o se quita la fecha de una tarea o evaluación | Detalle de tarea → Historial de fechas; Inicio → "Lo que más has postergado" (agregación) |

**Por qué un modelo documental:** son registros que solo se agregan y nunca se editan, cada uno guarda campos distintos según lo que cambió (el objeto `cambios` y el `detalle` varían por entidad), no necesitan relaciones y se consultan por usuario y fecha. Guardar esto en SQL obligaría a tablas con muchas columnas vacías o a texto JSON sin estructura.

**Por qué no es duplicación:** PostgreSQL guarda el estado actual (cómo está la tarea ahora) y MongoDB guarda la historia (cómo llegó a ese estado). Ninguna pantalla lee el mismo dato desde las dos bases. Si MongoDB falla, la operación en PostgreSQL igual se guarda y el error queda en la consola del backend.

## API REST

Todas las rutas parten con `/api`. Las rutas marcadas con 🔒 necesitan el token del login en la cabecera `Authorization: Bearer <token>`.

**Swagger:** con el backend arriba, abrir http://localhost:3000/api/docs, iniciar sesión con `POST /api/auth/login`, copiar el `token` y pegarlo en el botón **Authorize**.

| Método | Ruta | Para qué |
|---|---|---|
| POST | `/auth/registro` | Crear cuenta (también crea el período actual) |
| POST | `/auth/login` | Iniciar sesión, devuelve el token |
| POST | `/auth/restablecer` | Restablecer la contraseña (simulado) |
| GET 🔒 | `/auth/perfil` | Datos del usuario con sesión |
| GET / POST 🔒 | `/periodos` | Listar / crear períodos |
| PATCH / DELETE 🔒 | `/periodos/:id` | Editar / eliminar período |
| GET / POST 🔒 | `/asignaturas` | Listar (filtro `periodoId`) / crear ramos |
| GET / PATCH / DELETE 🔒 | `/asignaturas/:id` | Detalle con avance / editar / eliminar ramo |
| GET / POST 🔒 | `/evaluaciones` | Listar (filtros `asignaturaId`, `desde`, `hasta`) / crear |
| PATCH / DELETE 🔒 | `/evaluaciones/:id` | Editar (por ejemplo, poner la nota) / eliminar |
| GET / POST 🔒 | `/tareas` | Listar (filtros `estado`, `prioridad`, `asignaturaId`, `desde`, `hasta`, `q`) / crear |
| GET / PATCH / DELETE 🔒 | `/tareas/:id` | Detalle / editar / eliminar tarea |
| POST 🔒 | `/tareas/:tareaId/subtareas` | Agregar subtarea |
| PATCH / DELETE 🔒 | `/subtareas/:id` | Marcar o editar / eliminar subtarea |
| GET 🔒 | `/dashboard` | Pendientes, vencidas, próximas, evaluaciones, cumplimiento y avance |
| GET 🔒 | `/historial` y `/historial/:entidad/:id` | Historial de actividad (MongoDB) |
| GET 🔒 | `/planificacion`, `/planificacion/reprogramadas` y `/planificacion/:entidad/:id` | Eventos de planificación (MongoDB) |
| GET | `/salud` | Estado de la API, PostgreSQL y MongoDB |

### Reglas de negocio

| Regla | Respuesta |
|---|---|
| No se repite el ID ni el nombre de un ramo dentro del mismo período | 409 |
| Una evaluación debe caer dentro de las fechas del período de su ramo | 400 |
| Las ponderaciones de las evaluaciones de un ramo no pueden pasar de 100% | 400 |
| Una tarea no se puede completar si tiene subtareas pendientes; si se le agrega una pendiente, vuelve a "En progreso" | 409 |
| No se puede eliminar un período que tiene ramos | 409 |
| Cada usuario solo ve y modifica sus propios datos | 404 |
| Contraseñas de al menos 8 caracteres, guardadas con bcrypt | 400 |

Los errores siempre responden `{ statusCode, message, error }` sin mostrar detalles internos ni credenciales.

## API pública: Nager.Date

| | |
|---|---|
| Documentación | https://date.nager.at/Api |
| Endpoint | `GET https://date.nager.at/api/v3/PublicHolidays/{año}/CL` |
| Datos que se usan | `date` y `localName` de cada feriado |
| Dónde se ve | Calendario: días feriados marcados y aviso "Feriado" en la lista del día |
| Si falla | El calendario muestra "No se pudieron cargar los feriados" y sigue funcionando sin ellos |
| Claves | No necesita clave ni registro |

**Se integra desde el frontend** porque no requiere clave (no hay nada que esconder en el backend), permite llamadas desde el navegador (CORS abierto) y así el backend queda dedicado al dominio de la agenda. La API pública es complementaria: los datos de la agenda vienen siempre de la API propia.

## Cómo ejecutar

### Opción 1: todo con Docker Compose

Requisitos: Docker Desktop.

1. Copiar el archivo de variables (el `.env` nunca se sube al repositorio):

   ```bash
   cp .env.example .env
   ```

2. Levantar todo:

   ```bash
   docker compose up --build
   ```

3. Abrir:
   - Frontend: http://localhost:5173
   - API: http://localhost:3000/api
   - Swagger: http://localhost:3000/api/docs

Al partir, el backend aplica las migraciones y carga los datos de prueba. Usuarios de prueba: **Pepe / pepe12345** (con ramos, evaluaciones y tareas de ejemplo) y **Ana / ana123456** (cuenta vacía).

| Servicio | Puerto | Imagen |
|---|---|---|
| postgres | 5432 | postgres:17-alpine |
| mongo | 27017 | mongo:8 |
| backend | 3000 | se construye desde `backend/Dockerfile` |
| frontend | 5173 | se construye desde `Dockerfile` (nginx) |

### Opción 2: usar Neon y MongoDB Atlas

1. **Neon:** en el proyecto de Neon, botón **Connect**, copiar la conexión directa (sin `-pooler`) y la conexión con pooler (con `-pooler` en el host).
2. **MongoDB Atlas:** crear un clúster (M0 gratis), un usuario en **Database Access**, permitir tu IP en **Network Access** y copiar la conexión `mongodb+srv://...` desde **Connect → Drivers**, agregando `/syllab` antes del `?`.
3. Pegar esos valores en el `.env` (raíz para Docker, `backend/.env` para correr el backend sin Docker):

   ```
   DATABASE_URL=postgresql://USUARIO:CLAVE@ep-xxxx.region.aws.neon.tech/neondb?sslmode=require
   DATABASE_URL_POOLED=postgresql://USUARIO:CLAVE@ep-xxxx-pooler.region.aws.neon.tech/neondb?sslmode=require
   MONGODB_URI=mongodb+srv://USUARIO:CLAVE@cluster.xxxx.mongodb.net/syllab?retryWrites=true&w=majority
   ```

4. Las migraciones usan la conexión directa (`DATABASE_URL`) y la aplicación usa la del pooler (`DATABASE_URL_POOLED`).
5. Comprobar la conexión en http://localhost:3000/api/salud (debe responder `postgres: ok` y `mongodb: ok`).

### Opción 3: desarrollo sin Docker

```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate deploy
npx prisma generate
npx prisma db seed
npm run start:dev
```

En otra terminal, desde la raíz del proyecto:

```bash
npm install
npm run dev
```

## Variables de entorno

| Variable | Para qué |
|---|---|
| `DATABASE_URL` | Conexión directa a PostgreSQL (la usan las migraciones) |
| `DATABASE_URL_POOLED` | Conexión con pooler (la usa la aplicación); en local puede ser igual a la anterior |
| `MONGODB_URI` | Conexión a MongoDB |
| `JWT_SECRET` | Clave para firmar los tokens de sesión |
| `PORT` | Puerto del backend (3000) |
| `FRONTEND_URL` | Dirección del frontend permitida por CORS |
| `VITE_API_URL` | Dirección de la API que usa el frontend |

Plantillas: `.env.example` (Docker Compose) y `backend/.env.example` (backend sin Docker).

## Pruebas

```bash
cd backend
npm test            # 17 pruebas unitarias: reglas de negocio, avance, fechas y autenticación
npm run test:e2e    # 6 pruebas contra la API real (necesita PostgreSQL y MongoDB arriba con los datos de prueba)
```

Las pruebas e2e revisan la conexión a las dos bases, el login con clave incorrecta (401), las rutas sin token (401), la validación de datos (400) y que crear una tarea deje su registro en el historial de MongoDB.

## Limitaciones conocidas

- La recuperación de contraseña es simulada: no envía correo, basta con el nombre de usuario. Sirve solo para la demostración.
- El token de sesión se guarda en el navegador (`sessionStorage`, o `localStorage` si se marca "Recordarme").
- Los logos de los ramos se guardan en base64 dentro de PostgreSQL (máximo 500 KB).
- Si MongoDB no responde, la operación principal se guarda igual, pero esa acción no queda en el historial.
- NestJS 12 se distribuye como módulos ES, por eso Jest se ejecuta con `--experimental-vm-modules` (ya incluido en los scripts).

## Git y colaboración

- Ramas `main` (versión estable), `develop` (integración) y ramas `feature/...` y `fix/...` por tarea.
- Las funcionalidades se integran a `develop` con Pull Requests.
- El historial de contribuciones por integrante se puede ver en **Insights → Contributors** de GitHub.

## Uso de Inteligencia Artificial

> Sección obligatoria del Hito 3. Cada integrante debe completar una fila por cada herramienta que usó.

| Herramienta | Propósito | Prompt (ejemplo) | Resultado | Validación humana | Aprendizaje |
|---|---|---|---|---|---|
| Gema (plataforma Quotas de la universidad) | Análisis del proyecto y propuesta de arquitectura | "Puedes analizar el estado actual del proyecto y proponerme ideas para levantar una base de datos junto a un backend utilizando Prisma y NestJS." / Seguimiento: "Sí, procede con la instalación de NestJS y la configuración inicial del servidor." | Se obtuvo un diagnóstico del proyecto del Taller 2 (datos en `localStorage` y login con `users.json`) y una propuesta de backend en NestJS con Prisma, que se usó como punto de partida de la API. | Se comparó la propuesta con los requisitos del Hito 3 antes de instalar dependencias, y se decidió usar PostgreSQL en vez de SQLite para cumplir con una base de datos relacional desplegable (Neon o Docker). | Analizar primero el estado del proyecto permite planificar la migración sin perder lo que ya funcionaba en el Taller 2 (pantallas, componentes y flujo de navegación). |
| Gema (plataforma Quotas de la universidad) | Diseño de la persistencia híbrida (PostgreSQL + MongoDB) | "Analiza el estado del repositorio y continúa con este plan de ejecución: (1) instalar `mongoose` y `@nestjs/mongoose` y preparar el `.env` con `DATABASE_URL` (PostgreSQL) y `MONGODB_URI`; (2) cambiar el provider de Prisma de SQLite a PostgreSQL; (3) crear un esquema de actividad en MongoDB y un servicio que registre cada creación, edición y eliminación de tareas; (4) ejecutar las migraciones en NeonDB y crear una prueba que cree una tarea en PostgreSQL y verifique su registro en MongoDB. Para los comandos de terminal, utiliza la terminal de WSL (Ubuntu)." | Se configuró Prisma con PostgreSQL y migraciones reproducibles (`prisma migrate deploy`), y la conexión a MongoDB con Mongoose para registrar la actividad del usuario. | El plan se adaptó al proyecto: el `AuditModule` propuesto se implementó como los módulos `historial` (colección `historial_actividad`) y `planificacion` (colección `eventos_planificacion`); el endpoint de prueba se reemplazó por una prueba e2e que verifica que crear una tarea deja su registro en MongoDB; y se agregó que, si MongoDB falla, la operación en PostgreSQL igual se guarde. | PostgreSQL conviene para el estado actual y las relaciones, y MongoDB para el historial, que solo se agrega y tiene campos variables; un plan generado por IA sirve de guía, pero los nombres, los módulos y las pruebas deben ajustarse a las reglas del proyecto. |
| Claude Code | Diseño y desarrollo del backend | "Actúa como desarrollador backend. Necesito una API REST en NestJS con TypeScript para una agenda académica con estas entidades: usuarios, períodos, asignaturas, evaluaciones, tareas y subtareas. Propón la estructura de módulos (controlador, servicio y DTO por entidad), el esquema de Prisma con sus relaciones y restricciones (claves foráneas, únicos y CHECK) y la autenticación con JWT y contraseñas cifradas con bcrypt. Explica el porqué de cada decisión y no generes código de una sola vez: avancemos módulo por módulo." | Se obtuvo una propuesta de estructura modular por entidad y un primer esquema de Prisma, que sirvieron de base para los módulos de `backend/src` y el modelo de datos documentado en este README. | Se revisó cada módulo antes de incorporarlo: se ajustaron las restricciones del esquema a las reglas del caso (ponderación máxima de 100 %, nota entre 1.0 y 7.0, evaluación dentro del período), se verificaron las respuestas de error con Swagger y se escribieron pruebas unitarias y e2e. | Separar controlador, servicio y DTO facilita validar y probar cada regla de negocio; las restricciones deben existir tanto en la API como en la base de datos para que los datos se mantengan consistentes. |
| Claude Code | Diseño de la interfaz (paleta de colores) | "Necesito una paleta de colores para una aplicación web de agenda académica dirigida a estudiantes universitarios. Debe transmitir orden y confianza, mantener la identidad visual del Taller 2 (azul y morado) y cumplir el contraste mínimo WCAG AA (4.5:1) para texto. Entrégame un color principal, uno secundario, uno de acento, uno para errores y una escala de grises, con su código hexadecimal y el uso recomendado de cada uno." | Se definió una paleta basada en azul marino (`#1b3f73`), morado (`#8b62df`), celeste de acento (`#59b7ff`), rojo para errores y alertas (`#c91f22`) y una escala de grises para textos y bordes. | Se probó la paleta en todas las pantallas, se comprobó el contraste de los textos sobre los fondos y se ajustaron los tonos que no se leían bien sobre el degradado del panel de inicio. | Una paleta reducida y con usos definidos mantiene la coherencia visual; el contraste debe comprobarse sobre los fondos reales, no solo entre colores aislados. |
| Claude Code | Despliegue local y depuración | "Levanta el proyecto completo en mi equipo siguiendo la Opción 1 del README (Docker Compose). Si algún servicio no arranca, identifica la causa, aplica el cambio mínimo necesario sin modificar el código de la aplicación e informa qué archivos se agregaron o modificaron y por qué." / "Al iniciar sesión, otra integrante recibe el mensaje 'No se pudo conectar con el servidor', aunque los cuatro contenedores están en ejecución. Indica qué pruebas permiten aislar si la falla está en el backend, en las bases de datos o en la comunicación con el frontend." | Se levantaron los cuatro servicios y se detectó que el puerto 5432 estaba ocupado por otro proyecto; se resolvió con un archivo `docker-compose.override.yml` de uso local, sin modificar la configuración del repositorio. En el segundo caso, se comprobó mediante `/api/salud` que la API y ambas bases de datos funcionaban, y se identificó como causa la política CORS del backend, que solo admite el origen definido en `FRONTEND_URL`. | Se verificó el funcionamiento completo con el usuario de prueba (inicio de sesión y pantallas Inicio, Tareas, Ramos y Calendario) sin errores en la consola del navegador. Se revisó en `backend/src/configurar-app.ts` cómo se configura el CORS antes de aceptar el diagnóstico. El archivo de override se mantuvo fuera del repositorio por ser específico de un equipo. | La configuración CORS exige que el origen coincida exactamente, por lo que el acceso debe hacerse desde `http://localhost:5173`. Las variables `VITE_*` se incorporan al frontend durante la compilación, por lo que cualquier cambio requiere reconstruir la imagen. El endpoint `/api/salud` permite distinguir rápidamente una falla de servicio de una falla de comunicación. |
