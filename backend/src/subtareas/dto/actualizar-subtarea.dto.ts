import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class ActualizarSubtareaDto {
  @ApiPropertyOptional({ example: 'Buscar bibliografia' })
  @IsOptional()
  @IsString({ message: 'El nombre debe ser texto' })
  @IsNotEmpty({ message: 'El nombre no puede quedar vacío' })
  @MaxLength(80, { message: 'El nombre puede tener hasta 80 caracteres' })
  nombre?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean({ message: 'completada debe ser true o false' })
  completada?: boolean;
}
