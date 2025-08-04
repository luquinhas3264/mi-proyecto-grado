import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Patch,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { NotaProyectoService } from './nota-proyecto.service';
import { CreateNotaProyectoDto } from './dto/create-nota.dto';
import { UpdateNotaProyectoDto } from './dto/update-nota.dto';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { PermisosGuard } from 'src/common/guards/permisos.guard';
import { Permiso } from 'src/common/decorators/permiso.decorator';
import { RequestWithUser } from 'src/auth/interfaces/request-with-user.interface';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Notas de Proyecto')
@Controller('notas-proyecto')
@UseGuards(JwtAuthGuard, PermisosGuard)
export class NotaProyectoController {
  constructor(private readonly notaService: NotaProyectoService) {}

  @Post('proyectos/:id/notas')
  @Permiso('notas-proyecto', 'crear')
  crear(
    @Param('id') idProyecto: string,
    @Body() dto: CreateNotaProyectoDto,
    @Req() req: RequestWithUser,
  ) {
    return this.notaService.crear(idProyecto, dto, req.user.idUsuario);
  }

  @Get('proyectos/:id/notas')
  @Permiso('notas-proyecto', 'ver')
  listar(@Param('id') idProyecto: string) {
    return this.notaService.listarPorProyecto(idProyecto);
  }

  @Patch('notas-proyecto/:id')
  @Permiso('notas-proyecto', 'editar')
  editar(@Param('id') idNota: string, @Body() dto: UpdateNotaProyectoDto) {
    return this.notaService.actualizar(idNota, dto);
  }

  @Delete('notas-proyecto/:id')
  @Permiso('notas-proyecto', 'eliminar')
  eliminar(@Param('id') idNota: string) {
    return this.notaService.eliminar(idNota);
  }
}
