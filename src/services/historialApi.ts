// historial de actividad y eventos de planificacion (se guardan en MongoDB)
import { pedir } from "./api";

export type Actividad = {
  _id: string;
  accion: string;
  entidad: string;
  entidadId: number;
  descripcion: string;
  cambios?: Record<string, { antes: unknown; despues: unknown }>;
  fecha: string;
};

export type EventoPlanificacion = {
  _id: string;
  tipo: string;
  entidad: string;
  entidadId: number;
  titulo: string;
  fechaAnterior?: string;
  fechaNueva?: string;
  creadoEn: string;
};

export type Reprogramada = {
  entidad: string;
  entidadId: number;
  titulo: string;
  veces: number;
  ultimaFecha?: string;
};

export function listarActividad(limite = 50): Promise<Actividad[]> {
  return pedir<Actividad[]>("/historial?limite=" + limite);
}

export function listarPlanificacion(limite = 50): Promise<EventoPlanificacion[]> {
  return pedir<EventoPlanificacion[]>("/planificacion?limite=" + limite);
}

export function listarReprogramadas(): Promise<Reprogramada[]> {
  return pedir<Reprogramada[]>("/planificacion/reprogramadas");
}
