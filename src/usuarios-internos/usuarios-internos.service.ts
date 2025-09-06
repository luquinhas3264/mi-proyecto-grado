import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { UpdatePerfilDto } from './dto/update-perfil.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuariosInternosService {
  constructor(private prisma: PrismaService) {}

  async crear(dto: CreateUsuarioDto) {
    const contraseñaHash = await bcrypt.hash(dto.contraseña, 10);
    return this.prisma.usuarioInterno.create({
      data: {
        nombre: dto.nombre,
        correo: dto.correo,
        contraseña: contraseñaHash,
        idRol: dto.idRol,
      },
    });
  }

  async findAll() {
    return this.prisma.usuarioInterno.findMany({
      include: { rol: true },
    });
  }

  async findById(id: string) {    
    const usuario = await this.prisma.usuarioInterno.findUnique({
      where: { idUsuario: id },
      include: { rol: true },
    });    
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    return usuario;
  }

  async update(id: string, dto: UpdateUsuarioDto) {
    return this.prisma.usuarioInterno.update({
      where: { idUsuario: id },
      data: {
        nombre: dto.nombre,
        activo: dto.activo,
        idRol: dto.idRol,
      },
    });
  }

  async updatePerfil(idUsuario: string, dto: UpdatePerfilDto) {
    const data: any = {};
    if (dto.nombre) data.nombre = dto.nombre;
    if (dto.nuevaContraseña)
      data.contraseña = await bcrypt.hash(dto.nuevaContraseña, 10);

    return this.prisma.usuarioInterno.update({
      where: { idUsuario },
      data,
      include: { rol: true },
    });
  }
}
