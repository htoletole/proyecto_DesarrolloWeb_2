import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';
import { FORMATO_FECHA } from '../../comun/fechas';

export class CrearPeriodoDto {
  @ApiProperty({ example: '2026-2' })
  @IsString({ message: 'El nombre debe ser texto' })
  @IsNotEmpty({ message: 'Ingresa el nombre del período' })
  @MaxLength(20, { message: 'El nombre puede tener hasta 20 caracteres' })
  nombre: string;

  @ApiProperty({ example: '2026-08-01' })
  @Matches(FORMATO_FECHA, { message: 'La fecha de inicio debe tener formato AAAA-MM-DD' })
  @IsDateString({ strict: true }, { message: 'La fecha de inicio no es válida' })
  fechaInicio: string;

  @ApiProperty({ example: '2026-12-31' })
  @Matches(FORMATO_FECHA, { message: 'La fecha de término debe tener formato AAAA-MM-DD' })
  @IsDateString({ strict: true }, { message: 'La fecha de término no es válida' })
  fechaFin: string;
}
