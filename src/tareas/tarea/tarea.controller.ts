import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { TareaService } from './tarea.service';
import { CreateTareaDto } from './dto/create-tarea.dto';
import { UpdateTareaDto } from './dto/update-tarea.dto';
import { FiltrosTareaDto } from './dto/filtros-tarea.dto';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { PermisosGuard } from 'src/common/guards/permisos.guard';
import { Permiso } from 'src/common/decorators/permiso.decorator';
import { RequestWithUser } from 'src/auth/interfaces/request-with-user.interface';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { CambiarEstadoDto } from './dto/cambiar-estado.dto';
import { AsignarResponsableDto } from './dto/asignar-responsable.dto';

@ApiTags('Tareas')
@Controller('tareas')
@UseGuards(JwtAuthGuard, PermisosGuard)
export class TareaController {
  constructor(private readonly tareaService: TareaService) {}

  @Post()
  @Permiso('tareas', 'crear')
  @ApiOperation({ summary: 'Crear una nueva tarea' })  
  crear(@Body() dto: CreateTareaDto, @Req() req: RequestWithUser) {
    return this.tareaService.crear(dto, req.user.idUsuario);
  }

  @Get('proyecto/:idProyecto')
  @Permiso('tareas', 'ver')
  @ApiOperation({ summary: 'Obtener todas las tareas de un proyecto' })  
  obtenerPorProyecto(
    @Param('idProyecto') idProyecto: string,
    @Query() filtros: FiltrosTareaDto,
  ) {
    return this.tareaService.obtenerPorProyecto(idProyecto, filtros);
  }

  @Get('mis-tareas')
  @Permiso('tareas', 'ver')
  @ApiOperation({ summary: 'Obtener tareas asignadas al usuario actual' })  
  obtenerMisTareas(@Req() req: RequestWithUser, @Query() filtros: FiltrosTareaDto) {
    return this.tareaService.obtenerPorResponsable(req.user.idUsuario, filtros);
  }

  @Get('estadisticas/proyecto/:idProyecto')
  @Permiso('tareas', 'ver')
  @ApiOperation({ summary: 'Obtener estadísticas de tareas de un proyecto' })  
  obtenerEstadisticas(@Param('idProyecto') idProyecto: string) {
    return this.tareaService.obtenerEstadisticasProyecto(idProyecto);
  }

  @Get(':id')
  @Permiso('tareas', 'ver')
  @ApiOperation({ summary: 'Obtener una tarea específica' })  
  obtenerPorId(@Param('id') id: string) {
    return this.tareaService.obtenerPorId(id);
  }

  @Patch(':id')
  @Permiso('tareas', 'editar')
  @ApiOperation({ summary: 'Actualizar una tarea' })  
  actualizar(
    @Param('id') id: string,
    @Body() dto: UpdateTareaDto,
    @Req() req: RequestWithUser,
  ) {
    return this.tareaService.actualizar(id, dto, req.user.idUsuario);
  }

  @Patch(':id/estado')
  @Permiso('tareas', 'editar')
  @ApiOperation({ summary: 'Cambiar el estado de una tarea' })  
  cambiarEstado(
    @Param('id') id: string,
    @Body() dto: CambiarEstadoDto,
    @Req() req: RequestWithUser,
  ) {
    return this.tareaService.cambiarEstado(id, dto.estado, req.user.idUsuario);
  }

  @Patch(':id/responsable')
  @Permiso('tareas', 'asignar')
  @ApiOperation({ summary: 'Asignar responsable a una tarea' })  
  asignarResponsable(
    @Param('id') id: string,
    @Body() dto: AsignarResponsableDto,
    @Req() req: RequestWithUser,
  ) {
    return this.tareaService.asignarResponsable(id, dto.idUsuarioResponsable, req.user.idUsuario);
  }

  @Delete(':id')
  @Permiso('tareas', 'eliminar')
  @ApiOperation({ summary: 'Eliminar una tarea' })  
  eliminar(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.tareaService.eliminar(id, req.user.idUsuario);
  }
}