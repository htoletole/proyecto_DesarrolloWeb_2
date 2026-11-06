// textos que se muestran en pantalla para los valores que guarda la API
// aqui se pueden cambiar los nombres que ve el usuario
import type { EstadoTarea, Modalidad, Opcion, Prioridad, TipoEvaluacion } from "./tipos";

export const ESTADOS: Record<EstadoTarea, string> = {
  PENDIENTE: "Pendiente",
  EN_PROGRESO: "En progreso",
  COMPLETADA: "Completada",
};

export const PRIORIDADES: Record<Prioridad, string> = {
  BAJA: "Baja",
  MEDIA: "Media",
  ALTA: "Alta",
  URGENTE: "Urgente",
};

export const MODALIDADES: Record<Modalidad, string> = {
  ONLINE: "Online",
  PRESENCIAL: "Presencial",
  ASINCRONICO: "Asincrónico",
};

export const TIPOS_EVALUACION: Record<TipoEvaluacion, string> = {
  PRUEBA: "Prueba",
  CONTROL: "Control",
  TRABAJO: "Trabajo",
  PROYECTO: "Proyecto",
  EXAMEN: "Examen",
  PRESENTACION: "Presentación",
};

// convierte uno de los mapas de arriba en opciones para un <select>
export function opcionesDe(mapa: Record<string, string>): Opcion[] {
  const lista: Opcion[] = [];
  for (const clave of Object.keys(mapa)) {
    lista.push({ valor: clave, texto: mapa[clave] });
  }
  return lista;
}

// clase CSS segun el estado (las mismas del Taller 2)
export function claseEstado(estado: EstadoTarea): string {
  if (estado === "PENDIENTE") return "pendientes";
  if (estado === "EN_PROGRESO") return "en-progreso";
  return "completadas";
}

// "2026-11-20" -> "20/11/2026"
export function fechaCortaTexto(fecha: string | null): string {
  if (!fecha) {
    return "Sin fecha";
  }
  return fecha.slice(8, 10) + "/" + fecha.slice(5, 7) + "/" + fecha.slice(0, 4);
}
