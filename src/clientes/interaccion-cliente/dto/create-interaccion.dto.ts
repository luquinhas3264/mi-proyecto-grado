import { IsDateString, IsEnum, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum TipoInteraccion {
  LLAMADA = 'llamada',
  CORREO = 'correo',
  REUNION = 'reunion',
  OTRO = 'otro',
}

export class CreateInteraccionDto {
  @ApiProperty({ required: true })
  @IsEnum(TipoInteraccion)
  tipo: TipoInteraccion;

  @ApiProperty({ required: true })
  @IsString()
  descripcion: string;

  @ApiProperty({ required: true })
  @IsDateString()
  fecha: string;

  @ApiProperty()
  @IsUUID()
  idContacto: string;
}
