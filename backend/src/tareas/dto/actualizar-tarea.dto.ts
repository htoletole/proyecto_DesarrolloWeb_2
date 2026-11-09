import { PartialType } from '@nestjs/swagger';
import { CrearTareaDto } from './crear-tarea.dto';

// para editar se puede mandar solo lo que cambia (por ejemplo, solo el estado)
export class ActualizarTareaDto extends PartialType(CrearTareaDto) {}
