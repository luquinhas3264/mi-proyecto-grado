import {
  IsOptional,
  IsString,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsUUID,
} from 'class-validator';
import { EstadoProyecto } from '../enums/estado-proyecto.enum';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProyectoDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  nombre?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(EstadoProyecto)
  estado?: EstadoProyecto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  fechaFin?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  idCliente?: string;
}
