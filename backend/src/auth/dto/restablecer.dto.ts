import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class RestablecerDto {
  @ApiProperty({ example: 'Pepe' })
  @IsString({ message: 'El nombre de usuario debe ser texto' })
  @IsNotEmpty({ message: 'Ingresa tu nombre de usuario' })
  username: string;

  @ApiProperty({ example: 'nuevaClave123', minLength: 8 })
  @IsString({ message: 'La contraseña debe ser texto' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(72, { message: 'La contraseña puede tener hasta 72 caracteres' })
  nueva: string;

  @ApiProperty({ example: 'nuevaClave123' })
  @IsString({ message: 'La contraseña debe ser texto' })
  @IsNotEmpty({ message: 'Repite la nueva contraseña' })
  repetida: string;
}
