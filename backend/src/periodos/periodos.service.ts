import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { compararCambios } from '../comun/cambios';
import { aFecha, aTexto } from '../comun/fechas';
import { HistorialService } from '../historial/historial.service';
import { PrismaService } from '../prisma/prisma.service';
import { ActualizarPeriodoDto } from './dto/actualizar-periodo.dto';
import { CrearPeriodoDto } from './dto/crear-periodo.dto';

@Injectable()
export class PeriodosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly historial: HistorialService,
  ) {}

  listar(usuarioId: number) {
    return this.prisma.periodo.findMany({
      where: { usuarioId },
      orderBy: { fechaInicio: 'desc' },
      include: { _count: { select: { asignaturas: true } } },
    });
  }

  async crear(usuarioId: number, datos: CrearPeriodoDto) {
    const nombre = datos.nombre.trim();
    this.validarFechas(datos.fechaInicio, datos.fechaFin);
    await this.validarNombreLibre(usuarioId, nombre, 0);

    const periodo = await this.prisma.periodo.create({
      data: {
        nombre,
        fechaInicio: aFecha(datos.fechaInicio),
        fechaFin: aFecha(datos.fechaFin),
        usuarioId,
      },
    });

    await this.historial.registrar(usuarioId, 'CREAR', 'periodo', periodo.id, 'Período ' + nombre + ' creado');
    return periodo;
  }

  async actualizar(usuarioId: number, id: number, datos: ActualizarPeriodoDto) {
    const anterior = await this.buscarDelUsuario(usuarioId, id);

    // se valida con los datos que quedarian despues del cambio
    const nombre = datos.nombre !== undefined ? datos.nombre.trim() : anterior.nombre;
    const fechaInicio = datos.fechaInicio ?? aTexto(anterior.fechaInicio);
    const fechaFin = datos.fechaFin ?? aTexto(anterior.fechaFin);

    this.validarFechas(fechaInicio, fechaFin);
    await this.validarNombreLibre(usuarioId, nombre, id);

    const periodo = await this.prisma.periodo.update({
      where: { id },
      data: {
        nombre,
        fechaInicio: aFecha(fechaInicio),
        fechaFin: aFecha(fechaFin),
      },
    });

    const cambios = compararCambios(anterior, periodo, ['nombre', 'fechaInicio', 'fechaFin']);
    await this.historial.registrar(usuarioId, 'EDITAR', 'periodo', id, 'Período ' + nombre + ' editado', cambios);
    return periodo;
  }

  async eliminar(usuarioId: number, id: number) {
    const periodo = await this.buscarDelUsuario(usuarioId, id);

    // regla: no se borra un periodo que todavia tiene asignaturas
    const cantidad = await this.prisma.asignatura.count({ where: { periodoId: id } });
    if (cantidad > 0) {
      throw new ConflictException(
        'No puedes eliminar el período ' + periodo.nombre + ': tiene ' + cantidad + ' ramo(s). Elimínalos o muévelos primero',
      );
    }

    await this.prisma.periodo.delete({ where: { id } });
    await this.historial.registrar(usuarioId, 'ELIMINAR', 'periodo', id, 'Período ' + periodo.nombre + ' eliminado');
  }

  // busca el periodo y revisa que sea del usuario
  async buscarDelUsuario(usuarioId: number, id: number) {
    const periodo = await this.prisma.periodo.findFirst({ where: { id, usuarioId } });
    if (!periodo) {
      throw new NotFoundException('El período no existe');
    }
    return periodo;
  }

  private validarFechas(fechaInicio: string, fechaFin: string) {
    if (fechaFin <= fechaInicio) {
      throw new BadRequestException('La fecha de término debe ser posterior a la de inicio');
    }
  }

  private async validarNombreLibre(usuarioId: number, nombre: string, idActual: number) {
    const repetido = await this.prisma.periodo.findFirst({
      where: {
        usuarioId,
        nombre: { equals: nombre, mode: 'insensitive' },
        id: { not: idActual },
      },
    });
    if (repetido) {
      throw new ConflictException('Ya tienes un período llamado ' + nombre);
    }
  }
}
