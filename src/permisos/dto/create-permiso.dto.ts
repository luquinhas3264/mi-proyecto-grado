import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePermisoDto {
  @ApiProperty({ required: true })
  @IsString()
  modulo: string;

  @ApiProperty({ required: true })
  @IsString()
  accion: string;
}
