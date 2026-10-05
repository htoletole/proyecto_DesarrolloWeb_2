// misma forma que las tareas de Tareas.tsx
export interface Tarea {
  id: string;
  nombre: string;
  descripcion: string;
  asignatura: string;
  estado: string;
  prioridad: string;
  horaEntrega: string; // formato 10:00
  fecha?: string; // formato 2026-10-06
}

// tarea vacia, para cuando no hay ninguna abierta
export const TAREA_VACIA: Tarea = {
  id: "",
  nombre: "",
  descripcion: "",
  asignatura: "",
  estado: "",
  prioridad: "",
  horaEntrega: "",
  fecha: "",
};

// clave donde Tareas guarda sus tareas
const CLAVE_TAREAS = "tareas";

export function cargarTareas(): Tarea[] {
  const texto = localStorage.getItem(CLAVE_TAREAS);

  if (!texto) {
    return [];
  }

  return JSON.parse(texto);
}

export function guardarTareas(tareas: Tarea[]) {
  localStorage.setItem(CLAVE_TAREAS, JSON.stringify(tareas));
}

export function reemplazarTarea(tareas: Tarea[], editada: Tarea): Tarea[] {
  const lista: Tarea[] = [];

  for (let i = 0; i < tareas.length; i++) {
    if (tareas[i].id === editada.id) {
      lista.push(editada);
    } else {
      lista.push(tareas[i]);
    }
  }

  return lista;
}

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

export function listarAsignaturas(tareas: Tarea[]): string[] {
  const lista: string[] = [];

  for (let i = 0; i < tareas.length; i++) {
    if (!lista.includes(tareas[i].asignatura)) {
      lista.push(tareas[i].asignatura);
    }
  }

  return lista;
}
