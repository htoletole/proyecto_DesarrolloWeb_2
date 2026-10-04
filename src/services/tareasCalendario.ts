// misma forma que las tareas de la vista de Tareas (pages/Tareas.tsx)
export interface Tarea {
  id: string;
  nombre: string;
  descripcion: string;
  asignatura: string;
  estado: string;
  prioridad: string;
  horaEntrega: string; // formato 10:00
  fecha?: string; // formato 2026-10-06, la vista de Tareas todavia no la pide
}

// clave donde la vista de Tareas guarda sus tareas en localStorage
const CLAVE_TAREAS = "tareas";

// el calendario no inventa tareas, solo muestra las que estan guardadas
export function cargarTareas(): Tarea[] {
  const texto = localStorage.getItem(CLAVE_TAREAS);

  if (texto === null) {
    return [];
  }

  return JSON.parse(texto);
}

export function guardarTareas(tareas: Tarea[]) {
  localStorage.setItem(CLAVE_TAREAS, JSON.stringify(tareas));
}
