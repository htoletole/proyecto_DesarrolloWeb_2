import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HistorialController } from './historial.controller';
import { HistorialService } from './historial.service';
import { Actividad, ActividadSchema } from './schemas/actividad.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Actividad.name, schema: ActividadSchema }])],
  controllers: [HistorialController],
  providers: [HistorialService],
  exports: [HistorialService],
})
export class HistorialModule {}
