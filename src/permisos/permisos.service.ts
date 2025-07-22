import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePermisoDto } from './dto/create-permiso.dto';

@Injectable()
export class PermisosService {
  constructor(private prisma: PrismaService) {}

  async listar() {
    return this.prisma.permiso.findMany();
  }

  async crear(dto: CreatePermisoDto) {
    const existe = await this.prisma.permiso.findUnique({
      where: {
        modulo_accion: {
          modulo: dto.modulo,
          accion: dto.accion,
        },
      },
    });

    if (existe) {
      throw new ConflictException('Permiso ya existe');
    }

    return this.prisma.permiso.create({
      data: dto,
    });
  }
}
