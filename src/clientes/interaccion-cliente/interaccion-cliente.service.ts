import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateInteraccionDto } from './dto/create-interaccion.dto';
import { ActividadesService } from 'src/actividades/actividades.service';
import { TipoActividad } from 'src/actividades/enums/tipo-actividad.enum';

@Injectable()
export class InteraccionClienteService {
  constructor(
    private prisma: PrismaService,
    private actividadesService: ActividadesService,
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

    // Registrar actividad con tipo específico
    const tipoActividad =
      TipoActividad[dto.tipo.toUpperCase()] || TipoActividad.INTERACCION;

    await this.actividadesService.registrar({
      tipo: tipoActividad,
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
