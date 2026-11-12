// resumen del inicio: vencimientos, proximas evaluaciones, cumplimiento y avance por ramo
import { pedir, soloFecha } from "./api";

interface TareaResumenApi {
  id: number;
  nombre: string;
  fecha: string | null;
  asignatura: { nombre: string; color: string };
}

interface EvaluacionResumenApi {
  id: number;
  nombre: string;
  fecha: string;
  ponderacion: number;
  asignatura: { nombre: string; color: string };
}

export type ElementoResumen = {
  id: number;
  nombre: string;
  fecha: string;
  ramo: string;
  color: string;
  detalle: string;
};

export type AvanceRamo = {
  id: number;
  nombre: string;
  color: string;
  totalTareas: number;
  tareasCompletadas: number;
  porcentajeTareas: number;
  ponderacionRendida: number;
  promedioParcial: number | null;
};

export type Resumen = {
  vencidas: ElementoResumen[];
  proximas: ElementoResumen[];
  proximasEvaluaciones: ElementoResumen[];
  cumplimiento: { aTiempo: number; atrasadas: number; porcentaje: number | null };
  avancePorRamo: AvanceRamo[];
};

interface ResumenApi {
  vencidas: TareaResumenApi[];
  proximas: TareaResumenApi[];
  proximasEvaluaciones: EvaluacionResumenApi[];
  cumplimiento: { aTiempo: number; atrasadas: number; porcentaje: number | null };
  avancePorRamo: AvanceRamo[];
}

function deTarea(tarea: TareaResumenApi): ElementoResumen {
  return {
    id: tarea.id,
    nombre: tarea.nombre,
    fecha: soloFecha(tarea.fecha) ?? "",
    ramo: tarea.asignatura.nombre,
    color: tarea.asignatura.color,
    detalle: "",
  };
}

function deEvaluacion(evaluacion: EvaluacionResumenApi): ElementoResumen {
  return {
    id: evaluacion.id,
    nombre: evaluacion.nombre,
    fecha: soloFecha(evaluacion.fecha) ?? "",
    ramo: evaluacion.asignatura.nombre,
    color: evaluacion.asignatura.color,
    detalle: evaluacion.ponderacion + "%",
  };
}

export async function obtenerResumen(): Promise<Resumen> {
  const datos = await pedir<ResumenApi>("/dashboard");
  return {
    vencidas: datos.vencidas.map(deTarea),
    proximas: datos.proximas.map(deTarea),
    proximasEvaluaciones: datos.proximasEvaluaciones.map(deEvaluacion),
    cumplimiento: datos.cumplimiento,
    avancePorRamo: datos.avancePorRamo,
  };
}
