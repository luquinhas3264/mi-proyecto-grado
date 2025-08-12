import { IsOptional, IsString, IsDateString, IsUUID, IsEnum, IsNotEmpty } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { EstadoTarea } from '../enums/estado-tarea.enum';

export class UpdateTareaDto {
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
  @IsEnum(EstadoTarea)
  estado?: EstadoTarea;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  fechaLimite?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  idUsuarioResponsable?: string;
}