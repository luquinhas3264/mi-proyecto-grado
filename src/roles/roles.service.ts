import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async crear(dto: CreateRolDto) {
    return this.prisma.rol.create({ data: dto });
  }

  async listar() {
    return this.prisma.rol.findMany();
  }

  async obtener(idRol: string) {
    const rol = await this.prisma.rol.findUnique({
      where: { idRol },
      include: {
        permisos: {
          include: { permiso: true },
        },
      },
    });
    if (!rol) throw new NotFoundException('Rol no encontrado');
    return rol;
  }

  async actualizar(idRol: string, dto: UpdateRolDto) {
    return this.prisma.rol.update({
      where: { idRol },
      data: dto,
    });
  }

  async eliminar(idRol: string) {
    const usuariosConEsteRol = await this.prisma.usuarioInterno.findMany({
      where: { idRol },
    });

    if (usuariosConEsteRol.length > 0) {
      throw new BadRequestException(
        'No se puede eliminar un rol que está asignado a usuarios.',
      );
    }

    // eliminar relaciones de permisos (limpieza segura)
    await this.prisma.rolPermiso.deleteMany({
      where: { idRol },
    });

    return this.prisma.rol.delete({
      where: { idRol },
    });
  }

  async asignarPermisos(idRol: string, permisosIds: string[]) {
    const rol = await this.prisma.rol.findUnique({ where: { idRol } });
    if (!rol) throw new NotFoundException('Rol no encontrado');

    // Eliminar todos los permisos actuales
    await this.prisma.rolPermiso.deleteMany({
      where: { idRol },
    });

    // Crear nuevas relaciones
    const nuevasRelaciones = permisosIds.map((idPermiso) => ({
      idRol,
      idPermiso,
    }));

    return this.prisma.rolPermiso.createMany({
      data: nuevasRelaciones,
      skipDuplicates: true,
    });
  }
}
