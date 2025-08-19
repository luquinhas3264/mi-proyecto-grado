import { IsString, IsOptional, IsEnum, IsNotEmpty, IsUrl, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TipoArchivo } from '../enums/tipo-archivo.enum';

export class CreateArchivoDto {
  @ApiProperty({
    description: 'Nombre del archivo',
    example: 'Contrato_Cliente_XYZ.pdf'
  })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({
    description: 'Tipo de archivo',
    enum: TipoArchivo,
    example: TipoArchivo.PDF
  })
  @IsEnum(TipoArchivo)
  tipo: TipoArchivo;

  @ApiPropertyOptional({
    description: 'Tamaño del archivo en bytes (null para enlaces)',
    example: 1024000
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  tamaño?: number;

  @ApiProperty({
    description: 'URL del archivo (ruta local o enlace externo)',
    example: '/uploads/proyectos/abc-123/documento.pdf'
  })
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiPropertyOptional({
    description: 'Descripción opcional del archivo',
    example: 'Contrato firmado con el cliente para el proyecto de branding'
  })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiProperty({
    description: 'ID del proyecto al que pertenece el archivo',
    example: 'abc-123-def-456'
  })
  @IsString()
  @IsNotEmpty()
  idProyecto: string;
}