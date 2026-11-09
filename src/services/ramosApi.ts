// llamadas a la API para periodos y ramos (asignaturas)
import { pedir, soloFecha } from "./api";
import type { Modalidad, Periodo, Ramo, RamoDetalle } from "./tipos";

// periodos

function arreglarPeriodo(periodo: Periodo): Periodo {
  return {
    ...periodo,
    fechaInicio: soloFecha(periodo.fechaInicio) ?? "",
    fechaFin: soloFecha(periodo.fechaFin) ?? "",
  };
}

export async function listarPeriodos(): Promise<Periodo[]> {
  const periodos = await pedir<Periodo[]>("/periodos");
  return periodos.map(arreglarPeriodo);
}

export async function crearPeriodo(nombre: string, fechaInicio: string, fechaFin: string): Promise<Periodo> {
  const periodo = await pedir<Periodo>("/periodos", "POST", { nombre, fechaInicio, fechaFin });
  return arreglarPeriodo(periodo);
}

export function eliminarPeriodo(id: number): Promise<void> {
  return pedir<void>("/periodos/" + id, "DELETE");
}

// ramos

export interface DatosRamo {
  codigo: string;
  nombre: string;
  modalidad: Modalidad;
  color: string;
  logo?: string | null;
  periodoId: number;
}

export function listarRamos(periodoId?: number): Promise<Ramo[]> {
  let ruta = "/asignaturas";
  if (periodoId) {
    ruta += "?periodoId=" + periodoId;
  }
  return pedir<Ramo[]>(ruta);
}

export async function obtenerRamo(id: number): Promise<RamoDetalle> {
  const ramo = await pedir<RamoDetalle>("/asignaturas/" + id);

  // las fechas llegan con hora, se dejan como AAAA-MM-DD
  return {
    ...ramo,
    periodo: arreglarPeriodo(ramo.periodo),
    evaluaciones: ramo.evaluaciones.map((evaluacion) => ({ ...evaluacion, fecha: soloFecha(evaluacion.fecha) ?? "" })),
    tareas: ramo.tareas.map((tarea) => ({ ...tarea, fecha: soloFecha(tarea.fecha) })),
  };
}

export function crearRamo(datos: DatosRamo): Promise<Ramo> {
  return pedir<Ramo>("/asignaturas", "POST", datos);
}

export function editarRamo(id: number, datos: Partial<DatosRamo>): Promise<Ramo> {
  return pedir<Ramo>("/asignaturas/" + id, "PATCH", datos);
}

export function eliminarRamo(id: number): Promise<void> {
  return pedir<void>("/asignaturas/" + id, "DELETE");
}
