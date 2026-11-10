import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { FORMATO_FECHA } from '../../comun/fechas';
import { TipoEvaluacion } from '../../generated/prisma/client';

export class CrearEvaluacionDto {
  @ApiProperty({ example: 'Solemne 1' })
  @IsString({ message: 'El nombre debe ser texto' })
  @IsNotEmpty({ message: 'Ingresa el nombre de la evaluación' })
  @MaxLength(60, { message: 'El nombre puede tener hasta 60 caracteres' })
  nombre: string;

  @ApiProperty({ enum: TipoEvaluacion, example: TipoEvaluacion.PRUEBA })
  @IsEnum(TipoEvaluacion, { message: 'El tipo de evaluación no es válido' })
  tipo: TipoEvaluacion;

  @ApiProperty({ example: '2026-10-15' })
  @Matches(FORMATO_FECHA, { message: 'La fecha debe tener formato AAAA-MM-DD' })
  @IsDateString({ strict: true }, { message: 'La fecha no es válida' })
  fecha: string;

  @ApiProperty({ example: 30, description: 'Porcentaje de la nota final (1 a 100)' })
  @Type(() => Number)
  @IsInt({ message: 'La ponderación debe ser un número entero' })
  @Min(1, { message: 'La ponderación mínima es 1%' })
  @Max(100, { message: 'La ponderación máxima es 100%' })
  ponderacion: number;

  @ApiPropertyOptional({ example: 5.5, description: 'Nota de 1.0 a 7.0, o null si aun no se rinde' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 1 }, { message: 'La nota debe tener como máximo un decimal' })
  @Min(1, { message: 'La nota mínima es 1.0' })
  @Max(7, { message: 'La nota máxima es 7.0' })
  nota?: number | null;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt({ message: 'Elige un ramo' })
  asignaturaId: number;
}
