import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';
import { AsignarPermisosDto } from './dto/asignar-permisos.dto';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { PermisosGuard } from 'src/common/guards/permisos.guard';
import { Permiso } from 'src/common/decorators/permiso.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Roles')
@UseGuards(JwtAuthGuard, PermisosGuard)
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @Permiso('roles', 'crear')
  crear(@Body() dto: CreateRolDto) {
    return this.rolesService.crear(dto);
  }

  @Get()
  @Permiso('roles', 'ver')
  listar() {
    return this.rolesService.listar();
  }

  @Get(':idRol')
  @Permiso('roles', 'ver')
  obtener(@Param('idRol') idRol: string) {
    return this.rolesService.obtener(idRol);
  }

  @Patch(':idRol')
  @Permiso('roles', 'editar')
  actualizar(@Param('idRol') idRol: string, @Body() dto: UpdateRolDto) {
    return this.rolesService.actualizar(idRol, dto);
  }

  @Delete(':idRol')
  @Permiso('roles', 'eliminar')
  eliminar(@Param('idRol') idRol: string) {
    return this.rolesService.eliminar(idRol);
  }

  @Post(':idRol/permisos')
  @Permiso('roles', 'editar-permisos')
  asignarPermisos(
    @Param('idRol') idRol: string,
    @Body() dto: AsignarPermisosDto,
  ) {
    return this.rolesService.asignarPermisos(idRol, dto.permisosIds);
  }
}
