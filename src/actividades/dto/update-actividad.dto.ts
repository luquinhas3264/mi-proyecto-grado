import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsDateString, IsUUID, IsEnum, IsString } from 'class-validator';
import { TipoActividad } from '../enums/tipo-actividad.enum';

export class UpdateActividadDto {
  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  fecha?: string;

  @ApiPropertyOptional({ enum: TipoActividad })
  @IsEnum(TipoActividad)
  @IsOptional()
  tipo?: TipoActividad;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  descripcion?: string;

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
}
