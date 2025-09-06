import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID, IsDateString, IsEnum } from 'class-validator';
import { TipoActividad } from '../enums/tipo-actividad.enum';

export class FilterActividadDto {
  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  idUsuario?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  idCliente?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  idProyecto?: string;

  @ApiPropertyOptional({ enum: TipoActividad })
  @IsEnum(TipoActividad)
  @IsOptional()
  tipo?: TipoActividad;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  fechaInicio?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  fechaFin?: string;
}
