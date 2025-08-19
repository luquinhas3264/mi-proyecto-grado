import { IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateArchivoDto {
  @ApiPropertyOptional({
    description: 'Nuevo nombre del archivo',
    example: 'Contrato_Cliente_XYZ_v2.pdf'
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  nombre?: string;

  @ApiPropertyOptional({
    description: 'Nueva descripción del archivo',
    example: 'Contrato actualizado con las modificaciones solicitadas'
  })
  @IsOptional()
  @IsString()
  descripcion?: string;
}