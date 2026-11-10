import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { compararCambios } from '../comun/cambios';
import { HistorialService } from '../historial/historial.service';
import { PeriodosService } from '../periodos/periodos.service';
import { PrismaService } from '../prisma/prisma.service';
import { calcularAvance } from './avance';
import { ActualizarAsignaturaDto } from './dto/actualizar-asignatura.dto';
import { CrearAsignaturaDto } from './dto/crear-asignatura.dto';

@Injectable()
export class AsignaturasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly periodosService: PeriodosService,
    private readonly historial: HistorialService,
  ) {}

  listar(usuarioId: number, periodoId?: number) {
    return this.prisma.asignatura.findMany({
      where: { periodoId, periodo: { usuarioId } },
      orderBy: { nombre: 'asc' },
      include: { _count: { select: { tareas: true, evaluaciones: true } } },
    });
  }

  // detalle del ramo con sus evaluaciones, tareas y avance
  async obtener(usuarioId: number, id: number) {
    const asignatura = await this.prisma.asignatura.findFirst({
      where: { id, periodo: { usuarioId } },
      include: {
        periodo: true,
        evaluaciones: { orderBy: { fecha: 'asc' } },
        tareas: {
          orderBy: { fecha: 'asc' },
          select: { id: true, nombre: true, estado: true, prioridad: true, fecha: true },
        },
      },
    });
    if (!asignatura) {
      throw new NotFoundException('El ramo no existe');
    }

    const avance = calcularAvance(asignatura.tareas, asignatura.evaluaciones);
    return { ...asignatura, avance };
  }

  async crear(usuarioId: number, datos: CrearAsignaturaDto) {
    const periodo = await this.periodosService.buscarDelUsuario(usuarioId, datos.periodoId);
    const codigo = datos.codigo.trim();
    const nombre = datos.nombre.trim();
    await this.validarRepetidos(periodo.id, periodo.nombre, codigo, nombre, 0);

    const asignatura = await this.prisma.asignatura.create({
      data: {
        codigo,
        nombre,
        modalidad: datos.modalidad,
        color: datos.color ?? '#FFAE52',
        logo: datos.logo ?? null,
        periodoId: periodo.id,
      },
    });

    await this.historial.registrar(usuarioId, 'CREAR', 'asignatura', asignatura.id, 'Ramo ' + nombre + ' creado');
    return asignatura;
  }

  async actualizar(usuarioId: number, id: number, datos: ActualizarAsignaturaDto) {
    const anterior = await this.buscarDelUsuario(usuarioId, id);

    // si cambia de periodo, el nuevo tambien debe ser del usuario
    const periodoId = datos.periodoId ?? anterior.periodoId;
    const periodo = await this.periodosService.buscarDelUsuario(usuarioId, periodoId);

    const codigo = datos.codigo !== undefined ? datos.codigo.trim() : anterior.codigo;
    const nombre = datos.nombre !== undefined ? datos.nombre.trim() : anterior.nombre;
    await this.validarRepetidos(periodo.id, periodo.nombre, codigo, nombre, id);

    // logo: undefined lo deja igual, null lo quita
    let logo = anterior.logo;
    if (datos.logo !== undefined) {
      logo = datos.logo;
    }

    const asignatura = await this.prisma.asignatura.update({
      where: { id },
      data: {
        codigo,
        nombre,
        modalidad: datos.modalidad ?? anterior.modalidad,
        color: datos.color ?? anterior.color,
        logo,
        periodoId,
      },
    });

    const cambios = compararCambios(anterior, asignatura, ['codigo', 'nombre', 'modalidad', 'color', 'periodoId']);
    await this.historial.registrar(usuarioId, 'EDITAR', 'asignatura', id, 'Ramo ' + nombre + ' editado', cambios);
    return asignatura;
  }

  // al borrar el ramo tambien se borran sus tareas y evaluaciones (onDelete: Cascade)
  async eliminar(usuarioId: number, id: number) {
    const asignatura = await this.buscarDelUsuario(usuarioId, id);
    const tareas = await this.prisma.tarea.count({ where: { asignaturaId: id } });

    await this.prisma.asignatura.delete({ where: { id } });

    let descripcion = 'Ramo ' + asignatura.nombre + ' eliminado';
    if (tareas > 0) {
      descripcion += ' junto con ' + tareas + ' tarea(s)';
    }
    await this.historial.registrar(usuarioId, 'ELIMINAR', 'asignatura', id, descripcion);
  }

  // busca el ramo y revisa que sea del usuario
  async buscarDelUsuario(usuarioId: number, id: number) {
    const asignatura = await this.prisma.asignatura.findFirst({
      where: { id, periodo: { usuarioId } },
      include: { periodo: true },
    });
    if (!asignatura) {
      throw new NotFoundException('El ramo no existe');
    }
    return asignatura;
  }

  // regla: en un mismo periodo no se repite el ID ni el nombre del ramo (igual que en el Taller 2)
  private async validarRepetidos(periodoId: number, nombrePeriodo: string, codigo: string, nombre: string, idActual: number) {
    const mismoCodigo = await this.prisma.asignatura.findFirst({
      where: { periodoId, codigo: { equals: codigo, mode: 'insensitive' }, id: { not: idActual } },
    });
    if (mismoCodigo) {
      throw new ConflictException('Ya existe un ramo con esa ID en el período ' + nombrePeriodo);
    }

    const mismoNombre = await this.prisma.asignatura.findFirst({
      where: { periodoId, nombre: { equals: nombre, mode: 'insensitive' }, id: { not: idActual } },
    });
    if (mismoNombre) {
      throw new ConflictException('Ya existe un ramo con ese nombre en el período ' + nombrePeriodo);
    }
  }
}
