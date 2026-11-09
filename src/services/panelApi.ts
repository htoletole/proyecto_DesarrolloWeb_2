// llamadas a la API para el dashboard y el historial de actividad
import { pedir, soloFecha } from "./api";
import type { Actividad, ResumenDashboard } from "./tipos";

export async function obtenerResumen(): Promise<ResumenDashboard> {
  const resumen = await pedir<ResumenDashboard>("/dashboard");

  // las fechas llegan con hora, se dejan como AAAA-MM-DD
  return {
    ...resumen,
    vencidas: resumen.vencidas.map((tarea) => ({ ...tarea, fecha: soloFecha(tarea.fecha) })),
    proximas: resumen.proximas.map((tarea) => ({ ...tarea, fecha: soloFecha(tarea.fecha) })),
    proximasEvaluaciones: resumen.proximasEvaluaciones.map((evaluacion) => ({
      ...evaluacion,
      fecha: soloFecha(evaluacion.fecha) ?? "",
    })),
  };
}

// ultimas acciones del usuario (viene de MongoDB)
export function listarActividad(limite: number): Promise<Actividad[]> {
  return pedir<Actividad[]>("/historial?limite=" + limite);
}
