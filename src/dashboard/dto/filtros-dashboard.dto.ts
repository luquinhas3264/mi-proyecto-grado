import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID, IsEnum, IsDateString, IsString, IsBoolean } from 'class-validator';
import { EstadoProyecto } from '../../proyectos/proyecto/enums/estado-proyecto.enum';
import { Transform } from 'class-transformer';

// Filtros para UC2 y UC3 - Proyectos
export class FiltrosProyectosDto {
  @ApiPropertyOptional({ description: 'Filtrar proyectos por cliente específico (UC2)' })
  @IsOptional()
  @IsUUID()
  idCliente?: string;

  @ApiPropertyOptional({ 
    enum: EstadoProyecto, 
    description: 'Filtrar proyectos por estado (UC3)' 
  })
  @IsOptional()
  @IsEnum(EstadoProyecto)
  estado?: EstadoProyecto;

  @ApiPropertyOptional({ description: 'Fecha de inicio del rango de filtrado' })
  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @ApiPropertyOptional({ description: 'Fecha de fin del rango de filtrado' })
  @IsOptional()
  @IsDateString()
  fechaFin?: string;

  @ApiPropertyOptional({ 
    description: 'Solo proyectos atrasados',
    type: Boolean
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  soloAtrasados?: boolean;

  @ApiPropertyOptional({ 
    description: 'Solo proyectos próximos a vencer (7 días)',
    type: Boolean
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  proximosAVencer?: boolean;
}

// Filtros para UC6 - Clientes
export class FiltrosClientesDto {
  @ApiPropertyOptional({ description: 'Filtrar clientes por etiqueta específica' })
  @IsOptional()
  @IsUUID()
  idEtiqueta?: string;

  @ApiPropertyOptional({ description: 'Filtrar clientes por rubro' })
  @IsOptional()
  @IsString()
  rubro?: string;

  @ApiPropertyOptional({ description: 'Búsqueda por razón social' })
  @IsOptional()
  @IsString()
  busqueda?: string;

  @ApiPropertyOptional({ 
    description: 'Solo clientes con proyectos activos',
    type: Boolean
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  conProyectosActivos?: boolean;

  @ApiPropertyOptional({ 
    description: 'Solo clientes sin proyectos',
    type: Boolean
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  sinProyectos?: boolean;
}

// Filtros para UC7 - Actividades Recientes
export class FiltrosActividadesDto {
  @ApiPropertyOptional({ 
    description: 'Límite de actividades a mostrar',
    default: 20,
    minimum: 1,
    maximum: 100
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  limite?: number = 20;

  @ApiPropertyOptional({ description: 'Filtrar actividades por cliente específico' })
  @IsOptional()
  @IsUUID()
  idCliente?: string;

  @ApiPropertyOptional({ description: 'Filtrar actividades por proyecto específico' })
  @IsOptional()
  @IsUUID()
  idProyecto?: string;

  @ApiPropertyOptional({ description: 'Filtrar actividades por usuario específico' })
  @IsOptional()
  @IsUUID()
  idUsuario?: string;

  @ApiPropertyOptional({ description: 'Fecha desde la cual obtener actividades' })
  @IsOptional()
  @IsDateString()
  fechaDesde?: string;
}