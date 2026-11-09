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
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { UsuarioActual } from '../comun/usuario-actual.decorator';
import { AsignaturasService } from './asignaturas.service';
import { ActualizarAsignaturaDto } from './dto/actualizar-asignatura.dto';
import { CrearAsignaturaDto } from './dto/crear-asignatura.dto';

@ApiTags('Asignaturas (ramos)')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('asignaturas')
export class AsignaturasController {
  constructor(private readonly asignaturasService: AsignaturasService) {}

  @Get()
  @ApiOperation({ summary: 'Listar mis ramos (se puede filtrar por periodo)' })
  @ApiQuery({ name: 'periodoId', required: false, example: 1 })
  listar(
    @UsuarioActual() usuarioId: number,
    @Query('periodoId', new ParseIntPipe({ optional: true })) periodoId?: number,
  ) {
    return this.asignaturasService.listar(usuarioId, periodoId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle de un ramo con sus evaluaciones, tareas y avance' })
  @ApiNotFoundResponse({ description: 'El ramo no existe' })
  obtener(@UsuarioActual() usuarioId: number, @Param('id', ParseIntPipe) id: number) {
    return this.asignaturasService.obtener(usuarioId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear un ramo dentro de un periodo' })
  @ApiConflictResponse({ description: 'Ya existe un ramo con esa ID o nombre en el periodo' })
  crear(@UsuarioActual() usuarioId: number, @Body() datos: CrearAsignaturaDto) {
    return this.asignaturasService.crear(usuarioId, datos);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Editar un ramo' })
  actualizar(
    @UsuarioActual() usuarioId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() datos: ActualizarAsignaturaDto,
  ) {
    return this.asignaturasService.actualizar(usuarioId, id, datos);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Eliminar un ramo (tambien borra sus tareas y evaluaciones)' })
  eliminar(@UsuarioActual() usuarioId: number, @Param('id', ParseIntPipe) id: number) {
    return this.asignaturasService.eliminar(usuarioId, id);
  }
}
