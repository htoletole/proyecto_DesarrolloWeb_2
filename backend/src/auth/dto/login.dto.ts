import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'Pepe' })
  @IsString({ message: 'El nombre de usuario debe ser texto' })
  @IsNotEmpty({ message: 'Completa usuario y contraseña' })
  username: string;

  @ApiProperty({ example: 'pepe12345' })
  @IsString({ message: 'La contraseña debe ser texto' })
  @IsNotEmpty({ message: 'Completa usuario y contraseña' })
  password: string;
}
