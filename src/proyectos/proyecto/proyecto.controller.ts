import {
  Body,
  Controller,
  Post,
  Patch,
  UseGuards,
  Req,
  Param,
  Delete,
  Get,
  Query,
} from '@nestjs/common';
import { ProyectoService } from './proyecto.service';
import { CreateProyectoDto } from './dto/create-proyecto.dto';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { PermisosGuard } from 'src/common/guards/permisos.guard';
import { Permiso } from 'src/common/decorators/permiso.decorator';
import { RequestWithUser } from 'src/auth/interfaces/request-with-user.interface';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { UpdateProyectoDto } from './dto/update-proyecto.dto';

@ApiTags('Proyectos')
@Controller('proyectos')
@UseGuards(JwtAuthGuard, PermisosGuard)
export class ProyectoController {
  constructor(private readonly proyectoService: ProyectoService) {}

  @Post()
  @Permiso('proyectos', 'crear')
  crearProyecto(@Body() dto: CreateProyectoDto, @Req() req: RequestWithUser) {
    return this.proyectoService.crearProyecto(dto, req.user.idUsuario);
  }

  @Get('estadisticas')
  @Permiso('proyectos', 'ver')
  @ApiQuery({
    name: 'clienteId',
    required: false,
    description: 'Filtrar estadísticas por cliente',
  })
  async obtenerEstadisticas(@Query('clienteId') clienteId?: string) {
    return this.proyectoService.obtenerEstadisticas(clienteId);
  }

  @Get()
  @Permiso('proyectos', 'ver')
  @ApiQuery({
    name: 'clienteId',
    required: false,
    description: 'Filtrar proyectos por cliente',
  })
  obtenerTodos(@Query('clienteId') clienteId?: string) {
    return this.proyectoService.obtenerTodos(clienteId);
  }

  @Get(':id')
  @Permiso('proyectos', 'ver')
  async obtenerDetalle(@Param('id') id: string) {
    return this.proyectoService.obtenerDetalleProyecto(id);
  }

  @Patch(':id')
  @Permiso('proyectos', 'editar')
  actualizar(
    @Param('id') id: string,
    @Body() dto: UpdateProyectoDto,
    @Req() req: RequestWithUser,
  ) {
    return this.proyectoService.actualizarProyecto(id, dto, req.user.idUsuario);
  }

  @Delete(':id')
  @Permiso('proyectos', 'eliminar')
  eliminar(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.proyectoService.eliminarProyecto(id, req.user.idUsuario);
  }
}
