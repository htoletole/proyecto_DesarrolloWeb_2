import { PartialType } from '@nestjs/swagger';
import { CrearPeriodoDto } from './crear-periodo.dto';

// para editar se puede mandar solo lo que cambia
export class ActualizarPeriodoDto extends PartialType(CrearPeriodoDto) {}
