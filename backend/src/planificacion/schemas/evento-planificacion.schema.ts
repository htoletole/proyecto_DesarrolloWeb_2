import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

// un documento cada vez que se programa o se mueve la fecha de una tarea o evaluacion
// tipos: PROGRAMADA (se le puso fecha), REPROGRAMADA (se cambio la fecha), SIN_FECHA (se le quito)
@Schema({ collection: 'eventos_planificacion', timestamps: { createdAt: 'creadoEn', updatedAt: false } })
export class EventoPlanificacion {
  @Prop({ required: true })
  usuarioId: number;

  @Prop({ required: true })
  tipo: string;

  @Prop({ required: true })
  entidad: string;

  @Prop({ required: true })
  entidadId: number;

  @Prop({ required: true })
  titulo: string;

  @Prop()
  fechaAnterior?: string;

  @Prop()
  fechaNueva?: string;

  // datos extra que cambian segun la entidad (ramo, prioridad, ponderacion...)
  @Prop({ type: Object })
  detalle?: Record<string, unknown>;

  creadoEn?: Date;
}

export type EventoPlanificacionDocumento = HydratedDocument<EventoPlanificacion>;

export const EventoPlanificacionSchema = SchemaFactory.createForClass(EventoPlanificacion);

EventoPlanificacionSchema.index({ usuarioId: 1, creadoEn: -1 });
EventoPlanificacionSchema.index({ usuarioId: 1, entidad: 1, entidadId: 1 });
