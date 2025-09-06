import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  Query,
  Req,
} from '@nestjs/common';
import { ClienteEmpresaService } from './cliente-empresa.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { PermisosGuard } from 'src/common/guards/permisos.guard';
import { Permiso } from 'src/common/decorators/permiso.decorator';
import { RequestWithUser } from 'src/auth/interfaces/request-with-user.interface';
import { ApiTags, ApiQuery } from '@nestjs/swagger';

@ApiTags('Clientes')
@Controller('clientes')
@UseGuards(JwtAuthGuard, PermisosGuard)
export class ClienteEmpresaController {
  constructor(private readonly clienteService: ClienteEmpresaService) {}

  @Post()
  @Permiso('clientes', 'crear')
  crear(@Body() dto: CreateClienteDto, @Req() req: RequestWithUser) {
    const idUsuario = req.user.idUsuario;
    return this.clienteService.crear(dto, idUsuario);
  }

  @Get()
  @Permiso('clientes', 'ver')
  @ApiQuery({
    name: 'etiquetaId',
    required: false,
    description: 'Filtrar por id de etiqueta',
  })
  obtenerTodos(@Query('etiquetaId') etiquetaId?: string) {
    return this.clienteService.obtenerTodos(etiquetaId);
  }

  @Get(':id')
  @Permiso('clientes', 'ver')
  obtenerPorId(@Param('id') id: string) {
    return this.clienteService.obtenerPorId(id);
  }

  @Patch(':id')
  @Permiso('clientes', 'editar')
  actualizar(@Param('id') id: string, @Body() dto: UpdateClienteDto, @Req() req: RequestWithUser) {    
    return this.clienteService.actualizar(id, dto, req.user.idUsuario);
  }

  @Delete(':id')
  @Permiso('clientes', 'eliminar')
  eliminar(@Param('id') id: string, @Req() req: RequestWithUser) {
    const idUsuario = req.user.idUsuario;
    return this.clienteService.eliminar(id, idUsuario);
  }
}
