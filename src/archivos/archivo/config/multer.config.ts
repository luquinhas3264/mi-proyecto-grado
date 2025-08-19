import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { BadRequestException } from '@nestjs/common';
import { ARCHIVO_CONFIG } from '../constants/archivo.constants';
import * as mimeTypes from 'mime-types';

// Configuración de almacenamiento
export const multerConfig = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      // Obtener idProyecto de los parámetros de la URL
      const idProyecto = req.params?.idProyecto;
      
      if (!idProyecto) {
        return cb(new BadRequestException('ID del proyecto es requerido'), '');
      }

      // Crear ruta: uploads/proyectos/{idProyecto}
      const uploadPath = join(process.cwd(), ARCHIVO_CONFIG.CARPETA_UPLOADS, idProyecto);
      
      // Crear carpeta si no existe
      if (!existsSync(uploadPath)) {
        mkdirSync(uploadPath, { recursive: true });
      }
      
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      // Generar nombre único: timestamp-original-name.ext
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = extname(file.originalname);
      const nameWithoutExt = file.originalname.replace(ext, '').replace(/[^a-zA-Z0-9]/g, '_');
      
      cb(null, `${uniqueSuffix}-${nameWithoutExt}${ext}`);
    },
  }),
  
  // Filtro de archivos
  fileFilter: (req, file, cb) => {
    try {
      // Validar MIME type
      const mimeType = file.mimetype;
      const extension = mimeTypes.extension(mimeType);
      
      if (!extension) {
        return cb(new BadRequestException('Tipo de archivo no reconocido'), false);
      }
      
      // Verificar que la extensión esté permitida
      if (!ARCHIVO_CONFIG.TIPOS_PERMITIDOS.includes(extension)) {
        return cb(
          new BadRequestException(
            `Tipo de archivo no permitido. Tipos válidos: ${ARCHIVO_CONFIG.TIPOS_PERMITIDOS.join(', ')}`
          ),
          false
        );
      }
      
      // Verificar MIME type específico
      const expectedMimeType = ARCHIVO_CONFIG.MIME_TYPES_PERMITIDOS[extension];
      if (expectedMimeType && mimeType !== expectedMimeType) {
        return cb(
          new BadRequestException('El tipo MIME del archivo no coincide con su extensión'),
          false
        );
      }
      
      cb(null, true);
    } catch (error) {
      cb(new BadRequestException('Error al validar el archivo'), false);
    }
  },
  
  // Límites
  limits: {
    fileSize: ARCHIVO_CONFIG.TAMAÑO_MAX_ARCHIVO, // 50MB
    files: 5, // Máximo 5 archivos por request
  },
};

// Configuración específica para un solo archivo
export const multerConfigSingle = {
  ...multerConfig,
  limits: {
    ...multerConfig.limits,
    files: 1, // Solo un archivo
  },
};

// Función helper para obtener el tipo de archivo desde el MIME type
export const obtenerTipoDesdemime = (mimeType: string): string => {
  const extension = mimeTypes.extension(mimeType);
  return extension || 'unknown';
};