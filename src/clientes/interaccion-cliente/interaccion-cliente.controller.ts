import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { InteraccionClienteService } from './interaccion-cliente.service';
import { CreateInteraccionDto } from './dto/create-interaccion.dto';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { PermisosGuard } from 'src/common/guards/permisos.guard';
import { Permiso } from 'src/common/decorators/permiso.decorator';
import { ApiTags } from '@nestjs/swagger';
import { RequestWithUser } from 'src/auth/interfaces/request-with-user.interface';

@ApiTags('Interacciones')
@Controller('interacciones')
@UseGuards(JwtAuthGuard, PermisosGuard)
export class InteraccionClienteController {
  constructor(private readonly interaccionService: InteraccionClienteService) {}

  @Post()
  @Permiso('interacciones', 'crear')
  crear(@Body() dto: CreateInteraccionDto, @Req() req: RequestWithUser) {
    return this.interaccionService.crear(dto, req.user.idUsuario);
  }

  @Get('/contacto/:idContacto')
  @Permiso('interacciones', 'ver')
  obtenerPorContacto(@Param('idContacto') idContacto: string) {
    return this.interaccionService.obtenerPorContacto(idContacto);
  }

  @Get('/cliente/:idCliente')
  @Permiso('interacciones', 'ver')
  obtenerPorCliente(@Param('idCliente') idCliente: string) {
    return this.interaccionService.obtenerPorCliente(idCliente);
  }
}
