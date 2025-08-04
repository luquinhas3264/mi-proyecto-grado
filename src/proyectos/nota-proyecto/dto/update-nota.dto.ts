import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateNotaProyectoDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contenido?: string;
}
