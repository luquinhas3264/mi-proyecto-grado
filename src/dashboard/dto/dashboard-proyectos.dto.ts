import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EstadoProyecto } from '../../proyectos/proyecto/enums/estado-proyecto.enum';

export class EstadisticasProyectosDto {
  @ApiProperty({ description: 'Total de proyectos activos' })
  total: number;

  @ApiProperty({ description: 'Proyectos por estado' })
  porEstado: {
    [EstadoProyecto.PLANEADO]: number;
    [EstadoProyecto.EN_PROGRESO]: number;
    [EstadoProyecto.FINALIZADO]: number;
  };

  @ApiProperty({ description: 'Proyectos próximos a vencer (7 días)' })
  proximosAVencer: number;

  @ApiProperty({ description: 'Proyectos atrasados' })
  atrasados: number;

  @ApiProperty({ description: 'Porcentaje de progreso promedio' })
  progresoPromedio: number;
}

export class ProyectoResumenDto {
  @ApiProperty()
  idProyecto: string;

  @ApiProperty()
  nombre: string;

  @ApiPropertyOptional()
  descripcion?: string;

  @ApiProperty({ enum: EstadoProyecto })
  estado: EstadoProyecto;

  @ApiProperty()
  fechaInicio: Date;

  @ApiPropertyOptional()
  fechaFin?: Date;

  @ApiProperty({ description: 'Días restantes hasta fecha fin' })
  diasRestantes: number | null;

  @ApiProperty({ description: 'Indica si el proyecto está atrasado' })
  estaAtrasado: boolean;

  @ApiProperty({ description: 'Porcentaje de progreso basado en tareas' })
  porcentajeProgreso: number;

  @ApiProperty({ description: 'Cliente asociado al proyecto' })
  cliente: {
    idCliente: string;
    razonSocial: string;
    rubro: string;
  };

  @ApiProperty({ description: 'Estadísticas de tareas' })
  tareas: {
    total: number;
    completadas: number;
    pendientes: number;
    enProgreso: number;
  };
}

export class DashboardProyectosDto {
  @ApiProperty({ description: 'Estadísticas generales' })
  estadisticas: EstadisticasProyectosDto;

  @ApiProperty({ 
    type: [ProyectoResumenDto], 
    description: 'Lista de proyectos con información resumida' 
  })
  proyectos: ProyectoResumenDto[];
}