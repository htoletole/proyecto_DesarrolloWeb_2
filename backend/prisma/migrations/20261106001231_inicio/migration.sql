-- CreateEnum
CREATE TYPE "Modalidad" AS ENUM ('ONLINE', 'PRESENCIAL', 'ASINCRONICO');

-- CreateEnum
CREATE TYPE "TipoEvaluacion" AS ENUM ('PRUEBA', 'CONTROL', 'TRABAJO', 'PROYECTO', 'EXAMEN', 'PRESENTACION');

-- CreateEnum
CREATE TYPE "EstadoTarea" AS ENUM ('PENDIENTE', 'EN_PROGRESO', 'COMPLETADA');

-- CreateEnum
CREATE TYPE "Prioridad" AS ENUM ('BAJA', 'MEDIA', 'ALTA', 'URGENTE');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "periodos" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "fechaInicio" DATE NOT NULL,
    "fechaFin" DATE NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioId" INTEGER NOT NULL,

    CONSTRAINT "periodos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asignaturas" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "modalidad" "Modalidad" NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#FFAE52',
    "logo" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "periodoId" INTEGER NOT NULL,

    CONSTRAINT "asignaturas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evaluaciones" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" "TipoEvaluacion" NOT NULL,
    "fecha" DATE NOT NULL,
    "ponderacion" INTEGER NOT NULL,
    "nota" DOUBLE PRECISION,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "asignaturaId" INTEGER NOT NULL,

    CONSTRAINT "evaluaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tareas" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL DEFAULT '',
    "estado" "EstadoTarea" NOT NULL DEFAULT 'PENDIENTE',
    "prioridad" "Prioridad" NOT NULL DEFAULT 'BAJA',
    "fecha" DATE,
    "horaEntrega" TEXT,
    "completadaEn" TIMESTAMP(3),
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "asignaturaId" INTEGER NOT NULL,
    "evaluacionId" INTEGER,

    CONSTRAINT "tareas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subtareas" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "completada" BOOLEAN NOT NULL DEFAULT false,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tareaId" INTEGER NOT NULL,

    CONSTRAINT "subtareas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_username_key" ON "usuarios"("username");

-- CreateIndex
CREATE UNIQUE INDEX "periodos_usuarioId_nombre_key" ON "periodos"("usuarioId", "nombre");

-- CreateIndex
CREATE UNIQUE INDEX "asignaturas_periodoId_codigo_key" ON "asignaturas"("periodoId", "codigo");

-- CreateIndex
CREATE UNIQUE INDEX "asignaturas_periodoId_nombre_key" ON "asignaturas"("periodoId", "nombre");

-- CreateIndex
CREATE INDEX "tareas_usuarioId_fecha_idx" ON "tareas"("usuarioId", "fecha");

-- AddForeignKey
ALTER TABLE "periodos" ADD CONSTRAINT "periodos_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignaturas" ADD CONSTRAINT "asignaturas_periodoId_fkey" FOREIGN KEY ("periodoId") REFERENCES "periodos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluaciones" ADD CONSTRAINT "evaluaciones_asignaturaId_fkey" FOREIGN KEY ("asignaturaId") REFERENCES "asignaturas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tareas" ADD CONSTRAINT "tareas_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tareas" ADD CONSTRAINT "tareas_asignaturaId_fkey" FOREIGN KEY ("asignaturaId") REFERENCES "asignaturas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tareas" ADD CONSTRAINT "tareas_evaluacionId_fkey" FOREIGN KEY ("evaluacionId") REFERENCES "evaluaciones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subtareas" ADD CONSTRAINT "subtareas_tareaId_fkey" FOREIGN KEY ("tareaId") REFERENCES "tareas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
