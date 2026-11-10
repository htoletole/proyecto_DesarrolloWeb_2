// guarda y lee las tareas en la API, entregandolas con la misma forma que usan las pantallas
import { pedir } from "./api";
import { buscarIdDeRamo } from "./ramosApi";
import type { Tarea } from "../pages/Tareas";

// asi llega una tarea desde la API
interface TareaApi {
  id: number;
  nombre: string;
  descripcion: string;
  estado: string;
  prioridad: string;
  fecha: string | null;
  horaEntrega: string | null;
  asignatura: { nombre: string };
}

// la API guarda estado y prioridad en mayusculas y las pantallas usan estos textos
const ESTADO_TEXTO: Record<string, string> = {
  PENDIENTE: "Pendiente",
  EN_PROGRESO: "En progreso",
  COMPLETADA: "Completada",
};

const ESTADO_API: Record<string, string> = {
  Pendiente: "PENDIENTE",
  "En progreso": "EN_PROGRESO",
  Completada: "COMPLETADA",
};

const PRIORIDAD_TEXTO: Record<string, string> = {
  BAJA: "Baja",
  MEDIA: "Media",
  ALTA: "Alta",
  URGENTE: "Urgente",
};

function aTarea(tarea: TareaApi): Tarea {
  return {
    id: String(tarea.id),
    nombre: tarea.nombre,
    descripcion: tarea.descripcion,
    asignatura: tarea.asignatura.nombre,
    estado: ESTADO_TEXTO[tarea.estado] ?? tarea.estado,
    prioridad: PRIORIDAD_TEXTO[tarea.prioridad] ?? tarea.prioridad,
    horaEntrega: tarea.horaEntrega ?? "",
    // la fecha llega como "2026-11-20T00:00:00.000Z" y las pantallas usan "2026-11-20"
    fecha: tarea.fecha ? tarea.fecha.slice(0, 10) : "",
  };
}

// la tarea guarda el nombre del ramo y la API pide el id del ramo
async function datosParaApi(tarea: Tarea) {
  const asignaturaId = await buscarIdDeRamo(tarea.asignatura);
  return {
    nombre: tarea.nombre,
    descripcion: tarea.descripcion,
    asignaturaId: asignaturaId,
    estado: ESTADO_API[tarea.estado] ?? "PENDIENTE",
    prioridad: tarea.prioridad.toUpperCase(),
    fecha: tarea.fecha ? tarea.fecha : null,
    horaEntrega: tarea.horaEntrega ? tarea.horaEntrega : null,
  };
}

export async function listarTareas(): Promise<Tarea[]> {
  const lista = await pedir<TareaApi[]>("/tareas");
  return lista.map(aTarea);
}

// devuelve la tarea creada, con el id que le puso la base de datos
export async function crearTarea(tarea: Tarea): Promise<Tarea> {
  const creada = await pedir<TareaApi>("/tareas", "POST", await datosParaApi(tarea));
  return aTarea(creada);
}

export async function editarTarea(tarea: Tarea): Promise<Tarea> {
  const editada = await pedir<TareaApi>("/tareas/" + tarea.id, "PATCH", await datosParaApi(tarea));
  return aTarea(editada);
}

export function eliminarTarea(id: string): Promise<void> {
  return pedir<void>("/tareas/" + id, "DELETE");
}
