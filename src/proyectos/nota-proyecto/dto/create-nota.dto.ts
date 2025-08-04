import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNotaProyectoDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  contenido: string;
}
