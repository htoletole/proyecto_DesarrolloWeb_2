import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { UsuarioActual } from '../comun/usuario-actual.decorator';
import { ActualizarTareaDto } from './dto/actualizar-tarea.dto';
import { CrearTareaDto } from './dto/crear-tarea.dto';
import { FiltroTareasDto } from './dto/filtro-tareas.dto';
import { TareasService } from './tareas.service';

@ApiTags('Tareas')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('tareas')
export class TareasController {
  constructor(private readonly tareasService: TareasService) {}

  @Get()
  @ApiOperation({ summary: 'Listar mis tareas (con filtros por estado, prioridad, ramo, fechas y nombre)' })
  listar(@UsuarioActual() usuarioId: number, @Query() filtros: FiltroTareasDto) {
    return this.tareasService.listar(usuarioId, filtros);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle de una tarea con sus subtareas' })
  @ApiNotFoundResponse({ description: 'La tarea no existe' })
  obtener(@UsuarioActual() usuarioId: number, @Param('id', ParseIntPipe) id: number) {
    return this.tareasService.obtener(usuarioId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear una tarea en un ramo' })
  crear(@UsuarioActual() usuarioId: number, @Body() datos: CrearTareaDto) {
    return this.tareasService.crear(usuarioId, datos);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Editar una tarea (estado, fecha, prioridad...)' })
  @ApiConflictResponse({ description: 'No se puede completar con subtareas pendientes' })
  actualizar(
    @UsuarioActual() usuarioId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() datos: ActualizarTareaDto,
  ) {
    return this.tareasService.actualizar(usuarioId, id, datos);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Eliminar una tarea' })
  eliminar(@UsuarioActual() usuarioId: number, @Param('id', ParseIntPipe) id: number) {
    return this.tareasService.eliminar(usuarioId, id);
  }
}
