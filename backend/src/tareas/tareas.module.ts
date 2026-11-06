import { Module } from '@nestjs/common';
import { AsignaturasModule } from '../asignaturas/asignaturas.module';
import { HistorialModule } from '../historial/historial.module';
import { PlanificacionModule } from '../planificacion/planificacion.module';
import { TareasController } from './tareas.controller';
import { TareasService } from './tareas.service';

@Module({
  imports: [AsignaturasModule, HistorialModule, PlanificacionModule],
  controllers: [TareasController],
  providers: [TareasService],
  exports: [TareasService],
})
export class TareasModule {}
