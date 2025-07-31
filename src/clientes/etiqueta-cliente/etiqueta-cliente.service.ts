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

  async obtenerTodas() {
    return this.prisma.etiquetaCliente.findMany();
  }

  async actualizar(idEtiqueta: string, dto: UpdateEtiquetaDto) {
    return this.prisma.etiquetaCliente.update({
      where: { idEtiqueta },
      data: dto,
    });
  }

  async eliminar(idEtiqueta: string) {
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
