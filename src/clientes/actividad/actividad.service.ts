import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateActividadDto } from './dto/create-actividad.dto';

@Injectable()
export class ActividadService {
  constructor(private prisma: PrismaService) {}

  async registrar(dto: CreateActividadDto) {
    return this.prisma.actividad.create({
      data: {
        tipo: dto.tipo,
        descripcion: dto.descripcion,
        idUsuario: dto.idUsuario,
        idCliente: dto.idCliente,
        idProyecto: dto.idProyecto ?? null,
      },
    });
  }

  async obtenerPorCliente(idCliente: string) {
    return this.prisma.actividad.findMany({
      where: {
        idCliente,
      },
      include: {
        usuario: {
          select: {
            nombre: true,
          },
        },
      },
      orderBy: {
        fecha: 'desc',
      },
    });
  }
}
