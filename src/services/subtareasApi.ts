// subtareas de una tarea (pasos mas chicos para terminarla)
import { pedir } from "./api";

export type Subtarea = {
  id: number;
  nombre: string;
  completada: boolean;
};

// la tarea llega desde la API con sus subtareas incluidas
export async function listarSubtareas(tareaId: string): Promise<Subtarea[]> {
  const tarea = await pedir<{ subtareas: Subtarea[] }>("/tareas/" + tareaId);
  return tarea.subtareas ?? [];
}

export function crearSubtarea(tareaId: string, nombre: string): Promise<Subtarea> {
  return pedir<Subtarea>("/tareas/" + tareaId + "/subtareas", "POST", { nombre });
}

export function marcarSubtarea(id: number, completada: boolean): Promise<Subtarea> {
  return pedir<Subtarea>("/subtareas/" + id, "PATCH", { completada });
}

export function eliminarSubtarea(id: number): Promise<void> {
  return pedir<void>("/subtareas/" + id, "DELETE");
}
