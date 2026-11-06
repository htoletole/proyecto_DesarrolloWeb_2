-- Reglas que tambien controla la base de datos (Prisma no tiene CHECK en el schema)

-- un periodo debe terminar despues de empezar
ALTER TABLE "periodos" ADD CONSTRAINT "periodos_fechas_check" CHECK ("fechaFin" > "fechaInicio");

-- la ponderacion es un porcentaje entre 1 y 100
ALTER TABLE "evaluaciones" ADD CONSTRAINT "evaluaciones_ponderacion_check" CHECK ("ponderacion" BETWEEN 1 AND 100);

-- la nota va de 1.0 a 7.0 (o vacia si aun no se rinde)
ALTER TABLE "evaluaciones" ADD CONSTRAINT "evaluaciones_nota_check" CHECK ("nota" IS NULL OR "nota" BETWEEN 1.0 AND 7.0);

-- la hora de entrega tiene formato HH:mm
ALTER TABLE "tareas" ADD CONSTRAINT "tareas_hora_check" CHECK ("horaEntrega" IS NULL OR "horaEntrega" ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$');
