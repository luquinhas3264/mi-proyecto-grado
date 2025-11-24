import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEtiquetaDto } from './dto/create-etiqueta.dto';
import { UpdateEtiquetaDto } from './dto/update-etiqueta.dto';

@Injectable()
export class EtiquetaClienteService {
  constructor(private prisma: PrismaService) {}

  async crear(dto: CreateEtiquetaDto) {
    return this.prisma.etiquetaCliente.create({ data: dto });
  }

  async obtenerTodos() {
    const etiquetas = await this.prisma.etiquetaCliente.findMany({
      include: {
        clientes: true,
      },
    });
    return etiquetas.map((e) => ({
      ...e,
      totalClientes: e.clientes.length,
    }));
  }

  async actualizar(idEtiqueta: string, dto: UpdateEtiquetaDto) {
    return this.prisma.etiquetaCliente.update({
      where: { idEtiqueta },
      data: dto,
    });
  }

  async eliminar(idEtiqueta: string) {
    const asignaciones = await this.prisma.clienteEtiqueta.count({
      where: { idEtiqueta },
    });
    if (asignaciones > 0) {
      throw new Error(
        'No se puede eliminar la etiqueta porque tiene clientes asignados',
      );
    }
    return this.prisma.etiquetaCliente.delete({
      where: { idEtiqueta },
    });
  }

  async asignarEtiqueta(idCliente: string, idEtiqueta: string) {
    return this.prisma.clienteEtiqueta.create({
      data: {
        idCliente,
        idEtiqueta,
      },
    });
  }

  async removerEtiqueta(idCliente: string, idEtiqueta: string) {
    return this.prisma.clienteEtiqueta.delete({
      where: {
        idCliente_idEtiqueta: {
          idCliente,
          idEtiqueta,
        },
      },
    });
  }
}
