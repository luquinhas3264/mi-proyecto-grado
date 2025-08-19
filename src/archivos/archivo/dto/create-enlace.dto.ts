import { IsString, IsOptional, IsNotEmpty, IsUrl, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateEnlaceDto {
  @ApiProperty({
    description: 'Nombre descriptivo del enlace',
    example: 'Carpeta de Google Drive - Recursos del Proyecto',
    minLength: 3,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  @Transform(({ value }) => value?.trim())
  nombre: string;

  @ApiProperty({
    description: 'URL del enlace externo',
    example: 'https://drive.google.com/drive/folders/abc123xyz'
  })
  @IsUrl({
    protocols: ['http', 'https'],
    require_protocol: true,
  }, { message: 'Debe ser una URL válida con protocolo HTTP o HTTPS' })
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  url: string;

  @ApiPropertyOptional({
    description: 'Descripción del contenido del enlace',
    example: 'Carpeta compartida con todos los recursos gráficos del proyecto',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'La descripción no puede exceder 500 caracteres' })
  @Transform(({ value }) => value?.trim())
  descripcion?: string;
}