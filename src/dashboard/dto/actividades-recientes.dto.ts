import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TipoActividad } from '../../actividades/enums/tipo-actividad.enum';

export class ActividadRecenteDto {
  @ApiProperty()
  idActividad: string;

  @ApiProperty()
  fecha: Date;

  @ApiProperty({ enum: TipoActividad })
  tipo: TipoActividad;

  @ApiProperty()
  descripcion: string;

  @ApiProperty({ description: 'Usuario que realizó la actividad' })
  usuario: {
    idUsuario: string;
    nombre: string;
  };

  @ApiProperty({ description: 'Cliente relacionado con la actividad' })
  cliente: {
    idCliente: string;
    razonSocial: string;
  };

  @ApiPropertyOptional({ description: 'Proyecto relacionado (si aplica)' })
  proyecto?: {
    idProyecto: string;
    nombre: string;
  } | null;

  @ApiProperty({ description: 'Tiempo transcurrido desde la actividad (ej: "hace 2 horas")' })
  tiempoTranscurrido: string;
}

export class EstadisticasActividadesDto {
  @ApiProperty({ description: 'Total de actividades en el período' })
  total: number;

  @ApiProperty({ description: 'Actividades por tipo' })
  porTipo: Record<string, number>;

  @ApiProperty({ description: 'Actividades de hoy' })
  hoy: number;

  @ApiProperty({ description: 'Actividades esta semana' })
  estaSemana: number;

  @ApiProperty({ description: 'Usuario más activo' })
  usuarioMasActivo: {
    nombre: string;
    cantidad: number;
  } | null;
}

export class DashboardActividadesDto {
  @ApiProperty({ description: 'Estadísticas de actividades' })
  estadisticas: EstadisticasActividadesDto;

  @ApiProperty({ 
    type: [ActividadRecenteDto], 
    description: 'Lista de actividades recientes' 
  })
  actividades: ActividadRecenteDto[];
}