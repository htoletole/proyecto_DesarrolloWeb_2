# Syllab

Syllab es una aplicación web para estudiantes que centraliza la gestión de ramos, tareas, fechas importantes y progreso semanal. Está pensada para organizar la vida académica en un solo lugar, con una interfaz clara, moderna y fácil de usar.

## Descripción general

La plataforma permite:

- Registrar y gestionar ramos o asignaturas.
- Crear tareas con prioridad, estado, fecha y hora de entrega.
- Visualizar las tareas en un tablero tipo Kanban.
- Revisar un dashboard con métricas de progreso semanal.
- Consultar un calendario académico.
- Mantener sesión de usuario y persistencia local con `localStorage`.

## Stack tecnológico

- React
- TypeScript
- Vite
- React Router
- Bootstrap
- CSS personalizado

## Funcionalidades principales

### 1. Autenticación de usuarios
La aplicación incluye flujo de login, registro y recuperación de contraseña. También permite recordar al usuario y mantener sesión activa en el navegador.

### 2. Dashboard
El dashboard muestra una vista general del estado de las tareas del estudiante, separadas por:

- Pendientes
- En progreso
- Completadas

Incluye un panel de progreso semanal para facilitar el seguimiento académico.

### 3. Gestión de ramos
Permite:

- Crear ramos personalizados
- Editarlos y eliminarlos
- Agregar un logo o icono
- Ver modalidad y color asociado
- Organizar la información por vista de cuadrícula o lista

### 4. Gestión de tareas
Las tareas pueden contener:

- Nombre
- Descripción
- Asignatura
- Estado
- Prioridad
- Fecha y hora de entrega

Además, se pueden filtrar por estado, prioridad o ramo, y seleccionarse para su eliminación masiva.

### 5. Calendario
La app incluye una vista de calendario para visualizar fechas relevantes y apoyar la planificación de entregas.

## Estructura del proyecto

```text
proyecto_DesarrolloWeb_2/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── data/
│   ├── pages/
│   ├── services/
│   ├── styles/
│   ├── App.tsx
│   ├── main.tsx
│   └── ...
├── .gitignore
├── .oxlintrc.json
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
└── README.md
```

## Instalación

1. Clona el repositorio:

```bash
git clone https://github.com/htoletole/proyecto_DesarrolloWeb_2.git
```

2. Accede a la carpeta del proyecto:

```bash
cd proyecto_DesarrolloWeb_2
```

3. Instala las dependencias:

```bash
npm install
```

## Ejecución local

Para iniciar la aplicación en modo desarrollo:

```bash
npm run dev
```

Luego abre la URL que indique Vite en tu navegador (normalmente `http://localhost:5173`).

## Build de producción

Para compilar la app para producción:

```bash
npm run build
```

## Lint

Se incluye una configuración de lint con Oxlint:

```bash
npm run lint
```

## Datos y persistencia

La aplicación guarda la información en el navegador usando `localStorage`, lo que permite:

- mantener usuarios registrados
- recordar la sesión del usuario
- conservar ramos y tareas entre recargas

## Capturas de uso

La app incluye una interfaz basada en paneles, tarjetas y formularios, con enfoque en organización universitaria y planificación de entregas.

## Requisitos

- Node.js 18 o superior
- npm
- Navegador moderno

## Autor

Proyecto desarrollado por `htoletole`.

## Licencia

Este proyecto no especifica una licencia en el repositorio, por lo que se recomienda revisarla antes de reutilizarlo en entornos profesionales o públicos.
