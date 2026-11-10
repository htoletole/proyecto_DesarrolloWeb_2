import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Matches } from 'class-validator';
import { FORMATO_FECHA } from '../../comun/fechas';

// filtros opcionales que llegan por la URL (?asignaturaId=1&desde=2026-11-01)
export class FiltroEvaluacionesDto {
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
}
