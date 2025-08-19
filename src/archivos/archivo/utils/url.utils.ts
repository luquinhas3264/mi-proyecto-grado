import { BadRequestException } from '@nestjs/common';

export class UrlUtils {
  // Dominios conocidos y seguros
  private static readonly DOMINIOS_SEGUROS = [
    'drive.google.com',
    'docs.google.com',
    'sheets.google.com',
    'slides.google.com',
    'dropbox.com',
    'onedrive.live.com',
    'sharepoint.com',
    'box.com',
    'figma.com',
    'canva.com',
    'adobe.com',
    'wetransfer.com',
    'github.com',
    'gitlab.com',
    'bitbucket.org',
  ];

  // Patrones de URLs maliciosas o no deseadas
  private static readonly PATRONES_PROHIBIDOS = [
    /javascript:/i,
    /data:/i,
    /vbscript:/i,
    /file:/i,
    /ftp:/i,
  ];

  /**
   * Valida si una URL es segura y válida
   */
  static validarUrl(url: string): { esValida: boolean; dominio: string; tipo: string } {
    try {
      // Limpiar la URL
      const urlLimpia = url.trim();
      
      // Verificar que no esté vacía
      if (!urlLimpia) {
        throw new BadRequestException('La URL no puede estar vacía');
      }

      // Crear objeto URL para validación
      const urlObj = new URL(urlLimpia);
      
      // Validar protocolo (solo HTTP/HTTPS)
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        throw new BadRequestException('Solo se permiten URLs con protocolo HTTP o HTTPS');
      }

      // Verificar patrones prohibidos
      const tienePatronProhibido = this.PATRONES_PROHIBIDOS.some(patron => 
        patron.test(urlLimpia)
      );
      
      if (tienePatronProhibido) {
        throw new BadRequestException('La URL contiene elementos no permitidos');
      }

      // Obtener dominio
      const dominio = urlObj.hostname.toLowerCase();
      
      // Verificar que no sea localhost o IP privada
      if (this.esUrlLocal(dominio)) {
        throw new BadRequestException('No se permiten URLs locales o privadas');
      }

      // Determinar tipo de servicio
      const tipoServicio = this.determinarTipoServicio(dominio);

      return {
        esValida: true,
        dominio,
        tipo: tipoServicio,
      };

    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('La URL proporcionada no es válida');
    }
  }

  /**
   * Normaliza una URL para almacenamiento
   */
  static normalizarUrl(url: string): string {
    try {
      const urlObj = new URL(url.trim());
      
      // Remover fragmentos (#) y parámetros de tracking comunes
      urlObj.hash = '';
      
      // Remover parámetros de tracking conocidos
      const parametrosTracking = [
        'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
        'fbclid', 'gclid', 'msclkid', '_ga', '_gid'
      ];
      
      parametrosTracking.forEach(param => {
        urlObj.searchParams.delete(param);
      });
      
      return urlObj.toString();
    } catch {
      return url; // Si no se puede normalizar, devolver original
    }
  }

  /**
   * Extrae metadatos básicos de una URL
   */
  static extraerMetadatos(url: string): {
    nombre: string;
    descripcionSugerida: string;
    icono: string;
  } {
    try {
      const urlObj = new URL(url);
      const dominio = urlObj.hostname.toLowerCase();
      const pathname = urlObj.pathname;
      
      // Generar nombre basado en el servicio
      let nombre = '';
      let descripcionSugerida = '';
      let icono = '🔗';

      if (dominio.includes('drive.google.com')) {
        nombre = 'Carpeta de Google Drive';
        descripcionSugerida = 'Carpeta compartida de Google Drive';
        icono = '📁';
      } else if (dominio.includes('docs.google.com')) {
        nombre = 'Documento de Google';
        descripcionSugerida = 'Documento colaborativo de Google';
        icono = '📄';
      } else if (dominio.includes('sheets.google.com')) {
        nombre = 'Hoja de cálculo de Google';
        descripcionSugerida = 'Hoja de cálculo colaborativa';
        icono = '📊';
      } else if (dominio.includes('slides.google.com')) {
        nombre = 'Presentación de Google';
        descripcionSugerida = 'Presentación colaborativa';
        icono = '📽️';
      } else if (dominio.includes('dropbox.com')) {
        nombre = 'Enlace de Dropbox';
        descripcionSugerida = 'Archivo o carpeta compartida en Dropbox';
        icono = '📦';
      } else if (dominio.includes('figma.com')) {
        nombre = 'Proyecto de Figma';
        descripcionSugerida = 'Diseño colaborativo en Figma';
        icono = '🎨';
      } else if (dominio.includes('canva.com')) {
        nombre = 'Diseño de Canva';
        descripcionSugerida = 'Diseño creado en Canva';
        icono = '🎨';
      } else {
        // Intentar extraer nombre del path
        const segments = pathname.split('/').filter(s => s);
        const lastSegment = segments[segments.length - 1];
        
        if (lastSegment) {
          nombre = decodeURIComponent(lastSegment)
            .replace(/[-_]/g, ' ')
            .replace(/\.[^/.]+$/, '') // Remover extensión
            .substring(0, 50); // Limitar longitud
        } else {
          nombre = `Enlace de ${dominio}`;
        }
        
        descripcionSugerida = `Recurso externo de ${dominio}`;
      }

      return {
        nombre: nombre || `Enlace externo`,
        descripcionSugerida,
        icono,
      };

    } catch {
      return {
        nombre: 'Enlace externo',
        descripcionSugerida: 'Recurso externo',
        icono: '🔗',
      };
    }
  }

  /**
   * Verifica si es una URL local o privada
   */
  private static esUrlLocal(hostname: string): boolean {
    // IPs locales
    const ipLocal = /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|::1|0:0:0:0:0:0:0:1)/i;
    
    // Dominios locales
    const dominioLocal = /^(localhost|.*\.local|.*\.internal)$/i;
    
    return ipLocal.test(hostname) || dominioLocal.test(hostname);
  }

  /**
   * Determina el tipo de servicio basado en el dominio
   */
  private static determinarTipoServicio(dominio: string): string {
    if (dominio.includes('google.com')) return 'google';
    if (dominio.includes('dropbox.com')) return 'dropbox';
    if (dominio.includes('onedrive') || dominio.includes('sharepoint')) return 'microsoft';
    if (dominio.includes('box.com')) return 'box';
    if (dominio.includes('figma.com')) return 'figma';
    if (dominio.includes('canva.com')) return 'canva';
    if (dominio.includes('adobe.com')) return 'adobe';
    if (dominio.includes('github.com')) return 'github';
    if (dominio.includes('gitlab.com')) return 'gitlab';
    
    return 'externo';
  }

  /**
   * Verifica si un dominio está en la lista de dominios seguros
   */
  static esDominioSeguro(url: string): boolean {
    try {
      const urlObj = new URL(url);
      const dominio = urlObj.hostname.toLowerCase();
      
      return this.DOMINIOS_SEGUROS.some(dominioSeguro => 
        dominio === dominioSeguro || dominio.endsWith(`.${dominioSeguro}`)
      );
    } catch {
      return false;
    }
  }
}