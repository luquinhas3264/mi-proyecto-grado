import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Patch,
  Delete,
  UseGuards,
  Req,    
} from '@nestjs/common';
import { ContactoClienteService } from './contacto-cliente.service';
import { CreateContactoDto } from './dto/create-contacto.dto';
import { UpdateContactoDto } from './dto/update-contacto.dto';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { PermisosGuard } from 'src/common/guards/permisos.guard';
import { Permiso } from 'src/common/decorators/permiso.decorator';
import { ApiTags } from '@nestjs/swagger';
import { RequestWithUser } from 'src/auth/interfaces/request-with-user.interface';

@ApiTags('Contactos')
@Controller('contactos')
@UseGuards(JwtAuthGuard, PermisosGuard)
export class ContactoClienteController {
  constructor(private readonly contactoService: ContactoClienteService) {}

  @Post()
  @Permiso('contactos', 'crear')
  crear(@Body() dto: CreateContactoDto, @Req() req: RequestWithUser) {
    return this.contactoService.crear(dto, req.user.idUsuario);
  }

  @Get('cliente/:idCliente')
  @Permiso('contactos', 'ver')
  obtenerPorCliente(@Param('idCliente') idCliente: string) {
    return this.contactoService.obtenerPorCliente(idCliente);
  }

  @Get(':idContacto')
  @Permiso('contactos', 'ver')
  obtenerPorId(@Param('idContacto') idContacto: string) {
    return this.contactoService.obtenerPorId(idContacto);
  }

  @Patch(':idContacto')
  @Permiso('contactos', 'editar')
  actualizar(@Param('idContacto') idContacto: string, @Body() dto: UpdateContactoDto, @Req() req: RequestWithUser) {
    return this.contactoService.actualizar(idContacto, dto, req.user.idUsuario);
  }

  @Delete(':idContacto')
  @Permiso('contactos', 'eliminar')
  eliminar(@Param('idContacto') idContacto: string, @Req() req: RequestWithUser) {
    const idUsuario = req.user.idUsuario;    
    return this.contactoService.eliminar(idContacto, idUsuario);
  }
}
