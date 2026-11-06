// llamadas a la API para tareas y subtareas
import { pedir, soloFecha } from "./api";
import type { EstadoTarea, EventoPlanificacion, Prioridad, Subtarea, Tarea } from "./tipos";

// lo que se manda al crear o editar una tarea
export interface DatosTarea {
  nombre: string;
  descripcion: string;
  asignaturaId: number;
  estado: EstadoTarea;
  prioridad: Prioridad;
  fecha: string | null;
  horaEntrega: string | null;
  evaluacionId: number | null;
}

// la fecha llega como "2026-11-20T00:00:00.000Z", aqui se deja como "2026-11-20"
function arreglarTarea(tarea: Tarea): Tarea {
  return { ...tarea, fecha: soloFecha(tarea.fecha) };
}

export async function listarTareas(filtros = ""): Promise<Tarea[]> {
  const tareas = await pedir<Tarea[]>("/tareas" + filtros);
  return tareas.map(arreglarTarea);
}

export async function obtenerTarea(id: number): Promise<Tarea> {
  const tarea = await pedir<Tarea>("/tareas/" + id);
  return arreglarTarea(tarea);
}

export async function crearTarea(datos: DatosTarea): Promise<Tarea> {
  const tarea = await pedir<Tarea>("/tareas", "POST", datos);
  return arreglarTarea(tarea);
}

export async function editarTarea(id: number, datos: Partial<DatosTarea>): Promise<Tarea> {
  const tarea = await pedir<Tarea>("/tareas/" + id, "PATCH", datos);
  return arreglarTarea(tarea);
}

export function eliminarTarea(id: number): Promise<void> {
  return pedir<void>("/tareas/" + id, "DELETE");
}

// subtareas

export function crearSubtarea(tareaId: number, nombre: string): Promise<Subtarea> {
  return pedir<Subtarea>("/tareas/" + tareaId + "/subtareas", "POST", { nombre });
}

export function marcarSubtarea(id: number, completada: boolean): Promise<Subtarea> {
  return pedir<Subtarea>("/subtareas/" + id, "PATCH", { completada });
}

export function eliminarSubtarea(id: number): Promise<void> {
  return pedir<void>("/subtareas/" + id, "DELETE");
}

// historial de fechas de la tarea (viene de MongoDB)
export function listarCambiosDeFecha(tareaId: number): Promise<EventoPlanificacion[]> {
  return pedir<EventoPlanificacion[]>("/planificacion/tarea/" + tareaId);
}

// convierte lo que llega del Formulario en los datos que espera la API
export function datosDesdeFormulario(datos: Record<string, FormDataEntryValue>): DatosTarea {
  const evaluacion = String(datos.evaluacionId ?? "");
  return {
    nombre: String(datos.nombre ?? "").trim(),
    descripcion: String(datos.descripcion ?? "").trim(),
    asignaturaId: Number(datos.asignaturaId),
    estado: String(datos.estado) as EstadoTarea,
    prioridad: String(datos.prioridad) as Prioridad,
    fecha: String(datos.fecha ?? "") || null,
    horaEntrega: String(datos.horaEntrega ?? "") || null,
    evaluacionId: evaluacion ? Number(evaluacion) : null,
  };
}
