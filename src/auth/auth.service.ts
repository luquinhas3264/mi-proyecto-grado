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

    if (!usuario.activo) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    // Actualizar último acceso
    await this.prisma.usuarioInterno.update({
      where: { idUsuario: usuario.idUsuario },
      data: { ultimoAcceso: new Date() },
    });

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
        fechaRegistro: usuario.fechaRegistro,
        ultimoAcceso: new Date(),
      },
    };
  }  
}
