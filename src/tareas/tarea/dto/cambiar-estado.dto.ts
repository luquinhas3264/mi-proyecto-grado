import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { EstadoTarea } from '../enums/estado-tarea.enum';

export class CambiarEstadoDto {
  @ApiProperty({ enum: EstadoTarea })
  @IsEnum(EstadoTarea)
  estado: EstadoTarea;
}