import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProyectoDto } from './dto/create-proyecto.dto';
import { ActividadesService } from 'src/actividades/actividades.service';
import { TipoActividad } from 'src/actividades/enums/tipo-actividad.enum';
import { EstadoProyecto } from './enums/estado-proyecto.enum';
import { UpdateProyectoDto } from './dto/update-proyecto.dto';
import { differenceInCalendarDays, isBefore } from 'date-fns';

@Injectable()
export class ProyectoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly actividadesService: ActividadesService,
  ) {}

  async crearProyecto(dto: CreateProyectoDto, idUsuario: string) {
    // Validar que el cliente exista
    const cliente = await this.prisma.clienteEmpresa.findUnique({
      where: { idCliente: dto.idCliente },
    });

    if (!cliente) throw new NotFoundException('Cliente no encontrado');

    // Validar que fechaFin (si viene) sea mayor o igual a fechaInicio
    const fechaInicio = new Date(dto.fechaInicio);
    const fechaFin = dto.fechaFin ? new Date(dto.fechaFin) : undefined;

    if (fechaFin && fechaFin < fechaInicio) {
      throw new BadRequestException(
        'La fecha de fin no puede ser anterior a la fecha de inicio.',
      );
    }

    // Validar que no exista otro proyecto con el mismo nombre para este cliente
    const proyectoExistente = await this.prisma.proyecto.findFirst({
      where: {
        nombre: dto.nombre,
        idCliente: dto.idCliente,
        activo: true, // evitar duplicados entre proyectos vigentes
      },
    });

    if (proyectoExistente) {
      throw new BadRequestException(
        `Ya existe un proyecto con el nombre "${dto.nombre}" para este cliente.`,
      );
    }

    // Crear el proyecto
    const proyecto = await this.prisma.proyecto.create({
      data: {
        nombre: dto.nombre,
        descripcion: dto.descripcion,
        estado: EstadoProyecto.PLANEADO,
        fechaInicio: new Date(dto.fechaInicio),
        fechaFin: dto.fechaFin ? new Date(dto.fechaFin) : undefined,
        idCliente: dto.idCliente,
      },
      include: {
        cliente: {
          select: {
            razonSocial: true,
          },
        },
      },
    });

    // Registrar actividad
    await this.actividadesService.registrar({
      tipo: TipoActividad.CREACION,
      descripcion: `Se creó el proyecto "${proyecto.nombre}" para el cliente "${proyecto.cliente.razonSocial}"`,
      idUsuario,
      idCliente: proyecto.idCliente,
      idProyecto: proyecto.idProyecto,
    });

    return proyecto;
  }

  async obtenerTodos(idCliente?: string) {
    const proyectos = await this.prisma.proyecto.findMany({
      where: {
        activo: true,
        ...(idCliente ? { idCliente } : {}),
      },
      include: {
        cliente: {
          select: {
            razonSocial: true,
            rubro: true,
          },
        },
        notas: true,
      },
      orderBy: [{ estado: 'asc' }, { creadoEn: 'desc' }],
    });

    const hoy = new Date();

    return proyectos.map((p) => {
      const diasRestantes =
        p.fechaFin && p.estado !== EstadoProyecto.FINALIZADO
          ? differenceInCalendarDays(new Date(p.fechaFin), hoy)
          : null;

      const estaAtrasado =
        p.fechaFin &&
        isBefore(new Date(p.fechaFin), hoy) &&
        p.estado !== EstadoProyecto.FINALIZADO;

      return {
        ...p,
        diasRestantes,
        estaAtrasado,
      };
    });
  }

  async obtenerDetalleProyecto(id: string) {
    const proyecto = await this.prisma.proyecto.findUnique({
      where: { idProyecto: id },
      include: {
        cliente: {
          select: {
            idCliente: true,
            razonSocial: true,
            rubro: true,
            correo: true,
            telefono: true,
          },
        },
        notas: {
          orderBy: {
            fecha: 'desc',
          },
        },
        actividades: {
          include: {
            usuario: {
              select: {
                nombre: true,
              },
            },
          },
          orderBy: {
            fecha: 'desc',
          },
          take: 10,
        },
        tareas: true,
        archivos: true,
      },
    });

    if (!proyecto) throw new NotFoundException('Proyecto no encontrado');

    // Lógica igual que en obtenerTodos
    const hoy = new Date();
    const diasRestantes =
      proyecto.fechaFin && proyecto.estado !== EstadoProyecto.FINALIZADO
        ? differenceInCalendarDays(new Date(proyecto.fechaFin), hoy)
        : null;

    const estaAtrasado =
      proyecto.fechaFin &&
      isBefore(new Date(proyecto.fechaFin), hoy) &&
      proyecto.estado !== EstadoProyecto.FINALIZADO;

    return {
      ...proyecto,
      diasRestantes,
      estaAtrasado,
    };
  }

  async obtenerEstadisticas(idCliente?: string) {
    const whereClause = {
      activo: true,
      ...(idCliente && { idCliente }),
    };

    const [total, porEstado, proximos, atrasados] = await Promise.all([
      // Total de proyectos
      this.prisma.proyecto.count({ where: whereClause }),

      // Proyectos por estado
      this.prisma.proyecto.groupBy({
        by: ['estado'],
        where: whereClause,
        _count: true,
      }),

      // Proyectos que terminan en los próximos 7 días
      this.prisma.proyecto.count({
        where: {
          ...whereClause,
          estado: { in: [EstadoProyecto.PLANEADO, EstadoProyecto.EN_PROGRESO] },
          fechaFin: {
            gte: new Date(),
            lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),

      // Proyectos atrasados
      this.prisma.proyecto.count({
        where: {
          ...whereClause,
          estado: { in: [EstadoProyecto.PLANEADO, EstadoProyecto.EN_PROGRESO] },
          fechaFin: { lt: new Date() },
        },
      }),
    ]);

    return {
      total,
      porEstado: porEstado.reduce((acc, item) => {
        acc[item.estado] = item._count;
        return acc;
      }, {}),
      proximosAVencer: proximos,
      atrasados,
    };
  }

  async actualizarProyecto(
    idProyecto: string,
    dto: UpdateProyectoDto,
    idUsuario: string,
  ) {
    const proyecto = await this.prisma.proyecto.findUnique({
      where: { idProyecto },
    });

    if (!proyecto) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    // Limpia propiedades undefined del DTO
    Object.keys(dto).forEach((key) => {
      if (dto[key] === undefined) {
        delete dto[key];
      }
    });

    const dataToUpdate = { ...dto };
    if (dataToUpdate.fechaInicio) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(dataToUpdate.fechaInicio)) {
        dataToUpdate.fechaInicio = new Date(
          dataToUpdate.fechaInicio + 'T00:00:00.000Z',
        ).toISOString();
      }
    }
    if (dataToUpdate.fechaFin) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(dataToUpdate.fechaFin)) {
        dataToUpdate.fechaFin = new Date(
          dataToUpdate.fechaFin + 'T00:00:00.000Z',
        ).toISOString();
      }
    }
    const actualizado = await this.prisma.proyecto.update({
      where: { idProyecto },
      data: dataToUpdate,
      include: {
        cliente: { select: { razonSocial: true } },
      },
    });

    const esFinalizacion =
      proyecto.estado !== EstadoProyecto.FINALIZADO &&
      dataToUpdate.estado === EstadoProyecto.FINALIZADO;

    await this.actividadesService.registrar({
      tipo: esFinalizacion ? TipoActividad.FINALIZACION : TipoActividad.EDICION,
      descripcion: esFinalizacion
        ? `El proyecto "${actualizado.nombre}" fue finalizado.`
        : `El proyecto "${actualizado.nombre}" fue editado.`,
      idUsuario,
      idCliente: actualizado.idCliente,
      idProyecto: actualizado.idProyecto,
    });

    return actualizado;
  }

  async eliminarProyecto(id: string, idUsuario: string) {
    const proyecto = await this.prisma.proyecto.findUnique({
      where: { idProyecto: id },
    });

    if (!proyecto) throw new NotFoundException('Proyecto no encontrado');

    const eliminado = await this.prisma.proyecto.update({
      where: { idProyecto: id },
      data: { activo: false },
    });

    // Registrar actividad de cambio de estado (soft delete)
    await this.actividadesService.registrar({
      tipo: TipoActividad.CAMBIO_ESTADO_PROYECTO,
      descripcion: `El estado del proyecto "${eliminado.nombre}" fue cambiado a inactivo.`,
      idUsuario,
      idCliente: eliminado.idCliente,
      idProyecto: eliminado.idProyecto,
    });

    return { mensaje: 'Proyecto eliminado correctamente' };
  }
}
