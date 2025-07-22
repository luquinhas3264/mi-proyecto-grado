import { SetMetadata } from '@nestjs/common';

export const PERMISO_KEY = 'permiso';

export interface PermisoMeta {
  modulo: string;
  accion: string;
}

export const Permiso = (modulo: string, accion: string) =>
  SetMetadata(PERMISO_KEY, { modulo, accion });
