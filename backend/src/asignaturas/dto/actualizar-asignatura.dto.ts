import { PartialType } from '@nestjs/swagger';
import { CrearAsignaturaDto } from './crear-asignatura.dto';

// para editar se puede mandar solo lo que cambia
export class ActualizarAsignaturaDto extends PartialType(CrearAsignaturaDto) {}
