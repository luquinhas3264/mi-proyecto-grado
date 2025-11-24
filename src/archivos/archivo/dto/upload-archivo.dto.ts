import { IsString, IsOptional, IsArray } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UploadArchivoDto {
  @ApiPropertyOptional({
    description: 'Descripción opcional del archivo a subir',
    example: 'Contrato firmado del cliente para el proyecto de branding'
  })
  @IsOptional()
  @IsString({ each: true })
  @IsArray()
  descripcion?: string[];
}