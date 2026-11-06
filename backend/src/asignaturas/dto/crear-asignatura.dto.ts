import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsHexColor,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { Modalidad } from '../../generated/prisma/client';

export class CrearAsignaturaDto {
  @ApiProperty({ example: 'CINF101', description: 'El ID del ramo que usa la universidad' })
  @IsString({ message: 'El ID debe ser texto' })
  @IsNotEmpty({ message: 'Ingresa el ID del ramo' })
  @MaxLength(20, { message: 'El ID puede tener hasta 20 caracteres' })
  codigo: string;

  @ApiProperty({ example: 'Desarrollo Web y Movil' })
  @IsString({ message: 'El nombre debe ser texto' })
  @IsNotEmpty({ message: 'Ingresa el nombre del ramo' })
  @MaxLength(60, { message: 'El nombre puede tener hasta 60 caracteres' })
  nombre: string;

  @ApiProperty({ enum: Modalidad, example: Modalidad.PRESENCIAL })
  @IsEnum(Modalidad, { message: 'La modalidad debe ser ONLINE, PRESENCIAL o ASINCRONICO' })
  modalidad: Modalidad;

  @ApiPropertyOptional({ example: '#FFAE52' })
  @IsOptional()
  @IsHexColor({ message: 'El color debe ser un código como #FFAE52' })
  color?: string;

  @ApiPropertyOptional({ description: 'Imagen en base64 (data:image/...), maximo 500 KB. null la quita' })
  @IsOptional()
  @IsString({ message: 'El logo debe ser una imagen' })
  @Matches(/^data:image\/(png|jpeg|jpg|gif|webp|svg\+xml);base64,/, { message: 'El logo debe ser una imagen' })
  @MaxLength(700000, { message: 'El logo debe pesar menos de 500 KB' })
  logo?: string | null;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt({ message: 'Elige un período' })
  periodoId: number;
}
