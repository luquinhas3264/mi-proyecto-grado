import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateEtiquetaDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nombre?: string;
}
