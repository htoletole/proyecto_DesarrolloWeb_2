import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { UsuarioActual } from '../comun/usuario-actual.decorator';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({ summary: 'Pendientes, vencimientos, proximas evaluaciones, cumplimiento y avance por ramo' })
  resumen(@UsuarioActual() usuarioId: number) {
    return this.dashboardService.resumen(usuarioId);
  }
}
