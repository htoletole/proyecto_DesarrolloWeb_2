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
import { PlanificacionService } from './planificacion.service';

const ENTIDADES = ['tarea', 'evaluacion'];

@ApiTags('Planificacion (MongoDB)')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('planificacion')
export class PlanificacionController {
  constructor(private readonly planificacionService: PlanificacionService) {}

  @Get()
  @ApiOperation({ summary: 'Ultimos eventos de planificacion (fechas programadas y movidas)' })
  @ApiQuery({ name: 'limite', required: false, example: 20 })
  listar(
    @UsuarioActual() usuarioId: number,
    @Query('limite', new DefaultValuePipe(20), ParseIntPipe) limite: number,
  ) {
    if (limite < 1 || limite > 100) {
      throw new BadRequestException('El límite debe estar entre 1 y 100');
    }
    return this.planificacionService.listarDelUsuario(usuarioId, limite);
  }

  @Get('reprogramadas')
  @ApiOperation({ summary: 'Lo que mas veces se ha postergado' })
  masReprogramadas(@UsuarioActual() usuarioId: number) {
    return this.planificacionService.masReprogramadas(usuarioId, 5);
  }

  @Get(':entidad/:id')
  @ApiOperation({ summary: 'Como se fue moviendo la fecha de una tarea o evaluacion' })
  listarDeEntidad(
    @UsuarioActual() usuarioId: number,
    @Param('entidad') entidad: string,
    @Param('id', ParseIntPipe) id: number,
  ) {
    if (!ENTIDADES.includes(entidad)) {
      throw new BadRequestException('Entidad no válida. Usa: ' + ENTIDADES.join(', '));
    }
    return this.planificacionService.listarDeEntidad(usuarioId, entidad, id);
  }
}
