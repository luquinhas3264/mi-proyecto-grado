import {
  Controller,
  Get,
  UseGuards,
  Req,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { PermisosGuard } from '../common/guards/permisos.guard';
import { Permiso } from '../common/decorators/permiso.decorator';
import { RequestWithUser } from '../auth/interfaces/request-with-user.interface';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { DashboardProyectosDto } from './dto/dashboard-proyectos.dto';
import { DashboardClientesDto } from './dto/dashboard-clientes.dto';
import { FiltrosProyectosDto, FiltrosClientesDto, FiltrosActividadesDto } from './dto/filtros-dashboard.dto';
import { ActividadRecenteDto } from './dto/actividades-recientes.dto';
import { Query, Param } from '@nestjs/common';
import { DetalleProyectoDto } from './dto/detalle-proyecto.dto';

@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard, PermisosGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}  
  
  @Get('proyectos')
  @Permiso('dashboard', 'ver')
  @ApiOperation({ summary: 'Obtener resumen de proyectos con filtros', description: 'Devuelve estadísticas globales y una lista de proyectos activos, con información de estado, progreso y cliente asociado. Permite filtrar por cliente, estado, atrasados y próximos a vencer.' })
  @ApiResponse({ status: 200, type: DashboardProyectosDto })
  @ApiQuery({ name: 'idCliente', required: false, description: 'Filtrar por cliente (UC2)' })
  @ApiQuery({ name: 'estado', required: false, description: 'Filtrar por estado (UC3)' })
  @ApiQuery({ name: 'soloAtrasados', required: false, type: Boolean, description: 'Solo proyectos atrasados' })
  @ApiQuery({ name: 'proximosAVencer', required: false, type: Boolean, description: 'Solo proyectos próximos a vencer (7 días)' })
  async obtenerResumenProyectos(
    @Query() filtros: FiltrosProyectosDto,
    @Req() req: RequestWithUser
  ): Promise<DashboardProyectosDto> {
    // UC1, UC2, UC3: Resumen general y filtrado de proyectos
    return this.dashboardService.obtenerResumenProyectos(filtros);
  }

  @Get('clientes')
  @Permiso('dashboard', 'ver')
  @ApiOperation({ summary: 'Obtener resumen de clientes con filtros', description: 'Devuelve estadísticas globales y una lista de clientes, con información de contacto, etiquetas, rubro y proyectos asociados. Permite filtrar por etiqueta, rubro, búsqueda y estado de proyectos.' })
  @ApiResponse({ status: 200, type: DashboardClientesDto })
  @ApiQuery({ name: 'idEtiqueta', required: false, description: 'Filtrar por etiqueta (UC6)' })
  @ApiQuery({ name: 'rubro', required: false, description: 'Filtrar por rubro (UC6)' })
  @ApiQuery({ name: 'busqueda', required: false, description: 'Buscar por razón social' })
  @ApiQuery({ name: 'conProyectosActivos', required: false, type: Boolean, description: 'Solo clientes con proyectos activos' })
  @ApiQuery({ name: 'sinProyectos', required: false, type: Boolean, description: 'Solo clientes sin proyectos' })
  async obtenerResumenClientes(
    @Query() filtros: FiltrosClientesDto,
    @Req() req: RequestWithUser
  ): Promise<DashboardClientesDto> {
    // UC5, UC6: Resumen general y filtrado de clientes
    return this.dashboardService.obtenerResumenClientes(filtros);
  }

  @Get('actividades')
  @Permiso('dashboard', 'ver')
  @ApiOperation({ summary: 'Obtener actividades recientes', description: 'Devuelve las actividades más recientes del sistema, con opción de filtrar por cliente, proyecto, usuario y fecha.' })
  @ApiResponse({ status: 200, type: [ActividadRecenteDto] })
  @ApiQuery({ name: 'limite', required: false, type: Number, description: 'Cantidad máxima de actividades a mostrar (default 20)' })
  @ApiQuery({ name: 'idCliente', required: false, description: 'Filtrar por cliente' })
  @ApiQuery({ name: 'idProyecto', required: false, description: 'Filtrar por proyecto' })
  @ApiQuery({ name: 'idUsuario', required: false, description: 'Filtrar por usuario' })
  @ApiQuery({ name: 'fechaDesde', required: false, description: 'Filtrar actividades desde esta fecha (YYYY-MM-DD)' })
  async obtenerActividadesRecientes(
    @Query() filtros: FiltrosActividadesDto,
    @Req() req: RequestWithUser
  ): Promise<ActividadRecenteDto[]> {
    // UC7: Actividades recientes globales y filtradas
    return this.dashboardService.obtenerActividadesRecientes(filtros);
  }

  @Get('proyecto/:id')
  @Permiso('dashboard', 'ver')
  @ApiOperation({ summary: 'Obtener detalle resumido de un proyecto', description: 'Devuelve información detallada de un proyecto, incluyendo cliente, estado, tareas críticas, actividades recientes y notas.' })
  @ApiResponse({ status: 200, type: DetalleProyectoDto })
  @ApiParam({ name: 'id', description: 'ID del proyecto' })
  async obtenerDetalleProyecto(
    @Param('id') id: string,
    @Req() req: RequestWithUser
  ): Promise<DetalleProyectoDto> {
    // UC4: Detalle resumido de un proyecto
    return this.dashboardService.obtenerDetalleProyecto(id);
  }
}