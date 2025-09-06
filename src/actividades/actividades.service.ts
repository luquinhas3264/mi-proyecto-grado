import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateActividadDto } from './dto/create-actividad.dto';
import { FilterActividadDto } from './dto/filter-actividad.dto';
import { UpdateActividadDto } from './dto/update-actividad.dto';

@Injectable()
export class ActividadesService {
  constructor(private readonly prisma: PrismaService) {}

  async registrar(createActividadDto: CreateActividadDto) {
    return this.prisma.actividad.create({
      data: {
        ...createActividadDto,
        fecha: createActividadDto.fecha ? new Date(createActividadDto.fecha) : undefined,
      },
    });
  }

  async findAll(filter: FilterActividadDto) {
    const where: any = {};
    if (filter.idUsuario) where.idUsuario = filter.idUsuario;
    if (filter.idCliente) where.idCliente = filter.idCliente;
    if (filter.idProyecto) where.idProyecto = filter.idProyecto;
    if (filter.tipo) where.tipo = filter.tipo;
    if (filter.fechaInicio || filter.fechaFin) {
      where.fecha = {};
      if (filter.fechaInicio) where.fecha.gte = new Date(filter.fechaInicio);
      if (filter.fechaFin) where.fecha.lte = new Date(filter.fechaFin);
    }
    return this.prisma.actividad.findMany({
      where,
      include: {
        usuario: true,
        cliente: true,
        proyecto: true,
      },
      orderBy: {
        fecha: 'desc',
      },
    });
  }

  async editar(id: string, updateActividadDto: UpdateActividadDto) {
    return this.prisma.actividad.update({
      where: { idActividad: id },
      data: {
        ...updateActividadDto,
        fecha: updateActividadDto.fecha ? new Date(updateActividadDto.fecha) : undefined,
      },
    });
  }

  async eliminar(id: string) {
    return this.prisma.actividad.delete({
      where: { idActividad: id },
    });
  }
}
