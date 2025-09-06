import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ActividadesService } from 'src/actividades/actividades.service';
import { CreateTareaDto } from './dto/create-tarea.dto';
import { UpdateTareaDto } from './dto/update-tarea.dto';
import { FiltrosTareaDto } from './dto/filtros-tarea.dto';
import { EstadoTarea } from './enums/estado-tarea.enum';
import { TipoActividad } from 'src/actividades/enums/tipo-actividad.enum';

@Injectable()
export class TareaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly actividadesService: ActividadesService,
  ) {}

  // Crear tarea
  async crear(dto: CreateTareaDto, idUsuario: string) {
    // Validar que el proyecto existe
    const proyecto = await this.prisma.proyecto.findUnique({
      where: { idProyecto: dto.idProyecto },
      select: { idProyecto: true, nombre: true, activo: true, idCliente: true },
    });

    if (!proyecto || !proyecto.activo) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    // Validar que el usuario responsable existe (si se proporciona)
    if (dto.idUsuarioResponsable) {
      const usuario = await this.prisma.usuarioInterno.findUnique({
        where: { idUsuario: dto.idUsuarioResponsable },
        select: { idUsuario: true, activo: true, nombre: true },
      });

      if (!usuario || !usuario.activo) {
        throw new NotFoundException('Usuario responsable no encontrado');
      }
    }

    // Crear la tarea
    const tarea = await this.prisma.tarea.create({
      data: {
        nombre: dto.nombre,
        descripcion: dto.descripcion,
        fechaLimite: dto.fechaLimite ? new Date(dto.fechaLimite) : undefined,
        idProyecto: dto.idProyecto,
        idUsuarioResponsable: dto.idUsuarioResponsable,
      },
      include: {
        proyecto: {
          select: { nombre: true, idCliente: true },
        },
        usuarioResponsable: {
          select: { nombre: true },
        },
      },
    });

    // Registrar actividad
    await this.actividadesService.registrar({
      tipo: TipoActividad.CREACION,
      descripcion: `Se creó la tarea "${tarea.nombre}" en el proyecto "${tarea.proyecto.nombre}"`,
      idUsuario,
      idCliente: tarea.proyecto.idCliente,
      idProyecto: tarea.idProyecto,
    });

    // Hook para futuras notificaciones (preparado)
    // this.notificarCambio('TAREA_CREADA', tarea);

    return tarea;
  }

  // Visualizar tareas por proyecto
  async obtenerPorProyecto(idProyecto: string, filtros: FiltrosTareaDto) {
    // Validar que el proyecto existe
    const proyecto = await this.prisma.proyecto.findUnique({
      where: { idProyecto },
      select: { idProyecto: true, activo: true },
    });

    if (!proyecto || !proyecto.activo) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    return this.aplicarFiltros({ idProyecto }, filtros);
  }

  // Visualizar tareas asignadas
  async obtenerPorResponsable(idUsuarioResponsable: string, filtros: FiltrosTareaDto) {
    return this.aplicarFiltros({ idUsuarioResponsable }, filtros);
  }

  // Obtener tarea específica
  async obtenerPorId(idTarea: string) {
    const tarea = await this.prisma.tarea.findUnique({
      where: { idTarea },
      include: {
        proyecto: {
          select: {
            idProyecto: true,
            idCliente: true,
            nombre: true,
            cliente: {
              select: { razonSocial: true },
            },
          },
        },
        usuarioResponsable: {
          select: {
            idUsuario: true,
            nombre: true,
            correo: true,
          },
        },
      },
    });

    if (!tarea) {
      throw new NotFoundException('Tarea no encontrada');
    }

    return tarea;
  }

  // Editar tarea
  async actualizar(idTarea: string, dto: UpdateTareaDto, idUsuario: string) {
    const tarea = await this.obtenerPorId(idTarea);

    // Validar usuario responsable si se está actualizando
    if (dto.idUsuarioResponsable) {
      const usuario = await this.prisma.usuarioInterno.findUnique({
        where: { idUsuario: dto.idUsuarioResponsable },
        select: { idUsuario: true, activo: true },
      });

      if (!usuario || !usuario.activo) {
        throw new NotFoundException('Usuario responsable no encontrado');
      }
    }

    const tareaActualizada = await this.prisma.tarea.update({
      where: { idTarea },
      data: {
        ...dto,
        fechaLimite: dto.fechaLimite ? new Date(dto.fechaLimite) : undefined,
      },
      include: {
        proyecto: { select: { nombre: true, idCliente: true } },
        usuarioResponsable: { select: { nombre: true } },
      },
    });

    // Registrar actividad
    await this.actividadesService.registrar({
      tipo: TipoActividad.EDICION,
      descripcion: `Se actualizó la tarea "${tareaActualizada.nombre}"`,
      idUsuario,
      idCliente: tareaActualizada.proyecto.idCliente,
      idProyecto: tareaActualizada.idProyecto,
    });

    // Hook para futuras notificaciones (preparado)
    // this.notificarCambio('TAREA_ACTUALIZADA', tareaActualizada);

    return tareaActualizada;
  }

  // Cambiar estado de tarea
  async cambiarEstado(idTarea: string, estado: string, idUsuario: string) {
    if (!Object.values(EstadoTarea).includes(estado as EstadoTarea)) {
      throw new BadRequestException('Estado de tarea inválido');
    }

    const tarea = await this.obtenerPorId(idTarea);
    
    const tareaActualizada = await this.prisma.tarea.update({
      where: { idTarea },
      data: { estado: estado as EstadoTarea },
      include: {
        proyecto: { select: { nombre: true, idCliente: true } },
        usuarioResponsable: { select: { nombre: true } },
      },
    });

    // Registrar actividad
    await this.actividadesService.registrar({
      tipo: TipoActividad.CAMBIO_ESTADO_TAREA,
      descripcion: `Se cambió el estado de la tarea "${tareaActualizada.nombre}" a: ${estado}`,
      idUsuario,
      idCliente: tareaActualizada.proyecto.idCliente,
      idProyecto: tareaActualizada.idProyecto,
    });

    // Hook para futuras notificaciones (CU10 - preparado)
    // this.notificarCambio('ESTADO_CAMBIADO', tareaActualizada);

    return tareaActualizada;
  }

  // Asignar responsable
  async asignarResponsable(idTarea: string, idUsuarioResponsable: string, idUsuario: string) {
    const tarea = await this.obtenerPorId(idTarea);

    // Validar usuario responsable
    const usuario = await this.prisma.usuarioInterno.findUnique({
      where: { idUsuario: idUsuarioResponsable },
      select: { idUsuario: true, activo: true, nombre: true },
    });

    if (!usuario || !usuario.activo) {
      throw new NotFoundException('Usuario responsable no encontrado');
    }

    const tareaActualizada = await this.prisma.tarea.update({
      where: { idTarea },
      data: { idUsuarioResponsable },
      include: {
        proyecto: { select: { nombre: true, idCliente: true } },
        usuarioResponsable: { select: { nombre: true } },
      },
    });

    // Registrar actividad
    await this.actividadesService.registrar({
      tipo: TipoActividad.ASIGNACION,
      descripcion: `Se asignó la tarea "${tareaActualizada.nombre}" a ${usuario.nombre}`,
      idUsuario,
      idCliente: tareaActualizada.proyecto.idCliente,
      idProyecto: tareaActualizada.idProyecto,
    });

    // Hook para futuras notificaciones (CU10 - preparado)
    // this.notificarCambio('RESPONSABLE_ASIGNADO', tareaActualizada);

    return tareaActualizada;
  }

  // Eliminar tarea
  async eliminar(idTarea: string, idUsuario: string) {
    const tarea = await this.obtenerPorId(idTarea);

    await this.prisma.tarea.delete({
      where: { idTarea },
    });

    // Registrar actividad 
    await this.actividadesService.registrar({
      tipo: TipoActividad.ELIMINACION,
      descripcion: `Se eliminó la tarea "${tarea.nombre}"`,
      idUsuario,
      idCliente: tarea.proyecto.idCliente,
      idProyecto: tarea.idProyecto,
    });

    return { mensaje: 'Tarea eliminada exitosamente' };
  }

  // Estadísticas de proyecto
  async obtenerEstadisticasProyecto(idProyecto: string) {
    const [total, porEstado, vencidas] = await Promise.all([
      this.prisma.tarea.count({ where: { idProyecto } }),
      
      this.prisma.tarea.groupBy({
        by: ['estado'],
        where: { idProyecto },
        _count: true,
      }),
      
      this.prisma.tarea.count({
        where: {
          idProyecto,
          fechaLimite: { lt: new Date() },
          estado: { not: EstadoTarea.COMPLETADA },
        },
      }),
    ]);

    return {
      total,
      porEstado: porEstado.reduce((acc, item) => {
        acc[item.estado] = item._count;
        return acc;
      }, {}),
      vencidas,
    };
  }

  // Método privado para aplicar filtros
  private async aplicarFiltros(whereBase: any, filtros: FiltrosTareaDto) {
    const where: any = { ...whereBase };

    // Aplicar filtros
    if (filtros.estado) {
      where.estado = filtros.estado;
    }

    if (filtros.idUsuarioResponsable) {
      where.idUsuarioResponsable = filtros.idUsuarioResponsable;
    }

    if (filtros.busqueda) {
      where.OR = [
        { nombre: { contains: filtros.busqueda, mode: 'insensitive' } },
        { descripcion: { contains: filtros.busqueda, mode: 'insensitive' } },
      ];
    }

    if (filtros.fechaLimiteDesde) {
      where.fechaLimite = { gte: new Date(filtros.fechaLimiteDesde) };
    }

    if (filtros.fechaLimiteHasta) {
      where.fechaLimite = {
        ...where.fechaLimite,
        lte: new Date(filtros.fechaLimiteHasta),
      };
    }

    if (filtros.vencidas) {
      where.fechaLimite = { lt: new Date() };
      where.estado = { not: EstadoTarea.COMPLETADA };
    }

    // Configurar ordenamiento
    let orderBy: any = { creadoEn: 'desc' }; // Default

    if (filtros.orderBy) {
      const direction = filtros.orderDirection || 'asc';
      orderBy = { [filtros.orderBy]: direction };
    }

    return this.prisma.tarea.findMany({
      where,
      include: {
        proyecto: {
          select: { nombre: true },
        },
        usuarioResponsable: {
          select: { nombre: true, correo: true },
        },
      },
      orderBy,
    });
  }

  // Hook para futuras notificaciones (preparado)
//   private notificarCambio(evento: string, tarea: any) {
//     // TODO: Implementar cuando tengamos módulo de notificaciones
//     console.log(`[NOTIFICACIÓN] ${evento}:`, tarea.nombre);
//   }
}