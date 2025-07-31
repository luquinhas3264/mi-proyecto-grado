import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateInteraccionDto } from './dto/create-interaccion.dto';
import { ActividadService } from '../actividad/actividad.service';
import { TipoActividad } from '../actividad/dto/create-actividad.dto';

@Injectable()
export class InteraccionClienteService {
  constructor(
    private prisma: PrismaService,
    private actividadService: ActividadService,
  ) {}

  async crear(dto: CreateInteraccionDto, idUsuario: string) {
    const interaccion = await this.prisma.interaccionCliente.create({
      data: {
        tipo: dto.tipo,
        descripcion: dto.descripcion,
        fecha: new Date(dto.fecha),
        idContacto: dto.idContacto,
      },
      include: {
        contacto: {
          select: {
            nombre: true,
            idCliente: true,
          },
        },
      },
    });

    await this.actividadService.registrar({
      tipo: TipoActividad.INTERACCION,
      descripcion: `Nueva interacción (${dto.tipo}) con "${interaccion.contacto.nombre}".`,
      idUsuario,
      idCliente: interaccion.contacto.idCliente,
    });

    return interaccion;
  }

  async obtenerPorContacto(idContacto: string) {
    return this.prisma.interaccionCliente.findMany({
      where: { idContacto },
      orderBy: { fecha: 'desc' },
    });
  }

  async obtenerPorCliente(idCliente: string) {
    return this.prisma.interaccionCliente.findMany({
      where: {
        contacto: {
          idCliente,
        },
      },
      include: {
        contacto: {
          select: { nombre: true },
        },
      },
      orderBy: { fecha: 'desc' },
    });
  }
}
