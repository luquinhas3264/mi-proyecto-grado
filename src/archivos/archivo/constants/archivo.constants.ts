export const ARCHIVO_CONFIG = {
  // Tamaños en bytes
  TAMAÑO_MAX_ARCHIVO: 50 * 1024 * 1024, // 50MB por archivo
  TAMAÑO_MAX_PROYECTO: 500 * 1024 * 1024, // 500MB total por proyecto
  
  // Cantidad máxima de archivos por proyecto
  CANTIDAD_MAX_ARCHIVOS: 100,
  
  // Tipos de archivo permitidos
  TIPOS_PERMITIDOS: [
    'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
    'jpg', 'jpeg', 'png', 'gif', 'bmp',
    'zip', 'rar', 'txt', 'url'
  ],
  
  // MIME types para validación de subida
  MIME_TYPES_PERMITIDOS: {
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'ppt': 'application/vnd.ms-powerpoint',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'bmp': 'image/bmp',
    'zip': 'application/zip',
    'rar': 'application/x-rar-compressed',
    'txt': 'text/plain',
  },
  
  // Rutas de almacenamiento
  CARPETA_UPLOADS: 'uploads/proyectos',
  
  // Mensajes de error
  ERRORES: {
    ARCHIVO_MUY_GRANDE: 'El archivo excede el tamaño máximo permitido (50MB)',
    TIPO_NO_PERMITIDO: 'Tipo de archivo no permitido',
    LIMITE_CANTIDAD: 'Se ha alcanzado el límite de archivos por proyecto (100)',
    LIMITE_ESPACIO: 'Se ha alcanzado el límite de espacio por proyecto (500MB)',
    PROYECTO_NO_ENCONTRADO: 'Proyecto no encontrado',
    ARCHIVO_NO_ENCONTRADO: 'Archivo no encontrado',
    SIN_PERMISOS_ELIMINAR: 'No tienes permisos para eliminar este archivo',
    URL_INVALIDA: 'La URL proporcionada no es válida',
  }
};

// Extensiones por categoría (útil para el frontend)
export const CATEGORIAS_ARCHIVO = {
  DOCUMENTOS: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'],
  IMAGENES: ['jpg', 'jpeg', 'png', 'gif', 'bmp'],
  COMPRIMIDOS: ['zip', 'rar'],
  ENLACES: ['url']
};

// Helpers para obtener categoría
export const obtenerCategoriaArchivo = (tipo: string): string => {
  if (CATEGORIAS_ARCHIVO.DOCUMENTOS.includes(tipo.toLowerCase())) return 'documento';
  if (CATEGORIAS_ARCHIVO.IMAGENES.includes(tipo.toLowerCase())) return 'imagen';
  if (CATEGORIAS_ARCHIVO.COMPRIMIDOS.includes(tipo.toLowerCase())) return 'comprimido';
  if (CATEGORIAS_ARCHIVO.ENLACES.includes(tipo.toLowerCase())) return 'enlace';
  return 'otro';
};