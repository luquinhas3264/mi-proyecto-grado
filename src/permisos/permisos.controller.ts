import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { PermisosService } from './permisos.service';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { PermisosGuard } from 'src/common/guards/permisos.guard';
import { Permiso } from 'src/common/decorators/permiso.decorator';
import { CreatePermisoDto } from './dto/create-permiso.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Permisos')
@UseGuards(JwtAuthGuard, PermisosGuard)
@Controller('permisos')
export class PermisosController {
  constructor(private readonly permisosService: PermisosService) {}

  @Get()
  @Permiso('permisos', 'ver')
  listar() {
    return this.permisosService.listar();
  }

  @Post()
  @Permiso('permisos', 'crear')
  crear(@Body() dto: CreatePermisoDto) {
    return this.permisosService.crear(dto);
  }
}
