import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { ActividadesService } from 'src/actividades/actividades.service';
import { TipoActividad } from 'src/actividades/enums/tipo-actividad.enum';

@Injectable()
export class ClienteEmpresaService {
  constructor(
    private prisma: PrismaService,
    private actividadesService: ActividadesService,
  ) {}

  async crear(dto: CreateClienteDto, idUsuario: string) {
    const cliente = await this.prisma.clienteEmpresa.create({
      data: {
        ...dto,
      },
    });

    // Registrar actividad
    await this.actividadesService.registrar({
      tipo: TipoActividad.CREACION,
      descripcion: `Se registró el cliente "${dto.razonSocial}"`,
      idUsuario,
      idCliente: cliente.idCliente,
    });

    return cliente;
  }

  async obtenerTodos(etiquetaId?: string, activo?: boolean) {
    return this.prisma.clienteEmpresa.findMany({
      where: {
        ...(typeof activo === 'boolean' && { activo }),
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
    await this.actividadesService.registrar({
      tipo: TipoActividad.EDICION,
      descripcion: `El cliente "${cliente.razonSocial}" fue editado.`,
      idUsuario,
      idCliente: cliente.idCliente,
    });

    return cliente;
  }

  async eliminar(id: string, idUsuario: string) {
    const cliente = await this.prisma.clienteEmpresa.update({
      where: { idCliente: id },
      data: { activo: false },
    });

    // Registrar actividad como cambio de estado (soft delete)
    await this.actividadesService.registrar({
      tipo: TipoActividad.CAMBIO_ESTADO_CLIENTE,
      descripcion: `El estado del cliente "${cliente.razonSocial}" fue cambiado a inactivo.`,
      idUsuario,
      idCliente: cliente.idCliente,
    });

    return cliente;
  }
}
