import {
  Controller,
  Post,
  Get,
  Delete,
  Patch,
  Param,
  Body,
  UploadedFile,
  UseInterceptors,
  Query,
  Res,
  HttpStatus,
  ParseUUIDPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiConsumes,
} from '@nestjs/swagger';
import { ArchivoService } from './archivo.service';
import {
  CreateArchivoDto,
  CreateEnlaceDto,
  UpdateArchivoDto,
  FiltrosArchivoDto,
  PreviewUrlDto,
  UploadArchivoDto,
} from './dto';
import { ArchivoValidationInterceptor } from './interceptors/archivo.interceptors';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  multerConfigSingle,
  obtenerTipoDesdemime,
} from './config/multer.config';
import { Response } from 'express';
import * as path from 'path';
import { TipoArchivo } from './enums/tipo-archivo.enum';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { PermisosGuard } from 'src/common/guards/permisos.guard';
import { Permiso } from 'src/common/decorators/permiso.decorator';
import { RequestWithUser } from 'src/auth/interfaces/request-with-user.interface';

@ApiTags('Archivos')
@Controller('archivos')
@UseGuards(JwtAuthGuard, PermisosGuard)
export class ArchivoController {
  constructor(private readonly archivoService: ArchivoService) {}

  @Post('subir/:idProyecto')
  @Permiso('archivos', 'subir')
  @ApiOperation({ summary: 'Subir archivo físico a un proyecto' })
  @ApiParam({
    name: 'idProyecto',
    type: 'string',
    description: 'ID del proyecto',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Archivo a subir',
        },
        descripcion: {
          type: 'string',
          description: 'Descripción opcional del archivo',
        },
      },
      required: ['file'],
    },
  })
  @UseInterceptors(
    FileInterceptor('file', multerConfigSingle),
    ArchivoValidationInterceptor,
  )
  async subirArchivo(
    @Param('idProyecto', ParseUUIDPipe) idProyecto: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadArchivoDto,
    @Req() req: RequestWithUser,
  ) {
    const archivoDto: CreateArchivoDto = {
      nombre: file.originalname,
      tipo: obtenerTipoDesdemime(file.mimetype) as TipoArchivo,
      tamaño: file.size,
      url: file.path.replace(process.cwd(), ''),
      descripcion: dto.descripcion,
      idProyecto,
    };
    const idUsuario = req.user.idUsuario;
    return this.archivoService.subirArchivo(archivoDto, idUsuario);
  }

  @Post('enlace/:idProyecto')
  @Permiso('archivos', 'subir')
  @ApiOperation({ summary: 'Agregar enlace externo a un proyecto' })
  @ApiParam({
    name: 'idProyecto',
    type: 'string',
    description: 'ID del proyecto',
  })
  @ApiBody({ type: CreateEnlaceDto })
  async crearEnlaceExterno(
    @Param('idProyecto', ParseUUIDPipe) idProyecto: string,
    @Body() dto: CreateEnlaceDto,
    @Req() req: RequestWithUser,
  ) {
    const idUsuario = req.user.idUsuario;
    return this.archivoService.crearEnlaceExterno(dto, idProyecto, idUsuario);
  }

  @Get('proyecto/:idProyecto')
  @Permiso('archivos', 'ver')
  @ApiOperation({ summary: 'Listar archivos y enlaces de un proyecto' })
  @ApiParam({
    name: 'idProyecto',
    type: 'string',
    description: 'ID del proyecto',
  })
  @ApiQuery({ name: 'tipo', required: false })
  @ApiQuery({ name: 'busqueda', required: false })
  @ApiQuery({ name: 'fechaDesde', required: false })
  @ApiQuery({ name: 'fechaHasta', required: false })
  @ApiQuery({ name: 'orderBy', required: false })
  @ApiQuery({ name: 'orderDirection', required: false })
  async obtenerArchivosPorProyecto(
    @Param('idProyecto', ParseUUIDPipe) idProyecto: string,
    @Query() filtros: FiltrosArchivoDto,
  ) {
    return this.archivoService.obtenerArchivosPorProyecto(idProyecto, filtros);
  }

  @Get(':id/descargar')
  @Permiso('archivos', 'descargar')
  @ApiOperation({ summary: 'Descargar archivo físico por ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID del archivo' })
  async descargarArchivo(
    @Param('id', ParseUUIDPipe) idArchivo: string,
    @Res() res: Response,
  ) {
    const archivo = await this.archivoService.obtenerArchivoPorId(idArchivo);
    if (archivo.tipo === 'url') {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ mensaje: 'No se puede descargar un enlace externo' });
    }
    const ruta = path.join(process.cwd(), archivo.url);
    return res.download(ruta, archivo.nombre);
  }

  @Delete(':id')
  @Permiso('archivos', 'eliminar_propios') // Puedes agregar lógica para admins con 'eliminar_todos'
  @ApiOperation({ summary: 'Eliminar archivo o enlace por ID' })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'ID del archivo/enlace',
  })
  async eliminarArchivo(
    @Param('id', ParseUUIDPipe) idArchivo: string,
    @Req() req: RequestWithUser,
  ) {
    const idUsuario = req.user.idUsuario;
    return this.archivoService.eliminarArchivo(idArchivo, idUsuario);
  }

  @Patch(':id')
  @Permiso('archivos', 'subir') // O 'editar' si tienes ese permiso
  @ApiOperation({ summary: 'Actualizar metadatos de archivo/enlace' })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'ID del archivo/enlace',
  })
  @ApiBody({ type: UpdateArchivoDto })
  async actualizarArchivo(
    @Param('id', ParseUUIDPipe) idArchivo: string,
    @Body() dto: UpdateArchivoDto,
    @Req() req: RequestWithUser,
  ) {
    const idUsuario = req.user.idUsuario;
    return this.archivoService.actualizarArchivo(idArchivo, dto, idUsuario);
  }

  @Post('previsualizar-url')
  @Permiso('archivos', 'ver')
  @ApiOperation({ summary: 'Previsualizar metadatos de una URL externa' })
  @ApiBody({ type: PreviewUrlDto })
  async previsualizarUrl(@Body() dto: PreviewUrlDto) {
    return this.archivoService.previsualizarUrl(dto.url);
  }
}
