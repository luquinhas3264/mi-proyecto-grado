import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UsuariosInternosService } from './usuarios-internos.service';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { PermisosGuard } from 'src/common/guards/permisos.guard';
import { Permiso } from 'src/common/decorators/permiso.decorator';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { UpdatePerfilDto } from './dto/update-perfil.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Usuarios Internos')
@UseGuards(JwtAuthGuard, PermisosGuard)
@Controller('usuarios-internos')
export class UsuariosInternosController {
  constructor(private readonly service: UsuariosInternosService) {}

  @Post()
  @Permiso('usuarios', 'crear')
  create(@Body() dto: CreateUsuarioDto) {
    return this.service.crear(dto);
  }

  @Get()
  @Permiso('usuarios', 'ver')
  findAll() {
    return this.service.findAll();
  }

  @UseGuards(JwtAuthGuard) // Solo autenticación, sin permisos
  @Get('/mi-perfil')
  getPerfil(@Request() req) {
    console.log('getPerfil - idUsuario recibido:', req.user.idUsuario);
    return this.service.findById(req.user.idUsuario);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/mi-perfil')
  updatePerfil(
    @Request() req,
    @Body() dto: UpdatePerfilDto,
  ) {
    return this.service.updatePerfil(req.user.idUsuario, dto);
  }

  @Get(':id')
  @Permiso('usuarios', 'ver')
  findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Patch(':id')
  @Permiso('usuarios', 'editar')
  update(@Param('id') id: string, @Body() dto: UpdateUsuarioDto) {
    return this.service.update(id, dto);
  }  
}
