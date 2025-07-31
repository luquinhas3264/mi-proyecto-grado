import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { ActividadService } from '../actividad/actividad.service';
import { TipoActividad } from '../actividad/dto/create-actividad.dto';

@Injectable()
export class ClienteEmpresaService {
  constructor(
    private prisma: PrismaService,
    private actividadService: ActividadService,
  ) {}

  async crear(dto: CreateClienteDto, idUsuario: string) {
    const cliente = await this.prisma.clienteEmpresa.create({
      data: {
        ...dto,
      },
    });

    // Registrar actividad
    await this.actividadService.registrar({
      tipo: TipoActividad.CREACION,
      descripcion: `Se registró el cliente ${dto.razonSocial}`,
      idUsuario,
      idCliente: cliente.idCliente,
    });

    return cliente;
  }

  async obtenerTodos(etiquetaId?: string) {
    return this.prisma.clienteEmpresa.findMany({
      where: {
        activo: true,
        ...(etiquetaId && {
          etiquetas: {
            some: {
              idEtiqueta: etiquetaId,
            },
          },
        }),
      },
      include: {
        etiquetas: { include: { etiqueta: true } },
        contactos: true,
      },
      orderBy: {
        razonSocial: 'asc',
      },
    });
  }

  async obtenerPorId(id: string) {
    const cliente = await this.prisma.clienteEmpresa.findUnique({
      where: { idCliente: id },
      include: {
        contactos: true,
        etiquetas: {
          include: {
            etiqueta: true,
          },
        },
        proyectos: true,
        actividades: true,
      },
    });

    if (!cliente || cliente.activo === false) {
      throw new NotFoundException('Cliente no encontrado');
    }

    return cliente;
  }

  async actualizar(id: string, dto: UpdateClienteDto, idUsuario: string) {
    const cliente = await this.prisma.clienteEmpresa.update({
      where: { idCliente: id },
      data: {
        ...dto,
      },
    });
    
    // Registrar actividad
    await this.actividadService.registrar({
      tipo: TipoActividad.EDICION,
      descripcion: `El cliente "${cliente.razonSocial}" fue editado.`,
      idUsuario,
      idCliente: cliente.idCliente,
    });

    return cliente;
  }

  async eliminar(id: string) {
    return this.prisma.clienteEmpresa.update({
      where: { idCliente: id },
      data: { activo: false },
    });
  }
}
