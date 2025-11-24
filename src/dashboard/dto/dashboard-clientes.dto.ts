import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EstadisticasClientesDto {
  @ApiProperty({ description: 'Total de clientes activos' })
  total: number;

  @ApiProperty({ description: 'Clientes por rubro' })
  porRubro: Record<string, number>;

  @ApiProperty({ description: 'Clientes con proyectos activos' })
  conProyectosActivos: number;

  @ApiProperty({ description: 'Clientes sin proyectos' })
  sinProyectos: number;

  @ApiProperty({ description: 'Nuevos clientes este mes' })
  nuevosEsteMes: number;
}

export class ClienteResumenDto {
  @ApiProperty()
  idCliente: string;

  @ApiProperty()
  razonSocial: string;

  @ApiProperty()
  rubro: string;

  @ApiProperty()
  correo: string;

  @ApiProperty()
  telefono: string;

  @ApiProperty({ description: 'Etiquetas asignadas al cliente' })
  etiquetas: Array<{
    idEtiqueta: string;
    nombre: string;
  }>;

  @ApiProperty({ description: 'Número de contactos asociados' })
  totalContactos: number;

  @ApiProperty({ description: 'Estadísticas de proyectos del cliente' })
  proyectos: {
    total: number;
    activos: number;
    finalizados: number;
  };

  @ApiProperty({ description: 'Última interacción registrada' })
  ultimaInteraccion: {
    fecha: Date;
    tipo: string;
    descripcion: string;
  } | null;

  @ApiProperty({ description: 'Última actividad registrada' })
  ultimaActividad: {
    fecha: Date;
    tipo: string;
    descripcion: string;
  } | null;
}

export class DashboardClientesDto {
  @ApiProperty({ description: 'Estadísticas generales de clientes' })
  estadisticas: EstadisticasClientesDto;

  @ApiProperty({ 
    type: [ClienteResumenDto], 
    description: 'Lista de clientes con información resumida' 
  })
  clientes: ClienteResumenDto[];
}