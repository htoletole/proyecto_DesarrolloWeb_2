// seguimiento de avance y cumplimiento de un ramo

interface TareaParaAvance {
  estado: string;
}

interface EvaluacionParaAvance {
  ponderacion: number;
  nota: number | null;
}

export function calcularAvance(tareas: TareaParaAvance[], evaluaciones: EvaluacionParaAvance[]) {
  // avance de tareas: cuantas estan completadas
  let tareasCompletadas = 0;
  for (const tarea of tareas) {
    if (tarea.estado === 'COMPLETADA') {
      tareasCompletadas++;
    }
  }

  let porcentajeTareas = 0;
  if (tareas.length > 0) {
    porcentajeTareas = Math.round((tareasCompletadas * 100) / tareas.length);
  }

  // avance de notas: cuanto se ha rendido y el promedio de lo rendido
  let ponderacionTotal = 0;
  let ponderacionRendida = 0;
  let sumaNotas = 0;
  for (const evaluacion of evaluaciones) {
    ponderacionTotal += evaluacion.ponderacion;
    if (evaluacion.nota !== null) {
      ponderacionRendida += evaluacion.ponderacion;
      sumaNotas += evaluacion.nota * evaluacion.ponderacion;
    }
  }

  let promedioParcial: number | null = null;
  if (ponderacionRendida > 0) {
    promedioParcial = Math.round((sumaNotas / ponderacionRendida) * 10) / 10;
  }

  return {
    totalTareas: tareas.length,
    tareasCompletadas,
    porcentajeTareas,
    ponderacionTotal,
    ponderacionRendida,
    promedioParcial,
  };
}
