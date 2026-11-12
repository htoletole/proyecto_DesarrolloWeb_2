// guarda y lee los periodos academicos (semestres) en la API
import { pedir, soloFecha } from "./api";

// asi llega un periodo desde la API
interface PeriodoApi {
  id: number;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  _count?: { asignaturas: number };
}

export type Periodo = {
  id: number;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  cantidadRamos: number;
};

function aPeriodo(periodo: PeriodoApi): Periodo {
  return {
    id: periodo.id,
    nombre: periodo.nombre,
    fechaInicio: soloFecha(periodo.fechaInicio) ?? "",
    fechaFin: soloFecha(periodo.fechaFin) ?? "",
    cantidadRamos: periodo._count ? periodo._count.asignaturas : 0,
  };
}

export async function listarPeriodos(): Promise<Periodo[]> {
  const lista = await pedir<PeriodoApi[]>("/periodos");
  return lista.map(aPeriodo);
}

export async function crearPeriodo(nombre: string, fechaInicio: string, fechaFin: string): Promise<Periodo> {
  const creado = await pedir<PeriodoApi>("/periodos", "POST", { nombre, fechaInicio, fechaFin });
  return aPeriodo(creado);
}

export async function editarPeriodo(id: number, nombre: string, fechaInicio: string, fechaFin: string): Promise<Periodo> {
  const editado = await pedir<PeriodoApi>("/periodos/" + id, "PATCH", { nombre, fechaInicio, fechaFin });
  return aPeriodo(editado);
}

// la API no deja borrar un periodo que todavia tiene ramos
export function eliminarPeriodo(id: number): Promise<void> {
  return pedir<void>("/periodos/" + id, "DELETE");
}
