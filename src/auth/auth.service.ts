import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validarCredenciales(correo: string, contraseña: string) {
    const usuario = await this.prisma.usuarioInterno.findUnique({
      where: { correo },
      include: {
        rol: {
          include: {
            permisos: {
              include: { permiso: true },
            },
          },
        },
      },
    });

    if (!usuario || !(await bcrypt.compare(contraseña, usuario.contraseña))) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = {
      sub: usuario.idUsuario,
      correo: usuario.correo,
    };

    const token = this.jwtService.sign(payload);

    const permisos = usuario.rol.permisos.map((rp) => ({
      modulo: rp.permiso.modulo,
      accion: rp.permiso.accion,
    }));

    return {
      accessToken: token,
      usuario: {
        id: usuario.idUsuario,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol.nombre,
        permisos,
      },
    };
  }

  async obtenerPerfil(idUsuario: string) {
    const usuario = await this.prisma.usuarioInterno.findUnique({
      where: { idUsuario },
      include: {
        rol: {
          include: {
            permisos: {
              include: { permiso: true },
            },
          },
        },
      },
    });

    if (!usuario) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    if (!usuario.rol) {
      throw new UnauthorizedException('El usuario no tiene un rol asignado');
    }

    const permisos = Array.isArray(usuario.rol.permisos)
      ? usuario.rol.permisos.map((rp) => ({
          modulo: rp.permiso?.modulo ?? null,
          accion: rp.permiso?.accion ?? null,
        }))
      : [];

    return {
      id: usuario.idUsuario,
      nombre: usuario.nombre,
      correo: usuario.correo,
      rol: usuario.rol.nombre,
      permisos,
    };
  }
}
