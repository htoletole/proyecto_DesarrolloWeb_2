import { Module } from '@nestjs/common';
import { HistorialModule } from '../historial/historial.module';
import { TareasModule } from '../tareas/tareas.module';
import { SubtareasController } from './subtareas.controller';
import { SubtareasService } from './subtareas.service';

@Module({
  imports: [TareasModule, HistorialModule],
  controllers: [SubtareasController],
  providers: [SubtareasService],
})
export class SubtareasModule {}
