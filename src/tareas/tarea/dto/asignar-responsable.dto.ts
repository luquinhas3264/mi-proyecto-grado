import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class AsignarResponsableDto {
  @ApiProperty()
  @IsUUID()
  idUsuarioResponsable: string;
}