import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AsignaturasService } from '../asignaturas/asignaturas.service';
import { compararCambios } from '../comun/cambios';
import { aFecha, aTexto, fechaLegible } from '../comun/fechas';
import { HistorialService } from '../historial/historial.service';
import { PlanificacionService } from '../planificacion/planificacion.service';
import { PrismaService } from '../prisma/prisma.service';
import { ActualizarEvaluacionDto } from './dto/actualizar-evaluacion.dto';
import { CrearEvaluacionDto } from './dto/crear-evaluacion.dto';
import { FiltroEvaluacionesDto } from './dto/filtro-evaluaciones.dto';

// datos del ramo que se mandan junto con cada evaluacion
const RAMO = { select: { id: true, nombre: true, color: true } };

interface PeriodoFechas {
  nombre: string;
  fechaInicio: Date;
  fechaFin: Date;
}

@Injectable()
export class EvaluacionesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly asignaturasService: AsignaturasService,
    private readonly historial: HistorialService,
    private readonly planificacion: PlanificacionService,
  ) {}

  listar(usuarioId: number, filtros: FiltroEvaluacionesDto) {
    const fecha: { gte?: Date; lte?: Date } = {};
    if (filtros.desde) {
      fecha.gte = aFecha(filtros.desde);
    }
    if (filtros.hasta) {
      fecha.lte = aFecha(filtros.hasta);
    }

    return this.prisma.evaluacion.findMany({
      where: {
        asignaturaId: filtros.asignaturaId,
        asignatura: { periodo: { usuarioId } },
        fecha,
      },
      orderBy: { fecha: 'asc' },
      include: { asignatura: RAMO },
    });
  }

  async crear(usuarioId: number, datos: CrearEvaluacionDto) {
    const asignatura = await this.asignaturasService.buscarDelUsuario(usuarioId, datos.asignaturaId);
    const nombre = datos.nombre.trim();

    this.validarFechaEnPeriodo(datos.fecha, asignatura.periodo);
    await this.validarPonderacion(asignatura.id, asignatura.nombre, datos.ponderacion, 0);

    const evaluacion = await this.prisma.evaluacion.create({
      data: {
        nombre,
        tipo: datos.tipo,
        fecha: aFecha(datos.fecha),
        ponderacion: datos.ponderacion,
        nota: datos.nota ?? null,
        asignaturaId: asignatura.id,
      },
      include: { asignatura: RAMO },
    });

    await this.planificacion.registrarCambioDeFecha(usuarioId, 'evaluacion', evaluacion.id, nombre, null, datos.fecha, {
      asignatura: asignatura.nombre,
      ponderacion: datos.ponderacion,
    });
    await this.historial.registrar(
      usuarioId, 'CREAR', 'evaluacion', evaluacion.id,
      'Evaluación ' + nombre + ' de ' + asignatura.nombre + ' creada',
    );
    return evaluacion;
  }

  async actualizar(usuarioId: number, id: number, datos: ActualizarEvaluacionDto) {
    const anterior = await this.buscarDelUsuario(usuarioId, id);
    const asignatura = anterior.asignatura;

    // se valida con los datos que quedarian despues del cambio
    const nombre = datos.nombre !== undefined ? datos.nombre.trim() : anterior.nombre;
    const fecha = datos.fecha ?? aTexto(anterior.fecha);
    const ponderacion = datos.ponderacion ?? anterior.ponderacion;

    this.validarFechaEnPeriodo(fecha, asignatura.periodo);
    await this.validarPonderacion(asignatura.id, asignatura.nombre, ponderacion, id);

    // nota: undefined la deja igual, null la borra
    let nota = anterior.nota;
    if (datos.nota !== undefined) {
      nota = datos.nota;
    }

    const evaluacion = await this.prisma.evaluacion.update({
      where: { id },
      data: {
        nombre,
        tipo: datos.tipo ?? anterior.tipo,
        fecha: aFecha(fecha),
        ponderacion,
        nota,
      },
      include: { asignatura: RAMO },
    });

    await this.planificacion.registrarCambioDeFecha(
      usuarioId, 'evaluacion', id, nombre, aTexto(anterior.fecha), fecha,
      { asignatura: asignatura.nombre, ponderacion },
    );

    const cambios = compararCambios(anterior, evaluacion, ['nombre', 'tipo', 'fecha', 'ponderacion', 'nota']);
    await this.historial.registrar(usuarioId, 'EDITAR', 'evaluacion', id, 'Evaluación ' + nombre + ' editada', cambios);
    return evaluacion;
  }

  async eliminar(usuarioId: number, id: number) {
    const evaluacion = await this.buscarDelUsuario(usuarioId, id);
    await this.prisma.evaluacion.delete({ where: { id } });
    await this.historial.registrar(usuarioId, 'ELIMINAR', 'evaluacion', id, 'Evaluación ' + evaluacion.nombre + ' eliminada');
  }

  // busca la evaluacion y revisa que su ramo sea del usuario
  async buscarDelUsuario(usuarioId: number, id: number) {
    const evaluacion = await this.prisma.evaluacion.findFirst({
      where: { id, asignatura: { periodo: { usuarioId } } },
      include: { asignatura: { include: { periodo: true } } },
    });
    if (!evaluacion) {
      throw new NotFoundException('La evaluación no existe');
    }
    return evaluacion;
  }

  // regla: la evaluacion debe caer dentro de las fechas del periodo del ramo
  validarFechaEnPeriodo(fecha: string, periodo: PeriodoFechas) {
    const inicio = aTexto(periodo.fechaInicio);
    const fin = aTexto(periodo.fechaFin);

    if (fecha < inicio || fecha > fin) {
      throw new BadRequestException(
        'La fecha debe estar dentro del período ' + periodo.nombre +
          ' (' + fechaLegible(inicio) + ' al ' + fechaLegible(fin) + ')',
      );
    }
  }

  // regla: las ponderaciones de un ramo no pueden sumar mas de 100%
  async validarPonderacion(asignaturaId: number, nombreRamo: string, ponderacion: number, idActual: number) {
    const resultado = await this.prisma.evaluacion.aggregate({
      where: { asignaturaId, id: { not: idActual } },
      _sum: { ponderacion: true },
    });
    const usada = resultado._sum.ponderacion ?? 0;

    if (usada + ponderacion > 100) {
      throw new BadRequestException(
        'Las evaluaciones de ' + nombreRamo + ' ya suman ' + usada + '%. Puedes asignar como máximo ' + (100 - usada) + '%',
      );
    }
  }
}
