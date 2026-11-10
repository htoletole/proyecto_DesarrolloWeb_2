// funciones del calendario para ordenar las tareas y evaluaciones que llegan de la API
import type { Evaluacion, Tarea } from "./tipos";

// tarea "vacia" para decir que no hay ninguna abierta
export const TAREA_VACIA: Tarea = {
  id: 0,
  nombre: "",
  descripcion: "",
  estado: "PENDIENTE",
  prioridad: "BAJA",
  fecha: null,
  horaEntrega: null,
  completadaEn: null,
  asignaturaId: 0,
  asignatura: { id: 0, nombre: "", color: "" },
  subtareas: [],
};

export function filtrarPorFecha(tareas: Tarea[], fecha: string): Tarea[] {
  const lista: Tarea[] = [];

  for (let i = 0; i < tareas.length; i++) {
    if (tareas[i].fecha === fecha) {
      lista.push(tareas[i]);
    }
  }

  return lista;
}

export function filtrarSinFecha(tareas: Tarea[]): Tarea[] {
  const lista: Tarea[] = [];

  for (let i = 0; i < tareas.length; i++) {
    if (!tareas[i].fecha) {
      lista.push(tareas[i]);
    }
  }

  return lista;
}

export function evaluacionesDelDia(evaluaciones: Evaluacion[], fecha: string): Evaluacion[] {
  const lista: Evaluacion[] = [];

  for (let i = 0; i < evaluaciones.length; i++) {
    if (evaluaciones[i].fecha === fecha) {
      lista.push(evaluaciones[i]);
    }
  }

  return lista;
}
