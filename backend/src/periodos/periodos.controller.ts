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
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { UsuarioActual } from '../comun/usuario-actual.decorator';
import { ActualizarPeriodoDto } from './dto/actualizar-periodo.dto';
import { CrearPeriodoDto } from './dto/crear-periodo.dto';
import { PeriodosService } from './periodos.service';

@ApiTags('Periodos academicos')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('periodos')
export class PeriodosController {
  constructor(private readonly periodosService: PeriodosService) {}

  @Get()
  @ApiOperation({ summary: 'Listar mis periodos academicos' })
  listar(@UsuarioActual() usuarioId: number) {
    return this.periodosService.listar(usuarioId);
  }

  @Post()
  @ApiOperation({ summary: 'Crear un periodo academico' })
  @ApiBadRequestResponse({ description: 'Fechas no validas' })
  @ApiConflictResponse({ description: 'Ya existe un periodo con ese nombre' })
  crear(@UsuarioActual() usuarioId: number, @Body() datos: CrearPeriodoDto) {
    return this.periodosService.crear(usuarioId, datos);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Editar un periodo academico' })
  @ApiNotFoundResponse({ description: 'El periodo no existe' })
  actualizar(
    @UsuarioActual() usuarioId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() datos: ActualizarPeriodoDto,
  ) {
    return this.periodosService.actualizar(usuarioId, id, datos);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Eliminar un periodo (solo si no tiene ramos)' })
  @ApiConflictResponse({ description: 'El periodo todavia tiene ramos' })
  eliminar(@UsuarioActual() usuarioId: number, @Param('id', ParseIntPipe) id: number) {
    return this.periodosService.eliminar(usuarioId, id);
  }
}
