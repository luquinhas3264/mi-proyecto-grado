import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateNotaProyectoDto } from './dto/create-nota.dto';
import { UpdateNotaProyectoDto } from './dto/update-nota.dto';
import { ActividadService } from 'src/clientes/actividad/actividad.service';
import { TipoActividad } from 'src/clientes/actividad/dto/create-actividad.dto';

@Injectable()
export class NotaProyectoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly actividadService: ActividadService,
  ) {}

  async crear(idProyecto: string, dto: CreateNotaProyectoDto, idUsuario: string) {
    const proyecto = await this.prisma.proyecto.findUnique({
      where: { idProyecto },
    });

    if (!proyecto || !proyecto.activo) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    const nota = await this.prisma.notaProyecto.create({
      data: {
        contenido: dto.contenido,
        idProyecto,
      },
      include: {
        proyecto: {
          select: {
            nombre: true,
            cliente: {
              select: {
                razonSocial: true,
              },
            },
          },
        },
      },
    });

    await this.actividadService.registrar({
      tipo: TipoActividad.CREACION,
      descripcion: `Se agregó una nota al proyecto "${proyecto.nombre}"`,
      idUsuario,
      idCliente: proyecto.idCliente,
      idProyecto: proyecto.idProyecto,
    });

    return nota;
  }

  async listarPorProyecto(idProyecto: string) {
    return this.prisma.notaProyecto.findMany({
      where: { idProyecto },
      orderBy: { fecha: 'desc' },
    });
  }

  async actualizar(idNota: string, dto: UpdateNotaProyectoDto) {
    const nota = await this.prisma.notaProyecto.findUnique({
      where: { idNota },
    });

    if (!nota) throw new NotFoundException('Nota no encontrada');

    return this.prisma.notaProyecto.update({
      where: { idNota },
      data: { contenido: dto.contenido },
      include: {
        proyecto: {
          select: {
            nombre: true,
          },
        },
      },
    });
  }

  async eliminar(idNota: string) {
    const nota = await this.prisma.notaProyecto.findUnique({
      where: { idNota },
    });

    if (!nota) throw new NotFoundException('Nota no encontrada');

    await this.prisma.notaProyecto.delete({
      where: { idNota },
    });

    return { message: 'Nota eliminada correctamente' };
  }
}
