import { IsEnum, IsString, IsUUID, IsOptional } from 'class-validator';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';

export enum TipoActividad {
  CREACION = 'creacion',
  EDICION = 'edicion',
  INTERACCION = 'interaccion',
  COMENTARIO = 'comentario',
}

export class CreateActividadDto {
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
