import { Module } from '@nestjs/common';
import { PlanificacionModule } from '../planificacion/planificacion.module';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [PlanificacionModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
