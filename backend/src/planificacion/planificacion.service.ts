import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventoPlanificacion } from './schemas/evento-planificacion.schema';

@Injectable()
export class PlanificacionService {
  private readonly logger = new Logger('Planificacion');

  constructor(
    @InjectModel(EventoPlanificacion.name)
    private readonly eventoModel: Model<EventoPlanificacion>,
  ) {}

  // compara la fecha anterior con la nueva y guarda el evento que corresponda
  async registrarCambioDeFecha(
    usuarioId: number,
    entidad: string,
    entidadId: number,
    titulo: string,
    fechaAnterior: string | null,
    fechaNueva: string | null,
    detalle?: Record<string, unknown>,
  ) {
    if (fechaAnterior === fechaNueva) {
      return;
    }

    let tipo = 'REPROGRAMADA';
    if (!fechaAnterior) {
      tipo = 'PROGRAMADA';
    } else if (!fechaNueva) {
      tipo = 'SIN_FECHA';
    }

    try {
      await this.eventoModel.create({
        usuarioId,
        tipo,
        entidad,
        entidadId,
        titulo,
        fechaAnterior: fechaAnterior ?? undefined,
        fechaNueva: fechaNueva ?? undefined,
        detalle,
      });
    } catch (error) {
      this.logger.error('No se pudo guardar el evento de planificacion: ' + String(error));
    }
  }

  // ultimos eventos del usuario
  async listarDelUsuario(usuarioId: number, limite: number) {
    return this.eventoModel
      .find({ usuarioId })
      .sort({ creadoEn: -1 })
      .limit(limite)
      .lean();
  }

  // como se fue moviendo la fecha de una tarea o evaluacion
  async listarDeEntidad(usuarioId: number, entidad: string, entidadId: number) {
    return this.eventoModel
      .find({ usuarioId, entidad, entidadId })
      .sort({ creadoEn: -1 })
      .lean();
  }

  // tareas o evaluaciones que mas veces se han postergado (agregacion de MongoDB)
  async masReprogramadas(usuarioId: number, limite: number) {
    return this.eventoModel.aggregate([
      { $match: { usuarioId, tipo: 'REPROGRAMADA' } },
      { $sort: { creadoEn: 1 } },
      {
        $group: {
          _id: { entidad: '$entidad', entidadId: '$entidadId' },
          titulo: { $last: '$titulo' },
          veces: { $sum: 1 },
          ultimaFecha: { $last: '$fechaNueva' },
        },
      },
      { $sort: { veces: -1 } },
      { $limit: limite },
      {
        $project: {
          _id: 0,
          entidad: '$_id.entidad',
          entidadId: '$_id.entidadId',
          titulo: 1,
          veces: 1,
          ultimaFecha: 1,
        },
      },
    ]);
  }
}
