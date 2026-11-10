import {
  BadRequestException,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { UsuarioActual } from '../comun/usuario-actual.decorator';
import { HistorialService } from './historial.service';

const ENTIDADES = ['tarea', 'subtarea', 'asignatura', 'evaluacion', 'periodo', 'usuario'];

@ApiTags('Historial (MongoDB)')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('historial')
export class HistorialController {
  constructor(private readonly historialService: HistorialService) {}

  @Get()
  @ApiOperation({ summary: 'Ultimas acciones del usuario (actividad reciente)' })
  @ApiQuery({ name: 'limite', required: false, example: 10 })
  listar(
    @UsuarioActual() usuarioId: number,
    @Query('limite', new DefaultValuePipe(20), ParseIntPipe) limite: number,
  ) {
    if (limite < 1 || limite > 100) {
      throw new BadRequestException('El límite debe estar entre 1 y 100');
    }
    return this.historialService.listarDelUsuario(usuarioId, limite);
  }

  @Get(':entidad/:id')
  @ApiOperation({ summary: 'Historial de cambios de un registro (tarea, asignatura, etc.)' })
  listarDeEntidad(
    @UsuarioActual() usuarioId: number,
    @Param('entidad') entidad: string,
    @Param('id', ParseIntPipe) id: number,
  ) {
    if (!ENTIDADES.includes(entidad)) {
      throw new BadRequestException('Entidad no válida. Usa: ' + ENTIDADES.join(', '));
    }
    return this.historialService.listarDeEntidad(usuarioId, entidad, id);
  }
}
