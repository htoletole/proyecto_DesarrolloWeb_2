import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiNotFoundResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { UsuarioActual } from '../comun/usuario-actual.decorator';
import { ActualizarSubtareaDto } from './dto/actualizar-subtarea.dto';
import { CrearSubtareaDto } from './dto/crear-subtarea.dto';
import { SubtareasService } from './subtareas.service';

@ApiTags('Subtareas')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller()
export class SubtareasController {
  constructor(private readonly subtareasService: SubtareasService) {}

  @Post('tareas/:tareaId/subtareas')
  @ApiOperation({ summary: 'Agregar una subtarea a una tarea' })
  @ApiNotFoundResponse({ description: 'La tarea no existe' })
  crear(
    @UsuarioActual() usuarioId: number,
    @Param('tareaId', ParseIntPipe) tareaId: number,
    @Body() datos: CrearSubtareaDto,
  ) {
    return this.subtareasService.crear(usuarioId, tareaId, datos);
  }

  @Patch('subtareas/:id')
  @ApiOperation({ summary: 'Editar o marcar una subtarea' })
  actualizar(
    @UsuarioActual() usuarioId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() datos: ActualizarSubtareaDto,
  ) {
    return this.subtareasService.actualizar(usuarioId, id, datos);
  }

  @Delete('subtareas/:id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Eliminar una subtarea' })
  eliminar(@UsuarioActual() usuarioId: number, @Param('id', ParseIntPipe) id: number) {
    return this.subtareasService.eliminar(usuarioId, id);
  }
}
