// guarda y lee las evaluaciones (pruebas, controles, trabajos...) en la API
import { pedir, soloFecha } from "./api";

// asi llega una evaluacion desde la API
interface EvaluacionApi {
  id: number;
  nombre: string;
  tipo: string;
  fecha: string;
  ponderacion: number;
  nota: number | null;
  asignaturaId: number;
  // al crear o editar, la API no manda el ramo (solo asignaturaId)
  asignatura?: { id: number; nombre: string; color: string };
}

export type Evaluacion = {
  id: number;
  nombre: string;
  tipo: string;
  fecha: string;
  ponderacion: number;
  nota: number | null;
  ramoId: number;
  ramo: string;
  colorRamo: string;
};

// los ramos con el id de la base, porque la evaluacion se guarda con ese id
export type RamoSimple = {
  id: number;
  nombre: string;
  color: string;
};

// la API guarda el tipo en mayusculas y la pantalla lo muestra con este texto
export const TIPOS_EVALUACION: Record<string, string> = {
  PRUEBA: "Prueba",
  CONTROL: "Control",
  TRABAJO: "Trabajo",
  PROYECTO: "Proyecto",
  EXAMEN: "Examen",
  PRESENTACION: "Presentación",
};

function aEvaluacion(evaluacion: EvaluacionApi, ramo?: RamoSimple): Evaluacion {
  const datosRamo = evaluacion.asignatura ?? ramo;
  return {
    id: evaluacion.id,
    nombre: evaluacion.nombre,
    tipo: evaluacion.tipo,
    fecha: soloFecha(evaluacion.fecha) ?? "",
    ponderacion: evaluacion.ponderacion,
    nota: evaluacion.nota,
    ramoId: evaluacion.asignaturaId,
    ramo: datosRamo ? datosRamo.nombre : "",
    colorRamo: datosRamo ? datosRamo.color : "#FFAE52",
  };
}

export async function listarEvaluaciones(): Promise<Evaluacion[]> {
  const lista = await pedir<EvaluacionApi[]>("/evaluaciones");
  return lista.map((evaluacion) => aEvaluacion(evaluacion));
}

export async function listarRamosSimples(): Promise<RamoSimple[]> {
  const lista = await pedir<RamoSimple[]>("/asignaturas");
  return lista.map((ramo) => ({ id: ramo.id, nombre: ramo.nombre, color: ramo.color }));
}

// datos que se mandan al crear o editar (la nota es null si todavia no se rinde)
export type DatosEvaluacion = {
  nombre: string;
  tipo: string;
  fecha: string;
  ponderacion: number;
  nota: number | null;
};

export async function crearEvaluacion(ramo: RamoSimple, datos: DatosEvaluacion): Promise<Evaluacion> {
  const creada = await pedir<EvaluacionApi>("/evaluaciones", "POST", { ...datos, asignaturaId: ramo.id });
  return aEvaluacion(creada, ramo);
}

// al editar no se puede cambiar el ramo (la API no lo permite)
export async function editarEvaluacion(anterior: Evaluacion, datos: DatosEvaluacion): Promise<Evaluacion> {
  const editada = await pedir<EvaluacionApi>("/evaluaciones/" + anterior.id, "PATCH", datos);
  return aEvaluacion(editada, { id: anterior.ramoId, nombre: anterior.ramo, color: anterior.colorRamo });
}

export function eliminarEvaluacion(id: number): Promise<void> {
  return pedir<void>("/evaluaciones/" + id, "DELETE");
}
