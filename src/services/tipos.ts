// tipos de los datos que entrega la API (los mismos nombres que en el backend)

export type EstadoTarea = "PENDIENTE" | "EN_PROGRESO" | "COMPLETADA";
export type Prioridad = "BAJA" | "MEDIA" | "ALTA" | "URGENTE";
export type Modalidad = "ONLINE" | "PRESENCIAL" | "ASINCRONICO";
export type TipoEvaluacion = "PRUEBA" | "CONTROL" | "TRABAJO" | "PROYECTO" | "EXAMEN" | "PRESENTACION";

export interface Periodo {
  id: number;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  _count?: { asignaturas: number };
}

// lo minimo de un ramo que viene dentro de una tarea o evaluacion
export interface RamoResumen {
  id: number;
  codigo?: string;
  nombre: string;
  color: string;
}

export interface Ramo {
  id: number;
  codigo: string;
  nombre: string;
  modalidad: Modalidad;
  color: string;
  logo: string | null;
  periodoId: number;
  _count?: { tareas: number; evaluaciones: number };
}

export interface Subtarea {
  id: number;
  nombre: string;
  completada: boolean;
  tareaId: number;
}

export interface Tarea {
  id: number;
  nombre: string;
  descripcion: string;
  estado: EstadoTarea;
  prioridad: Prioridad;
  fecha: string | null;
  horaEntrega: string | null;
  completadaEn: string | null;
  asignaturaId: number;
  evaluacionId: number | null;
  asignatura: RamoResumen;
  evaluacion: { id: number; nombre: string } | null;
  subtareas: Subtarea[];
}

export interface Evaluacion {
  id: number;
  nombre: string;
  tipo: TipoEvaluacion;
  fecha: string;
  ponderacion: number;
  nota: number | null;
  asignaturaId: number;
  asignatura?: RamoResumen;
}

export interface Avance {
  totalTareas: number;
  tareasCompletadas: number;
  porcentajeTareas: number;
  ponderacionTotal: number;
  ponderacionRendida: number;
  promedioParcial: number | null;
}

export interface TareaDeRamo {
  id: number;
  nombre: string;
  estado: EstadoTarea;
  prioridad: Prioridad;
  fecha: string | null;
}

export interface RamoDetalle extends Ramo {
  periodo: Periodo;
  evaluaciones: Evaluacion[];
  tareas: TareaDeRamo[];
  avance: Avance;
}

// documentos que vienen de MongoDB
export interface Actividad {
  _id: string;
  accion: string;
  entidad: string;
  entidadId: number;
  descripcion: string;
  cambios?: Record<string, { antes: unknown; despues: unknown }>;
  fecha: string;
}

export interface EventoPlanificacion {
  _id: string;
  tipo: string;
  entidad: string;
  entidadId: number;
  titulo: string;
  fechaAnterior?: string;
  fechaNueva?: string;
  creadoEn: string;
}

export interface Reprogramada {
  entidad: string;
  entidadId: number;
  titulo: string;
  veces: number;
  ultimaFecha?: string;
}

export interface AvanceRamo extends Avance {
  id: number;
  nombre: string;
  color: string;
}

export interface ResumenDashboard {
  hoy: string;
  totales: { pendientes: number; enProgreso: number; completadas: number };
  vencidas: Tarea[];
  proximas: Tarea[];
  proximasEvaluaciones: Evaluacion[];
  cumplimiento: { aTiempo: number; atrasadas: number; porcentaje: number | null };
  avancePorRamo: AvanceRamo[];
  masReprogramadas: Reprogramada[];
}

// opcion de un <select>
export interface Opcion {
  valor: string;
  texto: string;
  grupo?: string;
}
