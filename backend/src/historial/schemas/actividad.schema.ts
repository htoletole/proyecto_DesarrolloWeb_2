import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import type { Cambio } from '../../comun/cambios';

// un documento por cada accion del usuario (crear, editar, eliminar, completar, ingresar)
// "cambios" guarda el antes y despues de cada campo, y su forma cambia segun la entidad
@Schema({ collection: 'historial_actividad', timestamps: { createdAt: 'fecha', updatedAt: false } })
export class Actividad {
  @Prop({ required: true })
  usuarioId: number;

  @Prop({ required: true })
  accion: string;

  @Prop({ required: true })
  entidad: string;

  @Prop({ required: true })
  entidadId: number;

  @Prop({ required: true })
  descripcion: string;

  @Prop({ type: Object })
  cambios?: Record<string, Cambio>;

  fecha?: Date;
}

export type ActividadDocumento = HydratedDocument<Actividad>;

export const ActividadSchema = SchemaFactory.createForClass(Actividad);

// la consulta mas comun es "lo ultimo que hizo este usuario"
ActividadSchema.index({ usuarioId: 1, fecha: -1 });
ActividadSchema.index({ usuarioId: 1, entidad: 1, entidadId: 1 });
