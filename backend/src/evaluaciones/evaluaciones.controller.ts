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
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { UsuarioActual } from '../comun/usuario-actual.decorator';
import { ActualizarEvaluacionDto } from './dto/actualizar-evaluacion.dto';
import { CrearEvaluacionDto } from './dto/crear-evaluacion.dto';
import { FiltroEvaluacionesDto } from './dto/filtro-evaluaciones.dto';
import { EvaluacionesService } from './evaluaciones.service';

@ApiTags('Evaluaciones')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('evaluaciones')
export class EvaluacionesController {
  constructor(private readonly evaluacionesService: EvaluacionesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar evaluaciones (por ramo o por rango de fechas)' })
  listar(@UsuarioActual() usuarioId: number, @Query() filtros: FiltroEvaluacionesDto) {
    return this.evaluacionesService.listar(usuarioId, filtros);
  }

  @Post()
  @ApiOperation({ summary: 'Crear una evaluacion en un ramo' })
  @ApiBadRequestResponse({ description: 'Fecha fuera del periodo o ponderaciones sobre 100%' })
  crear(@UsuarioActual() usuarioId: number, @Body() datos: CrearEvaluacionDto) {
    return this.evaluacionesService.crear(usuarioId, datos);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Editar una evaluacion (por ejemplo, registrar la nota)' })
  @ApiNotFoundResponse({ description: 'La evaluacion no existe' })
  actualizar(
    @UsuarioActual() usuarioId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() datos: ActualizarEvaluacionDto,
  ) {
    return this.evaluacionesService.actualizar(usuarioId, id, datos);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Eliminar una evaluacion' })
  eliminar(@UsuarioActual() usuarioId: number, @Param('id', ParseIntPipe) id: number) {
    return this.evaluacionesService.eliminar(usuarioId, id);
  }
}
