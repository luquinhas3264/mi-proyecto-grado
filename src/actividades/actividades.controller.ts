import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { FilterActividadDto } from './dto/filter-actividad.dto';
import { format } from 'date-fns';
import { UpdateActividadDto } from './dto/update-actividad.dto';
import { ActividadesService } from './actividades.service';
import { Permiso } from '../common/decorators/permiso.decorator';
import { PermisosGuard } from '../common/guards/permisos.guard';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { ApiTags, ApiQuery } from '@nestjs/swagger';
import { TipoActividad } from './enums/tipo-actividad.enum';
import { RequestWithUser } from 'src/auth/interfaces/request-with-user.interface';

@ApiTags('Actividades')
@Controller('actividades')
@UseGuards(JwtAuthGuard, PermisosGuard)
export class ActividadesController {
  constructor(private readonly actividadesService: ActividadesService) {}

  @Get()
  @Permiso('historial_actividades', 'ver')
  @ApiQuery({
    name: 'idUsuario',
    required: false,
    type: String,
    description: 'UUID del usuario',
  })
  @ApiQuery({
    name: 'idCliente',
    required: false,
    type: String,
    description: 'UUID del cliente',
  })
  @ApiQuery({
    name: 'idProyecto',
    required: false,
    type: String,
    description: 'UUID del proyecto',
  })
  @ApiQuery({
    name: 'tipo',
    required: false,
    enum: Object.values(TipoActividad),
    description: 'Tipo de actividad',
  })
  @ApiQuery({
    name: 'fechaInicio',
    required: false,
    type: String,
    description: 'Fecha inicial (ISO)',
  })
  @ApiQuery({
    name: 'fechaFin',
    required: false,
    type: String,
    description: 'Fecha final (ISO)',
  })
  async consultarActividades(@Query() filter: FilterActividadDto) {
    const actividades = await this.actividadesService.findAll(filter);
    return actividades.map((a) => ({
      ...a,
      fecha: a.fecha
        ? format(new Date(a.fecha), 'yyyy-MM-dd HH:mm:ss')
        : a.fecha,
    }));
  }

  @Get('mias')
  @Permiso('historial_actividades', 'ver')
  async obtenerMisActividades(@Req() req: RequestWithUser) {
    const idUsuario = req.user?.idUsuario;
    if (!idUsuario) return [];
    return await this.actividadesService.findAll({ idUsuario });
  }

  @Patch(':id')
  @Permiso('historial_actividades', 'editar')
  async editarActividad(
    @Param('id') id: string,
    @Body() updateActividadDto: UpdateActividadDto,
  ) {
    return await this.actividadesService.editar(id, updateActividadDto);
  }

  @Delete(':id')
  @Permiso('historial_actividades', 'eliminar')
  async eliminarActividad(@Param('id') id: string) {
    return await this.actividadesService.eliminar(id);
  }

  @Post('eliminar-masivo')
  @Permiso('historial_actividades', 'eliminar')
  async eliminarActividadesMasivo(
    @Body() body: { ids?: string[]; filtro?: any },
  ) {
    // Puedes aceptar un array de IDs o un filtro (por fechas, usuario, etc.)
    return await this.actividadesService.eliminarMasivo(body.ids, body.filtro);
  }
}
