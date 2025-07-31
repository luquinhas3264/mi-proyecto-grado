import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { EtiquetaClienteService } from './etiqueta-cliente.service';
import { CreateEtiquetaDto } from './dto/create-etiqueta.dto';
import { UpdateEtiquetaDto } from './dto/update-etiqueta.dto';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { PermisosGuard } from 'src/common/guards/permisos.guard';
import { Permiso } from 'src/common/decorators/permiso.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Etiquetas')
@Controller('etiquetas')
@UseGuards(JwtAuthGuard, PermisosGuard)
export class EtiquetaClienteController {
  constructor(private readonly etiquetaService: EtiquetaClienteService) {}

  @Post()
  @Permiso('etiquetas', 'crear')
  crear(@Body() dto: CreateEtiquetaDto) {
    return this.etiquetaService.crear(dto);
  }

  @Get()
  @Permiso('etiquetas', 'ver')
  obtenerTodas() {
    return this.etiquetaService.obtenerTodas();
  }

  @Patch(':id')
  @Permiso('etiquetas', 'editar')
  actualizar(@Param('id') id: string, @Body() dto: UpdateEtiquetaDto) {
    return this.etiquetaService.actualizar(id, dto);
  }

  @Delete(':id')
  @Permiso('etiquetas', 'eliminar')
  eliminar(@Param('id') id: string) {
    return this.etiquetaService.eliminar(id);
  }

  @Post('asignar/:idCliente/:idEtiqueta')
  @Permiso('etiquetas', 'asignar')
  asignarEtiqueta(
    @Param('idCliente') idCliente: string,
    @Param('idEtiqueta') idEtiqueta: string,
  ) {
    return this.etiquetaService.asignarEtiqueta(idCliente, idEtiqueta);
  }

  @Delete('remover/:idCliente/:idEtiqueta')
  @Permiso('etiquetas', 'asignar')
  removerEtiqueta(
    @Param('idCliente') idCliente: string,
    @Param('idEtiqueta') idEtiqueta: string,
  ) {
    return this.etiquetaService.removerEtiqueta(idCliente, idEtiqueta);
  }
}
