import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type { Cambio } from '../comun/cambios';
import { Actividad } from './schemas/actividad.schema';

@Injectable()
export class HistorialService {
  private readonly logger = new Logger('Historial');

  constructor(
    @InjectModel(Actividad.name)
    private readonly actividadModel: Model<Actividad>,
  ) {}

  // guarda una accion del usuario; si Mongo falla, la operacion en Postgres no se cae
  async registrar(
    usuarioId: number,
    accion: string,
    entidad: string,
    entidadId: number,
    descripcion: string,
    cambios?: Record<string, Cambio>,
  ) {
    try {
      await this.actividadModel.create({
        usuarioId,
        accion,
        entidad,
        entidadId,
        descripcion,
        cambios,
      });
    } catch (error) {
      this.logger.error('No se pudo guardar el historial: ' + String(error));
    }
  }

  // ultimas acciones del usuario
  async listarDelUsuario(usuarioId: number, limite: number) {
    return this.actividadModel
      .find({ usuarioId })
      .sort({ fecha: -1 })
      .limit(limite)
      .lean();
  }

  // todo lo que paso con un registro (por ejemplo, una tarea)
  async listarDeEntidad(usuarioId: number, entidad: string, entidadId: number) {
    return this.actividadModel
      .find({ usuarioId, entidad, entidadId })
      .sort({ fecha: -1 })
      .limit(50)
      .lean();
  }
}
