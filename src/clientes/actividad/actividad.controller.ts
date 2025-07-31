import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ActividadService } from './actividad.service';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { PermisosGuard } from 'src/common/guards/permisos.guard';
import { Permiso } from 'src/common/decorators/permiso.decorator';
import { ApiTags, ApiOkResponse } from '@nestjs/swagger';


@ApiTags('Actividades')
@Controller('actividades')
@UseGuards(JwtAuthGuard, PermisosGuard)
export class ActividadController {
  constructor(private readonly actividadService: ActividadService) {}

  @Get('cliente/:idCliente')
  @Permiso('actividades', 'ver')
  obtenerPorCliente(@Param('idCliente') idCliente: string) {
    return this.actividadService.obtenerPorCliente(idCliente);
  }
}
