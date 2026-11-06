import { Module } from '@nestjs/common';
import { AsignaturasModule } from '../asignaturas/asignaturas.module';
import { HistorialModule } from '../historial/historial.module';
import { PlanificacionModule } from '../planificacion/planificacion.module';
import { EvaluacionesController } from './evaluaciones.controller';
import { EvaluacionesService } from './evaluaciones.service';

@Module({
  imports: [AsignaturasModule, HistorialModule, PlanificacionModule],
  controllers: [EvaluacionesController],
  providers: [EvaluacionesService],
  exports: [EvaluacionesService],
})
export class EvaluacionesModule {}
