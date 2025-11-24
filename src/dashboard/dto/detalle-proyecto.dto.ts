import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EstadoProyecto } from '../../proyectos/proyecto/enums/estado-proyecto.enum';
import { EstadoTarea } from '../../tareas/tarea/enums/estado-tarea.enum';
import { ActividadRecenteDto } from './actividades-recientes.dto';

export class EstadisticasTareasProyectoDto {
  @ApiProperty({ description: 'Total de tareas en el proyecto' })
  total: number;

  @ApiProperty({ description: 'Tareas por estado' })
  porEstado: {
    [EstadoTarea.PENDIENTE]: number;
    [EstadoTarea.EN_PROGRESO]: number;
    [EstadoTarea.COMPLETADA]: number;
  };

  @ApiProperty({ description: 'Tareas vencidas' })
  vencidas: number;

  @ApiProperty({ description: 'Tareas próximas a vencer (3 días)' })
  proximasAVencer: number;

  @ApiProperty({ description: 'Porcentaje de progreso basado en tareas' })
  porcentajeProgreso: number;
}

export class TareaResumenDto {
  @ApiProperty()
  idTarea: string;

  @ApiProperty()
  nombre: string;

  @ApiProperty({ enum: EstadoTarea })
  estado: EstadoTarea;

  @ApiPropertyOptional()
  fechaLimite?: Date;

  @ApiPropertyOptional({ description: 'Usuario responsable de la tarea' })
  usuarioResponsable?: {
    idUsuario: string;
    nombre: string;
  } | null;

  @ApiProperty({ description: 'Indica si la tarea está vencida' })
  estaVencida: boolean;

  @ApiProperty({ description: 'Días restantes hasta vencimiento' })
  diasRestantes: number | null;
}

export class NotaProyectoDto {
  @ApiProperty()
  idNota: string;

  @ApiProperty()
  contenido: string;

  @ApiProperty()
  fecha: Date;
}

export class DetalleProyectoDto {
  @ApiProperty({ description: 'Información básica del proyecto' })
  proyecto: {
    idProyecto: string;
    nombre: string;
    descripcion?: string;
    estado: EstadoProyecto;
    fechaInicio: Date;
    fechaFin?: Date;
    creadoEn: Date;
    actualizadoEn: Date;
  };

  @ApiProperty({ description: 'Información del cliente' })
  cliente: {
    idCliente: string;
    razonSocial: string;
    rubro: string;
    correo: string;
    telefono: string;
  };

  @ApiProperty({ description: 'Estado temporal del proyecto' })
  estado: {
    diasRestantes: number | null;
    estaAtrasado: boolean;
    porcentajeProgreso: number;
    faseActual: string; // Basado en el estado y progreso
  };

  @ApiProperty({ description: 'Estadísticas detalladas de tareas' })
  tareas: EstadisticasTareasProyectoDto;

  @ApiProperty({ 
    type: [TareaResumenDto], 
    description: 'Tareas críticas (vencidas o próximas a vencer)' 
  })
  tareasCriticas: TareaResumenDto[];

  @ApiProperty({ 
    type: [ActividadRecenteDto], 
    description: 'Actividades recientes del proyecto (UC7 incluido)' 
  })
  actividadesRecientes: ActividadRecenteDto[];

  @ApiProperty({ 
    type: [NotaProyectoDto], 
    description: 'Últimas notas del proyecto' 
  })
  notasRecientes: NotaProyectoDto[];
}