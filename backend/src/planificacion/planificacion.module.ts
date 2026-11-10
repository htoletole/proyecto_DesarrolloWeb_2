import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PlanificacionController } from './planificacion.controller';
import { PlanificacionService } from './planificacion.service';
import {
  EventoPlanificacion,
  EventoPlanificacionSchema,
} from './schemas/evento-planificacion.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EventoPlanificacion.name, schema: EventoPlanificacionSchema },
    ]),
  ],
  controllers: [PlanificacionController],
  providers: [PlanificacionService],
  exports: [PlanificacionService],
})
export class PlanificacionModule {}
