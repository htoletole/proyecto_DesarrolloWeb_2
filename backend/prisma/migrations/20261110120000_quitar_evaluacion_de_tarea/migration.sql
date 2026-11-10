-- Se quita la relacion opcional entre tarea y evaluacion (campo "Evaluacion que prepara")

-- DropForeignKey
ALTER TABLE "tareas" DROP CONSTRAINT "tareas_evaluacionId_fkey";

-- AlterTable
ALTER TABLE "tareas" DROP COLUMN "evaluacionId";
