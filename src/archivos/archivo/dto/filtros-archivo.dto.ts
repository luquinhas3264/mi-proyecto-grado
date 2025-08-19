import { IsOptional, IsEnum, IsString, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TipoArchivo } from '../enums/tipo-archivo.enum';

export class FiltrosArchivoDto {
  @ApiPropertyOptional({
    description: 'Filtrar por tipo de archivo',
    enum: TipoArchivo
  })
  @IsOptional()
  @IsEnum(TipoArchivo)
  tipo?: TipoArchivo;

  @ApiPropertyOptional({
    description: 'Búsqueda por nombre del archivo',
    example: 'contrato'
  })
  @IsOptional()
  @IsString()
  busqueda?: string;

  @ApiPropertyOptional({
    description: 'Filtrar archivos creados desde esta fecha',
    example: '2024-01-01'
  })
  @IsOptional()
  @IsDateString()
  fechaDesde?: string;

  @ApiPropertyOptional({
    description: 'Filtrar archivos creados hasta esta fecha',
    example: '2024-12-31'
  })
  @IsOptional()
  @IsDateString()
  fechaHasta?: string;

  @ApiPropertyOptional({
    description: 'Campo por el cual ordenar',
    enum: ['nombre', 'tipo', 'creadoEn', 'tamaño'],
    example: 'creadoEn'
  })
  @IsOptional()
  @IsString()
  orderBy?: 'nombre' | 'tipo' | 'creadoEn' | 'tamaño';

  @ApiPropertyOptional({
    description: 'Dirección del ordenamiento',
    enum: ['asc', 'desc'],
    example: 'desc'
  })
  @IsOptional()
  @IsString()
  orderDirection?: 'asc' | 'desc';
}