import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateContactoDto } from './dto/create-contacto.dto';
import { UpdateContactoDto } from './dto/update-contacto.dto';
import { ActividadService } from '../actividad/actividad.service';
import { TipoActividad } from '../actividad/dto/create-actividad.dto';

@Injectable()
export class ContactoClienteService {
  constructor(
    private prisma: PrismaService,
    private actividadService: ActividadService,
  ) {}

  async crear(dto: CreateContactoDto, idUsuario: string) {
    const contacto = await this.prisma.contactoCliente.create({
      data: {
        ...dto,
      },
    });

    // Registrar actividad
    await this.actividadService.registrar({
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
    await this.actividadService.registrar({
      tipo: TipoActividad.EDICION,
      descripcion: `El contacto "${contacto.nombre}" fue editado.`,
      idUsuario,
      idCliente: contacto.idCliente,
    });

    return contacto;
  }

  async eliminar(idContacto: string) {
    return this.prisma.contactoCliente.update({
      where: { idContacto },
      data: { activo: false },
    });
  }
}
