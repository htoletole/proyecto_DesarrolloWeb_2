import { Injectable, NotFoundException } from '@nestjs/common';
import { EstadoTarea } from '../generated/prisma/client';
import { HistorialService } from '../historial/historial.service';
import { PrismaService } from '../prisma/prisma.service';
import { TareasService } from '../tareas/tareas.service';
import { ActualizarSubtareaDto } from './dto/actualizar-subtarea.dto';
import { CrearSubtareaDto } from './dto/crear-subtarea.dto';

@Injectable()
export class SubtareasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tareasService: TareasService,
    private readonly historial: HistorialService,
  ) {}

  async crear(usuarioId: number, tareaId: number, datos: CrearSubtareaDto) {
    const tarea = await this.tareasService.buscarDelUsuario(usuarioId, tareaId);
    const nombre = datos.nombre.trim();

    const subtarea = await this.prisma.subtarea.create({
      data: { nombre, tareaId },
    });

    // regla: si la tarea estaba completada y se le agrega algo pendiente, vuelve a "en progreso"
    await this.reabrirSiEstabaCompletada(tarea.id, tarea.estado);

    await this.historial.registrar(usuarioId, 'CREAR', 'subtarea', subtarea.id, 'Subtarea ' + nombre + ' agregada a ' + tarea.nombre);
    return subtarea;
  }

  async actualizar(usuarioId: number, id: number, datos: ActualizarSubtareaDto) {
    const anterior = await this.buscarDelUsuario(usuarioId, id);

    const subtarea = await this.prisma.subtarea.update({
      where: { id },
      data: {
        nombre: datos.nombre !== undefined ? datos.nombre.trim() : anterior.nombre,
        completada: datos.completada ?? anterior.completada,
      },
    });

    if (!subtarea.completada) {
      await this.reabrirSiEstabaCompletada(anterior.tareaId, anterior.tarea.estado);
    }

    let texto = 'Subtarea ' + subtarea.nombre + ' editada';
    if (datos.completada === true) {
      texto = 'Subtarea ' + subtarea.nombre + ' completada';
    }
    await this.historial.registrar(usuarioId, 'EDITAR', 'subtarea', id, texto);
    return subtarea;
  }

  async eliminar(usuarioId: number, id: number) {
    const subtarea = await this.buscarDelUsuario(usuarioId, id);
    await this.prisma.subtarea.delete({ where: { id } });
    await this.historial.registrar(usuarioId, 'ELIMINAR', 'subtarea', id, 'Subtarea ' + subtarea.nombre + ' eliminada');
  }

  // busca la subtarea y revisa que su tarea sea del usuario
  private async buscarDelUsuario(usuarioId: number, id: number) {
    const subtarea = await this.prisma.subtarea.findFirst({
      where: { id, tarea: { usuarioId } },
      include: { tarea: true },
    });
    if (!subtarea) {
      throw new NotFoundException('La subtarea no existe');
    }
    return subtarea;
  }

  private async reabrirSiEstabaCompletada(tareaId: number, estado: EstadoTarea) {
    if (estado !== EstadoTarea.COMPLETADA) {
      return;
    }
    await this.prisma.tarea.update({
      where: { id: tareaId },
      data: { estado: EstadoTarea.EN_PROGRESO, completadaEn: null },
    });
  }
}
