import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'supersecreto',
    });
  }

  async validate(payload: any) {
  // Buscar el usuario en la base de datos y traer sus permisos y rol
  const usuario = await this.prisma.usuarioInterno.findUnique({
    where: { idUsuario: payload.sub },
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

  if (!usuario) return null;

  const permisos = usuario.rol?.permisos?.map((rp) => ({
    modulo: rp.permiso.modulo,
    accion: rp.permiso.accion,
  })) ?? [];

  return {
    idUsuario: usuario.idUsuario,
    correo: usuario.correo,
    rol: usuario.rol?.nombre,
    permisos,
  };
}
}
