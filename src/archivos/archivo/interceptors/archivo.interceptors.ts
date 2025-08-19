import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ARCHIVO_CONFIG } from '../constants/archivo.constants';

@Injectable()
export class ArchivoValidationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const file = request.file;

    // Si no hay archivo, continuar normalmente
    if (!file) {
      return next.handle();
    }

    // Validaciones adicionales
    this.validarArchivo(file);

    return next.handle();
  }

  private validarArchivo(file: Express.Multer.File) {
    // 1. Validar que el archivo no esté vacío
    if (!file.size || file.size === 0) {
      throw new BadRequestException('El archivo está vacío');
    }

    // 2. Validar tamaño (redundante pero por seguridad)
    if (file.size > ARCHIVO_CONFIG.TAMAÑO_MAX_ARCHIVO) {
      throw new BadRequestException(ARCHIVO_CONFIG.ERRORES.ARCHIVO_MUY_GRANDE);
    }

    // 3. Validar nombre del archivo
    if (!file.originalname || file.originalname.trim() === '') {
      throw new BadRequestException('El archivo debe tener un nombre válido');
    }

    // 4. Validar caracteres peligrosos en el nombre
    const nombrePeligroso = /[<>:"/\\|?*\x00-\x1f]/g;
    if (nombrePeligroso.test(file.originalname)) {
      throw new BadRequestException('El nombre del archivo contiene caracteres no permitidos');
    }

    // 5. Validar longitud del nombre
    if (file.originalname.length > 255) {
      throw new BadRequestException('El nombre del archivo es demasiado largo');
    }
  }
}