import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISO_KEY, PermisoMeta } from '../decorators/permiso.decorator';

@Injectable()
export class PermisosGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermiso = this.reflector.get<PermisoMeta>(
      PERMISO_KEY,
      context.getHandler(),
    );

    if (!requiredPermiso) return true; // No se requiere permiso explícito

    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.permisos) {
      throw new ForbiddenException('Permisos no disponibles');
    }

    const tienePermiso = user.permisos.some(
      (permiso: { modulo: string; accion: string; }) =>
        permiso.modulo === requiredPermiso.modulo &&
        permiso.accion === requiredPermiso.accion,
    );

    if (!tienePermiso) {
      throw new ForbiddenException('Acceso denegado: permiso insuficiente');
    }

    return true;
  }
}
