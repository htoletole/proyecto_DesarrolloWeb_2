// llamadas a la API para evaluaciones
import { pedir, soloFecha } from "./api";
import type { Evaluacion, TipoEvaluacion } from "./tipos";

export interface DatosEvaluacion {
  nombre: string;
  tipo: TipoEvaluacion;
  fecha: string;
  ponderacion: number;
  nota: number | null;
  asignaturaId: number;
}

function arreglarEvaluacion(evaluacion: Evaluacion): Evaluacion {
  return { ...evaluacion, fecha: soloFecha(evaluacion.fecha) ?? "" };
}

// filtros: por ejemplo "?asignaturaId=3" o "?desde=2026-11-01&hasta=2026-11-30"
export async function listarEvaluaciones(filtros = ""): Promise<Evaluacion[]> {
  const evaluaciones = await pedir<Evaluacion[]>("/evaluaciones" + filtros);
  return evaluaciones.map(arreglarEvaluacion);
}

export async function crearEvaluacion(datos: DatosEvaluacion): Promise<Evaluacion> {
  const evaluacion = await pedir<Evaluacion>("/evaluaciones", "POST", datos);
  return arreglarEvaluacion(evaluacion);
}

export async function editarEvaluacion(id: number, datos: Partial<DatosEvaluacion>): Promise<Evaluacion> {
  // al editar no se manda el ramo
  const { asignaturaId, ...resto } = datos;
  void asignaturaId;
  const evaluacion = await pedir<Evaluacion>("/evaluaciones/" + id, "PATCH", resto);
  return arreglarEvaluacion(evaluacion);
}

export function eliminarEvaluacion(id: number): Promise<void> {
  return pedir<void>("/evaluaciones/" + id, "DELETE");
}

// convierte lo que llega del Formulario en los datos que espera la API
export function datosEvaluacionDesdeFormulario(
  datos: Record<string, FormDataEntryValue>,
  asignaturaId: number,
): DatosEvaluacion {
  const nota = String(datos.nota ?? "").replace(",", ".");
  return {
    nombre: String(datos.nombre ?? "").trim(),
    tipo: String(datos.tipo) as TipoEvaluacion,
    fecha: String(datos.fecha ?? ""),
    ponderacion: Number(datos.ponderacion),
    nota: nota ? Number(nota) : null,
    asignaturaId,
  };
}
