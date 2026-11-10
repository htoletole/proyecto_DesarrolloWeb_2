import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Matches } from 'class-validator';
import { FORMATO_FECHA } from '../../comun/fechas';
import { EstadoTarea, Prioridad } from '../../generated/prisma/client';

// filtros opcionales que llegan por la URL (?estado=PENDIENTE&q=informe)
export class FiltroTareasDto {
  @ApiPropertyOptional({ enum: EstadoTarea })
  @IsOptional()
  @IsEnum(EstadoTarea, { message: 'El estado no es válido' })
  estado?: EstadoTarea;

  @ApiPropertyOptional({ enum: Prioridad })
  @IsOptional()
  @IsEnum(Prioridad, { message: 'La prioridad no es válida' })
  prioridad?: Prioridad;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'asignaturaId debe ser un número' })
  asignaturaId?: number;

  @ApiPropertyOptional({ example: '2026-11-01' })
  @IsOptional()
  @Matches(FORMATO_FECHA, { message: 'desde debe tener formato AAAA-MM-DD' })
  desde?: string;

  @ApiPropertyOptional({ example: '2026-11-30' })
  @IsOptional()
  @Matches(FORMATO_FECHA, { message: 'hasta debe tener formato AAAA-MM-DD' })
  hasta?: string;

  @ApiPropertyOptional({ example: 'informe', description: 'Busca en el nombre de la tarea' })
  @IsOptional()
  @IsString()
  q?: string;
}
