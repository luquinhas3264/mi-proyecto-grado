import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsDateString, IsUUID, IsEnum, IsString } from 'class-validator';
import { TipoActividad } from '../enums/tipo-actividad.enum';

export class CreateActividadDto {
  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  fecha?: string;
  
  @ApiProperty({ enum: TipoActividad })
  @IsEnum(TipoActividad)
  tipo: TipoActividad;

  @ApiProperty()
  @IsString()
  descripcion: string;

  @ApiProperty()
  @IsUUID()
  idUsuario: string;

  @ApiProperty()
  @IsUUID()
  idCliente: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  idProyecto?: string;
}
