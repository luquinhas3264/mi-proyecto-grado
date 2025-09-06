import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateContactoDto } from './dto/create-contacto.dto';
import { UpdateContactoDto } from './dto/update-contacto.dto';
import { ActividadesService } from 'src/actividades/actividades.service';
import { TipoActividad } from 'src/actividades/enums/tipo-actividad.enum';

@Injectable()
export class ContactoClienteService {
  constructor(
    private prisma: PrismaService,
    private actividadesService: ActividadesService,
  ) {}

  async crear(dto: CreateContactoDto, idUsuario: string) {
    const contacto = await this.prisma.contactoCliente.create({
      data: {
        ...dto,
      },
    });

    // Registrar actividad
    await this.actividadesService.registrar({
      tipo: TipoActividad.CREACION,
      descripcion: `Se registró al contacto "${contacto.nombre}" en el cliente.`,
      idUsuario,
      idCliente: contacto.idCliente,
    });

    return contacto;
  }

  async obtenerPorCliente(idCliente: string) {
    return this.prisma.contactoCliente.findMany({
      where: {
        idCliente,
        activo: true,
      },
    });
  }

  async obtenerPorId(idContacto: string) {
    const contacto = await this.prisma.contactoCliente.findUnique({
      where: { idContacto },
    });

    if (!contacto || contacto.activo === false) {
      throw new NotFoundException('Contacto no encontrado');
    }

    return contacto;
  }

  async actualizar(idContacto: string, dto: UpdateContactoDto, idUsuario: string) {
    const contacto = await this.prisma.contactoCliente.update({
      where: { idContacto },
      data: {
        ...dto,
      },
    });
    
    // Registrar actividad
    await this.actividadesService.registrar({
      tipo: TipoActividad.EDICION,
      descripcion: `El contacto "${contacto.nombre}" fue editado.`,
      idUsuario,
      idCliente: contacto.idCliente,
    });

    return contacto;
  }

  async eliminar(idContacto: string, idUsuario: string) {
    const contacto = await this.prisma.contactoCliente.update({
      where: { idContacto },
      data: { activo: false },
    });

    // Registrar actividad como cambio de estado (soft delete)
    await this.actividadesService.registrar({
      tipo: TipoActividad.CAMBIO_ESTADO_CONTACTO,
      descripcion: `El estado del contacto "${contacto.nombre}" fue cambiado a inactivo.`,
      idUsuario,
      idCliente: contacto.idCliente,
    });

    return contacto;
  }
}
