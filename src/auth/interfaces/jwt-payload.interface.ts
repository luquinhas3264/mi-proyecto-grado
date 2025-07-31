export interface JwtPayload {
  idUsuario: string;
  correo: string;
  rol: string;
  permisos: {
    modulo: string;
    accion: string;
  }[];
}