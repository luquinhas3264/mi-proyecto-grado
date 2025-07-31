import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEtiquetaDto {
  @ApiProperty({ required: true })
  @IsString()
  nombre: string;
}