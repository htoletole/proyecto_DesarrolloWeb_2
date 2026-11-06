import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AsignaturasService } from '../asignaturas/asignaturas.service';
import { compararCambios } from '../comun/cambios';
import { aFecha, aTexto } from '../comun/fechas';
import { EstadoTarea } from '../generated/prisma/client';
import { HistorialService } from '../historial/historial.service';
import { PlanificacionService } from '../planificacion/planificacion.service';
import { PrismaService } from '../prisma/prisma.service';
import { ActualizarTareaDto } from './dto/actualizar-tarea.dto';
import { CrearTareaDto } from './dto/crear-tarea.dto';
import { FiltroTareasDto } from './dto/filtro-tareas.dto';

// datos que se devuelven junto con cada tarea
const INCLUIR = {
  asignatura: { select: { id: true, codigo: true, nombre: true, color: true } },
  evaluacion: { select: { id: true, nombre: true } },
  subtareas: { orderBy: { id: 'asc' as const } },
};

@Injectable()
export class TareasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly asignaturasService: AsignaturasService,
    private readonly historial: HistorialService,
    private readonly planificacion: PlanificacionService,
  ) {}

  listar(usuarioId: number, filtros: FiltroTareasDto) {
    const fecha: { gte?: Date; lte?: Date } = {};
    if (filtros.desde) {
      fecha.gte = aFecha(filtros.desde);
    }
    if (filtros.hasta) {
      fecha.lte = aFecha(filtros.hasta);
    }

    const where: Record<string, unknown> = {
      usuarioId,
      estado: filtros.estado,
      prioridad: filtros.prioridad,
      asignaturaId: filtros.asignaturaId,
    };
    if (filtros.desde || filtros.hasta) {
      where.fecha = fecha;
    }
    if (filtros.q) {
      where.nombre = { contains: filtros.q, mode: 'insensitive' };
    }

    return this.prisma.tarea.findMany({
      where,
      orderBy: [{ fecha: { sort: 'asc', nulls: 'last' } }, { id: 'asc' }],
      include: INCLUIR,
    });
  }

  async obtener(usuarioId: number, id: number) {
    return this.buscarDelUsuario(usuarioId, id);
  }

  async crear(usuarioId: number, datos: CrearTareaDto) {
    const asignatura = await this.asignaturasService.buscarDelUsuario(usuarioId, datos.asignaturaId);
    const nombre = datos.nombre.trim();

    let evaluacionId: number | null = null;
    if (datos.evaluacionId) {
      evaluacionId = await this.validarEvaluacion(datos.evaluacionId, asignatura.id);
    }

    const estado = datos.estado ?? EstadoTarea.PENDIENTE;
    const fecha = datos.fecha ?? null;

    const tarea = await this.prisma.tarea.create({
      data: {
        nombre,
        descripcion: datos.descripcion?.trim() ?? '',
        estado,
        prioridad: datos.prioridad,
        fecha: fecha ? aFecha(fecha) : null,
        horaEntrega: datos.horaEntrega ?? null,
        completadaEn: estado === EstadoTarea.COMPLETADA ? new Date() : null,
        usuarioId,
        asignaturaId: asignatura.id,
        evaluacionId,
      },
      include: INCLUIR,
    });

    await this.planificacion.registrarCambioDeFecha(usuarioId, 'tarea', tarea.id, nombre, null, fecha, {
      asignatura: asignatura.nombre,
      prioridad: tarea.prioridad,
    });
    await this.historial.registrar(usuarioId, 'CREAR', 'tarea', tarea.id, 'Tarea ' + nombre + ' creada en ' + asignatura.nombre);
    return tarea;
  }

  async actualizar(usuarioId: number, id: number, datos: ActualizarTareaDto) {
    const anterior = await this.buscarDelUsuario(usuarioId, id);

    // ramo: si cambia, el nuevo tambien debe ser del usuario
    let asignaturaId = anterior.asignaturaId;
    let nombreRamo = anterior.asignatura.nombre;
    if (datos.asignaturaId !== undefined && datos.asignaturaId !== anterior.asignaturaId) {
      const asignatura = await this.asignaturasService.buscarDelUsuario(usuarioId, datos.asignaturaId);
      asignaturaId = asignatura.id;
      nombreRamo = asignatura.nombre;
    }

    // evaluacion: debe ser del mismo ramo; si cambia el ramo y no se manda, se quita
    let evaluacionId = anterior.evaluacionId;
    if (datos.evaluacionId !== undefined) {
      evaluacionId = datos.evaluacionId ? await this.validarEvaluacion(datos.evaluacionId, asignaturaId) : null;
    } else if (asignaturaId !== anterior.asignaturaId) {
      evaluacionId = null;
    }

    // regla: no se puede completar una tarea con subtareas pendientes
    const estado = datos.estado ?? anterior.estado;
    const seCompleta = estado === EstadoTarea.COMPLETADA && anterior.estado !== EstadoTarea.COMPLETADA;
    if (seCompleta) {
      const pendientes = anterior.subtareas.filter((subtarea) => !subtarea.completada).length;
      if (pendientes > 0) {
        throw new ConflictException(
          'No puedes completar la tarea: tiene ' + pendientes + ' subtarea(s) pendiente(s)',
        );
      }
    }

    let completadaEn = anterior.completadaEn;
    if (seCompleta) {
      completadaEn = new Date();
    } else if (estado !== EstadoTarea.COMPLETADA) {
      completadaEn = null;
    }

    // fecha y hora: undefined las deja igual, null las quita
    let fecha = aTexto(anterior.fecha);
    if (datos.fecha !== undefined) {
      fecha = datos.fecha;
    }
    let horaEntrega = anterior.horaEntrega;
    if (datos.horaEntrega !== undefined) {
      horaEntrega = datos.horaEntrega;
    }

    const nombre = datos.nombre !== undefined ? datos.nombre.trim() : anterior.nombre;

    const tarea = await this.prisma.tarea.update({
      where: { id },
      data: {
        nombre,
        descripcion: datos.descripcion !== undefined ? datos.descripcion.trim() : anterior.descripcion,
        estado,
        prioridad: datos.prioridad ?? anterior.prioridad,
        fecha: fecha ? aFecha(fecha) : null,
        horaEntrega,
        completadaEn,
        asignaturaId,
        evaluacionId,
      },
      include: INCLUIR,
    });

    await this.planificacion.registrarCambioDeFecha(
      usuarioId, 'tarea', id, nombre, aTexto(anterior.fecha), fecha,
      { asignatura: nombreRamo, prioridad: tarea.prioridad },
    );

    const cambios = compararCambios(anterior, tarea, [
      'nombre', 'descripcion', 'estado', 'prioridad', 'fecha', 'horaEntrega', 'asignaturaId', 'evaluacionId',
    ]);
    const accion = seCompleta ? 'COMPLETAR' : 'EDITAR';
    const texto = seCompleta ? 'Tarea ' + nombre + ' completada' : 'Tarea ' + nombre + ' editada';
    await this.historial.registrar(usuarioId, accion, 'tarea', id, texto, cambios);
    return tarea;
  }

  async eliminar(usuarioId: number, id: number) {
    const tarea = await this.buscarDelUsuario(usuarioId, id);
    await this.prisma.tarea.delete({ where: { id } });
    await this.historial.registrar(usuarioId, 'ELIMINAR', 'tarea', id, 'Tarea ' + tarea.nombre + ' eliminada');
  }

  // busca la tarea y revisa que sea del usuario
  async buscarDelUsuario(usuarioId: number, id: number) {
    const tarea = await this.prisma.tarea.findFirst({
      where: { id, usuarioId },
      include: INCLUIR,
    });
    if (!tarea) {
      throw new NotFoundException('La tarea no existe');
    }
    return tarea;
  }

  // la evaluacion asociada debe existir y ser del mismo ramo que la tarea
  private async validarEvaluacion(evaluacionId: number, asignaturaId: number) {
    const evaluacion = await this.prisma.evaluacion.findFirst({
      where: { id: evaluacionId, asignaturaId },
    });
    if (!evaluacion) {
      throw new BadRequestException('La evaluación elegida no pertenece a ese ramo');
    }
    return evaluacion.id;
  }
}
