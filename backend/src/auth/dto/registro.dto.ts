import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class RegistroDto {
  @ApiProperty({ example: 'Ana', description: 'Entre 3 y 30 caracteres, sin espacios' })
  @IsString({ message: 'El nombre de usuario debe ser texto' })
  @IsNotEmpty({ message: 'Ingresa un nombre de usuario' })
  @MinLength(3, { message: 'El nombre de usuario debe tener al menos 3 caracteres' })
  @MaxLength(30, { message: 'El nombre de usuario puede tener hasta 30 caracteres' })
  @Matches(/^\S+$/, { message: 'El nombre de usuario no puede tener espacios' })
  username: string;

  @ApiProperty({ example: 'ana123456', minLength: 8 })
  @IsString({ message: 'La contraseña debe ser texto' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(72, { message: 'La contraseña puede tener hasta 72 caracteres' })
  password: string;
}
