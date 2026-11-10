import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CrearSubtareaDto {
  @ApiProperty({ example: 'Buscar bibliografia' })
  @IsString({ message: 'El nombre debe ser texto' })
  @IsNotEmpty({ message: 'Ingresa el nombre de la subtarea' })
  @MaxLength(80, { message: 'El nombre puede tener hasta 80 caracteres' })
  nombre: string;
}
