import { Module } from '@nestjs/common';
import { HistorialModule } from '../historial/historial.module';
import { PeriodosModule } from '../periodos/periodos.module';
import { AsignaturasController } from './asignaturas.controller';
import { AsignaturasService } from './asignaturas.service';

@Module({
  imports: [HistorialModule, PeriodosModule],
  controllers: [AsignaturasController],
  providers: [AsignaturasService],
  exports: [AsignaturasService],
})
export class AsignaturasModule {}
