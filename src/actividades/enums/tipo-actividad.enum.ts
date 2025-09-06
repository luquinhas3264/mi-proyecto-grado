export enum TipoActividad {
  // Actividades básicas del sistema
  CREACION = 'creacion',
  EDICION = 'edicion',
  ELIMINACION = 'eliminacion',

  // Actividades de interacción
  INTERACCION = 'interaccion',
  COMENTARIO = 'comentario',
  REUNION = 'reunion',
  LLAMADA = 'llamada',
  CORREO = 'correo',

  // Actividades de gestión de clientes  
  CAMBIO_ESTADO_CLIENTE = 'cambio_estado_cliente',

  // Actividades de gestión de contactos
  CAMBIO_ESTADO_CONTACTO = 'cambio_estado_contacto',  

  // Actividades de gestión de proyectos  
  FINALIZACION = 'finalizacion',
  CAMBIO_ESTADO_PROYECTO = 'cambio_estado_proyecto',

  // Actividades de gestión de tareas  
  CAMBIO_ESTADO_TAREA = 'cambio_estado_tarea',
  ASIGNACION = 'asignacion',

  // Actividades de archivos y documentos
  ARCHIVO_SUBIDO = 'archivo_subido',
  ARCHIVO_ELIMINADO = 'archivo_eliminado',
  NOTA_AGREGADA = 'nota_agregada',

  // Genérico
  OTRO = 'otro',
}
