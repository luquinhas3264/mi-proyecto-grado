import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ActividadesService } from 'src/actividades/actividades.service';
import { TipoActividad } from 'src/actividades/enums/tipo-actividad.enum';
import { CreateArchivoDto, CreateEnlaceDto, UpdateArchivoDto, FiltrosArchivoDto } from './dto';
import { UrlUtils  } from './utils/url.utils';
import { TipoArchivo } from './enums/tipo-archivo.enum';
import { ARCHIVO_CONFIG } from './constants/archivo.constants';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ArchivoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly actividadesService: ActividadesService,
  ) {}

  // ===============================
  // CREAR ARCHIVO FÍSICO
  // ===============================
  async subirArchivo(dto: CreateArchivoDto, idUsuario: string) {
    // 1. Validar que el proyecto existe
    await this.validarProyectoExiste(dto.idProyecto);

    // 2. Validar restricciones
    await this.validarRestriccionesProyecto(dto.idProyecto, dto.tamaño || 0, dto.tipo);

    // 3. Crear registro en BD
    const archivo = await this.prisma.archivo.create({
      data: {
        nombre: dto.nombre,
        tipo: dto.tipo,
        tamaño: dto.tamaño,
        url: dto.url,
        descripcion: dto.descripcion,
        idProyecto: dto.idProyecto,
        idUsuarioCreador: idUsuario,
      },
      include: {
        proyecto: {
          select: {
            nombre: true,
            idCliente: true,
          },
        },
        usuarioCreador: {
          select: {
            nombre: true,
          },
        },
      },
    });

    // 4. Registrar actividad
    await this.actividadesService.registrar({
      tipo: TipoActividad.ARCHIVO_SUBIDO,
      descripcion: `Se subió el archivo "${archivo.nombre}" al proyecto "${archivo.proyecto.nombre}"`,
      idUsuario,
      idCliente: archivo.proyecto.idCliente,
      idProyecto: archivo.idProyecto,
    });

    return archivo;
  }

  // ===============================
  // CREAR ENLACE EXTERNO
  // ===============================
  async crearEnlaceExterno(dto: CreateEnlaceDto, idProyecto: string, idUsuario: string) {
    // 1. Validar que el proyecto existe
    await this.validarProyectoExiste(idProyecto);

    // 2. Validar y normalizar URL
    const urlValidada = this.validarYNormalizarUrl(dto.url);

    // 3. Validar restricciones (solo cantidad, no tamaño)
    await this.validarRestriccionesProyecto(idProyecto, 0, TipoArchivo.URL);

    // 4. Verificar si ya existe un enlace con la misma URL en el proyecto
    await this.verificarEnlaceDuplicado(idProyecto, urlValidada.url);

    // 5. Crear registro en BD
    const enlace = await this.prisma.archivo.create({
      data: {
        nombre: dto.nombre,
        tipo: TipoArchivo.URL,
        tamaño: null, // Los enlaces no tienen tamaño
        url: urlValidada.url,
        descripcion: dto.descripcion || urlValidada.descripcionSugerida,
        idProyecto: idProyecto,
        idUsuarioCreador: idUsuario,
      },
      include: {
        proyecto: {
          select: {
            nombre: true,
            idCliente: true,
          },
        },
        usuarioCreador: {
          select: {
            nombre: true,
          },
        },
      },
    });

    // 6. Registrar actividad
    await this.actividadesService.registrar({
      tipo: TipoActividad.ARCHIVO_SUBIDO,
      descripcion: `Se agregó el enlace "${enlace.nombre}" al proyecto "${enlace.proyecto.nombre}"`,
      idUsuario,
      idCliente: enlace.proyecto.idCliente,
      idProyecto: enlace.idProyecto,
    });

    return {
      ...enlace,
      metadatos: {
        dominio: urlValidada.dominio,
        tipo: urlValidada.tipo,
        esSeguro: urlValidada.esSeguro,
      },
    };
  }

  // ===============================
  // PREVISUALIZAR URL
  // ===============================
  async previsualizarUrl(url: string) {
    // 1. Validar y normalizar URL
    const urlValidada = this.validarYNormalizarUrl(url);

    // 2. Extraer metadatos sugeridos
    const metadatos = UrlUtils.extraerMetadatos(urlValidada.url);

    return {
      url: urlValidada.url,
      urlOriginal: url,
      esValida: true,
      esSeguro: urlValidada.esSeguro,
      dominio: urlValidada.dominio,
      tipoServicio: urlValidada.tipo,
      metadatosSugeridos: {
        nombre: metadatos.nombre,
        descripcion: metadatos.descripcionSugerida,
        icono: metadatos.icono,
      },
    };
  }


  // ===============================
  // OBTENER ARCHIVOS POR PROYECTO
  // ===============================
  async obtenerArchivosPorProyecto(idProyecto: string, filtros: FiltrosArchivoDto = {}) {
    // 1. Validar que el proyecto existe
    await this.validarProyectoExiste(idProyecto);

    // 2. Construir condiciones WHERE
    const where: any = { idProyecto };

    if (filtros.tipo) {
      where.tipo = filtros.tipo;
    }

    if (filtros.busqueda) {
      where.OR = [
        { nombre: { contains: filtros.busqueda, mode: 'insensitive' } },
        { descripcion: { contains: filtros.busqueda, mode: 'insensitive' } },
      ];
    }

    if (filtros.fechaDesde) {
      where.creadoEn = { gte: new Date(filtros.fechaDesde) };
    }

    if (filtros.fechaHasta) {
      where.creadoEn = {
        ...where.creadoEn,
        lte: new Date(filtros.fechaHasta),
      };
    }

    // 3. Configurar ordenamiento
    let orderBy: any = { creadoEn: 'desc' }; // Default

    if (filtros.orderBy) {
      const direction = filtros.orderDirection || 'asc';
      orderBy = { [filtros.orderBy]: direction };
    }

    // 4. Ejecutar consulta
    const archivos = await this.prisma.archivo.findMany({
      where,
      include: {
        usuarioCreador: {
          select: {
            idUsuario: true,
            nombre: true,
          },
        },
      },
      orderBy,
    });

    return archivos;
  }

  // ===============================
  // OBTENER ARCHIVO POR ID
  // ===============================
  async obtenerArchivoPorId(idArchivo: string) {
    const archivo = await this.prisma.archivo.findUnique({
      where: { idArchivo },
      include: {
        proyecto: {
          select: {
            idProyecto: true,
            nombre: true,
            idCliente: true,
            cliente: {
              select: {
                razonSocial: true,
              },
            },
          },
        },
        usuarioCreador: {
          select: {
            idUsuario: true,
            nombre: true,
            correo: true,
          },
        },
      },
    });

    if (!archivo) {
      throw new NotFoundException(ARCHIVO_CONFIG.ERRORES.ARCHIVO_NO_ENCONTRADO);
    }

    return archivo;
  }

  // ===============================
  // ACTUALIZAR ARCHIVO
  // ===============================
  async actualizarArchivo(idArchivo: string, dto: UpdateArchivoDto, idUsuario: string) {
    // 1. Verificar que el archivo existe
    const archivo = await this.obtenerArchivoPorId(idArchivo);

    // 2. Verificar permisos (solo el creador o admin puede editar)
    await this.verificarPermisosArchivo(archivo, idUsuario, 'editar');

    // 3. Actualizar archivo
    const archivoActualizado = await this.prisma.archivo.update({
      where: { idArchivo },
      data: {
        ...dto,
      },
      include: {
        proyecto: {
          select: {
            nombre: true,
            idCliente: true,
          },
        },
        usuarioCreador: {
          select: {
            nombre: true,
          },
        },
      },
    });

    // 4. Registrar actividad
    await this.actividadesService.registrar({
      tipo: TipoActividad.EDICION,
      descripcion: `Se actualizó el archivo "${archivoActualizado.nombre}"`,
      idUsuario,
      idCliente: archivoActualizado.proyecto.idCliente,
      idProyecto: archivoActualizado.idProyecto,
    });

    return archivoActualizado;
  }

  // ===============================
  // ELIMINAR ARCHIVO
  // ===============================
  async eliminarArchivo(idArchivo: string, idUsuario: string) {
    // 1. Verificar que el archivo exists
    const archivo = await this.obtenerArchivoPorId(idArchivo);

    // 2. Verificar permisos
    await this.verificarPermisosArchivo(archivo, idUsuario, 'eliminar');

    // 3. Eliminar archivo físico (si no es URL)
    if (archivo.tipo !== TipoArchivo.URL && archivo.url.startsWith('/')) {
      await this.eliminarArchivoFisico(archivo.url);
    }

    // 4. Eliminar registro de BD
    await this.prisma.archivo.delete({
      where: { idArchivo },
    });

    // 5. Registrar actividad
    await this.actividadesService.registrar({
      tipo: TipoActividad.ARCHIVO_ELIMINADO,
      descripcion: `Se eliminó el archivo "${archivo.nombre}"`,
      idUsuario,
      idCliente: archivo.proyecto.idCliente,
      idProyecto: archivo.idProyecto,
    });

    return { mensaje: 'Archivo eliminado correctamente' };
  }

  // ===============================
  // OBTENER ESTADÍSTICAS DE PROYECTO
  // ===============================
  async obtenerEstadisticasProyecto(idProyecto: string) {
    const [totalArchivos, totalTamaño, porTipo] = await Promise.all([
      // Total de archivos
      this.prisma.archivo.count({
        where: { idProyecto },
      }),

      // Tamaño total usado
      this.prisma.archivo.aggregate({
        where: {
          idProyecto,
          tamaño: { not: null },
        },
        _sum: { tamaño: true },
      }),

      // Archivos por tipo
      this.prisma.archivo.groupBy({
        by: ['tipo'],
        where: { idProyecto },
        _count: true,
      }),
    ]);

    return {
      totalArchivos,
      totalTamaño: totalTamaño._sum.tamaño || 0,
      espacioRestante: ARCHIVO_CONFIG.TAMAÑO_MAX_PROYECTO - (totalTamaño._sum.tamaño || 0),
      archivosRestantes: ARCHIVO_CONFIG.CANTIDAD_MAX_ARCHIVOS - totalArchivos,
      porTipo: porTipo.reduce((acc, item) => {
        acc[item.tipo] = item._count;
        return acc;
      }, {}),
    };
  }

  // ===============================
  // MÉTODOS PRIVADOS DE VALIDACIÓN
  // ===============================
  private async validarProyectoExiste(idProyecto: string) {
    const proyecto = await this.prisma.proyecto.findUnique({
      where: { idProyecto, activo: true },
      select: { idProyecto: true, nombre: true },
    });

    if (!proyecto) {
      throw new NotFoundException(ARCHIVO_CONFIG.ERRORES.PROYECTO_NO_ENCONTRADO);
    }

    return proyecto;
  }

  private async validarRestriccionesProyecto(idProyecto: string, nuevoTamaño: number, tipo: string) {
    // 1. Validar tamaño máximo por archivo
    if (nuevoTamaño > ARCHIVO_CONFIG.TAMAÑO_MAX_ARCHIVO) {
      throw new BadRequestException(ARCHIVO_CONFIG.ERRORES.ARCHIVO_MUY_GRANDE);
    }

    // 2. Validar tipo permitido
    if (!ARCHIVO_CONFIG.TIPOS_PERMITIDOS.includes(tipo)) {
      throw new BadRequestException(ARCHIVO_CONFIG.ERRORES.TIPO_NO_PERMITIDO);
    }

    // 3. Obtener estadísticas actuales
    const estadisticas = await this.obtenerEstadisticasProyecto(idProyecto);

    // 4. Validar cantidad máxima
    if (estadisticas.totalArchivos >= ARCHIVO_CONFIG.CANTIDAD_MAX_ARCHIVOS) {
      throw new BadRequestException(ARCHIVO_CONFIG.ERRORES.LIMITE_CANTIDAD);
    }

    // 5. Validar espacio total (solo para archivos con tamaño)
    if (nuevoTamaño > 0 && (estadisticas.totalTamaño + nuevoTamaño) > ARCHIVO_CONFIG.TAMAÑO_MAX_PROYECTO) {
      throw new BadRequestException(ARCHIVO_CONFIG.ERRORES.LIMITE_ESPACIO);
    }
  }

  private async verificarPermisosArchivo(archivo: any, idUsuario: string, accion: string) {
    // Lógica simple: solo el creador puede eliminar/editar sus archivos
    // TODO: En el futuro se puede integrar con permisos más complejos
    if (archivo.usuarioCreador.idUsuario !== idUsuario) {
      // Aquí se podría verificar si es admin del proyecto
      throw new ForbiddenException(ARCHIVO_CONFIG.ERRORES.SIN_PERMISOS_ELIMINAR);
    }
  }

  private async eliminarArchivoFisico(rutaArchivo: string) {
    try {
      const rutaCompleta = path.join(process.cwd(), rutaArchivo);
      if (fs.existsSync(rutaCompleta)) {
        fs.unlinkSync(rutaCompleta);
      }
    } catch (error) {
      console.error('Error al eliminar archivo físico:', error);
      // No lanzamos error para no bloquear la eliminación del registro
    }
  }

  private validarYNormalizarUrl(url: string): {
    url: string;
    dominio: string;
    tipo: string;
    esSeguro: boolean;
    descripcionSugerida: string;
  } {
    // 1. Validar URL con UrlUtils
    const validacion = UrlUtils.validarUrl(url);

    // 2. Normalizar URL
    const urlNormalizada = UrlUtils.normalizarUrl(url);

    // 3. Verificar si el dominio es seguro
    const esSeguro = UrlUtils.esDominioSeguro(urlNormalizada);

    // 4. Extraer metadatos sugeridos
    const metadatos = UrlUtils.extraerMetadatos(urlNormalizada);

    return {
      url: urlNormalizada,
      dominio: validacion.dominio,
      tipo: validacion.tipo,
      esSeguro,
      descripcionSugerida: metadatos.descripcionSugerida,
    };
  }

  private async verificarEnlaceDuplicado(idProyecto: string, url: string) {
    const enlaceExistente = await this.prisma.archivo.findFirst({
      where: {
        idProyecto,
        tipo: TipoArchivo.URL,
        url,
      },
      select: { idArchivo: true, nombre: true },
    });
    if (enlaceExistente) {
      throw new BadRequestException(
        `Ya existe un enlace externo con la misma URL en este proyecto: "${enlaceExistente.nombre}"`
      );
    }
  }
}