import { OmitType, PartialType } from '@nestjs/swagger';
import { CrearEvaluacionDto } from './crear-evaluacion.dto';

// al editar no se cambia de ramo, y se puede mandar solo lo que cambia
export class ActualizarEvaluacionDto extends PartialType(
  OmitType(CrearEvaluacionDto, ['asignaturaId'] as const),
) {}
