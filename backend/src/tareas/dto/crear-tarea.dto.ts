import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { FORMATO_FECHA } from '../../comun/fechas';
import { EstadoTarea, Prioridad } from '../../generated/prisma/client';

export class CrearTareaDto {
  @ApiProperty({ example: 'Informe del laboratorio 3' })
  @IsString({ message: 'El nombre debe ser texto' })
  @IsNotEmpty({ message: 'Ingresa el nombre de la tarea' })
  @MaxLength(80, { message: 'El nombre puede tener hasta 80 caracteres' })
  nombre: string;

  @ApiPropertyOptional({ example: 'Incluir graficos y conclusiones' })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser texto' })
  @MaxLength(500, { message: 'La descripción puede tener hasta 500 caracteres' })
  descripcion?: string;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt({ message: 'Elige un ramo' })
  asignaturaId: number;

  @ApiPropertyOptional({ enum: EstadoTarea, example: EstadoTarea.PENDIENTE })
  @IsOptional()
  @IsEnum(EstadoTarea, { message: 'El estado debe ser PENDIENTE, EN_PROGRESO o COMPLETADA' })
  estado?: EstadoTarea;

  @ApiPropertyOptional({ enum: Prioridad, example: Prioridad.MEDIA })
  @IsOptional()
  @IsEnum(Prioridad, { message: 'La prioridad debe ser BAJA, MEDIA, ALTA o URGENTE' })
  prioridad?: Prioridad;

  @ApiPropertyOptional({ example: '2026-11-20', description: 'Fecha de entrega, null la quita' })
  @IsOptional()
  @Matches(FORMATO_FECHA, { message: 'La fecha debe tener formato AAAA-MM-DD' })
  @IsDateString({ strict: true }, { message: 'La fecha no es válida' })
  fecha?: string | null;

  @ApiPropertyOptional({ example: '23:59', description: 'Hora de entrega HH:mm, null la quita' })
  @IsOptional()
  @Matches(/^([01][0-9]|2[0-3]):[0-5][0-9]$/, { message: 'La hora debe tener formato HH:mm' })
  horaEntrega?: string | null;

  @ApiPropertyOptional({ example: 2, description: 'Evaluacion del mismo ramo que prepara esta tarea' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'La evaluación no es válida' })
  evaluacionId?: number | null;
}
