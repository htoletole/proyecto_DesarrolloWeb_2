import { Module } from '@nestjs/common';
import { HistorialModule } from '../historial/historial.module';
import { PeriodosController } from './periodos.controller';
import { PeriodosService } from './periodos.service';

@Module({
  imports: [HistorialModule],
  controllers: [PeriodosController],
  providers: [PeriodosService],
  exports: [PeriodosService],
})
export class PeriodosModule {}
