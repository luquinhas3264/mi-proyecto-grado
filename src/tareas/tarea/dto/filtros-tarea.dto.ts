import { IsOptional, IsEnum, IsUUID, IsString, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { EstadoTarea } from '../enums/estado-tarea.enum';

export class FiltrosTareaDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(EstadoTarea)
  estado?: EstadoTarea;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  idUsuarioResponsable?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  busqueda?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  fechaLimiteDesde?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  fechaLimiteHasta?: string;

  @ApiPropertyOptional()
  @IsOptional()
  vencidas?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  orderBy?: 'nombre' | 'fechaLimite' | 'estado' | 'creadoEn';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  orderDirection?: 'asc' | 'desc';
}