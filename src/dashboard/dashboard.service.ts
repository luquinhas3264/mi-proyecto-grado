
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DashboardProyectosDto, EstadisticasProyectosDto, ProyectoResumenDto } from './dto/dashboard-proyectos.dto';
import { EstadoProyecto } from '../proyectos/proyecto/enums/estado-proyecto.enum';
import { FiltrosProyectosDto, FiltrosClientesDto, FiltrosActividadesDto } from './dto/filtros-dashboard.dto';
import { ActividadRecenteDto } from './dto/actividades-recientes.dto';
import { TipoActividad } from '../actividades/enums/tipo-actividad.enum';
import { DashboardClientesDto, EstadisticasClientesDto, ClienteResumenDto } from './dto/dashboard-clientes.dto';
import { DetalleProyectoDto, TareaResumenDto, NotaProyectoDto } from './dto/detalle-proyecto.dto';
import { EstadoTarea } from '../tareas/tarea/enums/estado-tarea.enum';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  // UC1 - Visualizar Resumen General de Proyectos
  async obtenerResumenProyectos(filtros: FiltrosProyectosDto): Promise<DashboardProyectosDto> {
    // Construir condiciones dinámicas según filtros
    const where: any = { activo: true };
    if (filtros.idCliente) where.idCliente = filtros.idCliente;
    if (filtros.estado) where.estado = filtros.estado;
    if (filtros.fechaInicio || filtros.fechaFin) {
      where.fechaInicio = {};
      if (filtros.fechaInicio) where.fechaInicio.gte = new Date(filtros.fechaInicio);
      if (filtros.fechaFin) where.fechaInicio.lte = new Date(filtros.fechaFin);
    }

    // Obtener proyectos según filtros básicos
    let proyectos = await this.prisma.proyecto.findMany({
      where,
      include: {
        cliente: true,
        tareas: true,
      },
    });

    // Filtros adicionales en memoria (atrasados, próximos a vencer)
    const hoy = new Date();
    const sieteDias = 1000 * 60 * 60 * 24 * 7;
    if (filtros.soloAtrasados) {
      proyectos = proyectos.filter(proy => {
        if (!proy.fechaFin || proy.estado === EstadoProyecto.FINALIZADO) return false;
        const diasRestantes = Math.ceil((proy.fechaFin.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
        return diasRestantes < 0;
      });
    }
    if (filtros.proximosAVencer) {
      proyectos = proyectos.filter(proy => {
        if (!proy.fechaFin || proy.estado === EstadoProyecto.FINALIZADO) return false;
        const diasRestantes = Math.ceil((proy.fechaFin.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
        return diasRestantes <= 7 && diasRestantes >= 0;
      });
    }

    // Estadísticas generales
    const total = proyectos.length;
    const porEstado = {
      [EstadoProyecto.PLANEADO]: 0,
      [EstadoProyecto.EN_PROGRESO]: 0,
      [EstadoProyecto.FINALIZADO]: 0,
    };
    let proximosAVencer = 0;
    let atrasados = 0;
    let sumaProgreso = 0;

    const proyectosResumen: ProyectoResumenDto[] = proyectos.map((proy) => {
      // Estadísticas de tareas
      const totalTareas = proy.tareas.length;
      const completadas = proy.tareas.filter(t => t.estado === 'COMPLETADA').length;
      const pendientes = proy.tareas.filter(t => t.estado === 'PENDIENTE').length;
      const enProgreso = proy.tareas.filter(t => t.estado === 'EN_PROGRESO').length;
      // Progreso
      const porcentajeProgreso = totalTareas > 0 ? Math.round((completadas / totalTareas) * 100) : 0;
      sumaProgreso += porcentajeProgreso;
      // Estado
      porEstado[proy.estado as EstadoProyecto]++;
      // Fechas
      let diasRestantes: number | null = null;
      let estaAtrasado = false;
      if (proy.fechaFin) {
        const diff = (proy.fechaFin.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24);
        diasRestantes = Math.ceil(diff);
        if (diasRestantes < 0 && proy.estado !== EstadoProyecto.FINALIZADO) {
          atrasados++;
          estaAtrasado = true;
        }
        if (diasRestantes <= 7 && diasRestantes >= 0 && proy.estado !== EstadoProyecto.FINALIZADO) {
          proximosAVencer++;
        }
      }
      return {
        idProyecto: proy.idProyecto,
        nombre: proy.nombre,
        descripcion: proy.descripcion === null ? undefined : proy.descripcion,
        estado: proy.estado as EstadoProyecto,
        fechaInicio: proy.fechaInicio,
        fechaFin: proy.fechaFin === null ? undefined : proy.fechaFin,
        diasRestantes,
        estaAtrasado,
        porcentajeProgreso,
        cliente: {
          idCliente: proy.cliente.idCliente,
          razonSocial: proy.cliente.razonSocial,
          rubro: proy.cliente.rubro,
        },
        tareas: {
          total: totalTareas,
          completadas,
          pendientes,
          enProgreso,
        },
      };
    });

    const progresoPromedio = total > 0 ? Math.round(sumaProgreso / total) : 0;

    const estadisticas: EstadisticasProyectosDto = {
      total,
      porEstado,
      proximosAVencer,
      atrasados,
      progresoPromedio,
    };

    return {
      estadisticas,
      proyectos: proyectosResumen,
    };
  }

  // UC5 - Visualizar Listado de Clientes  
  async obtenerResumenClientes(filtros: FiltrosClientesDto): Promise<DashboardClientesDto> {
    // Construir condiciones dinámicas según filtros
    const where: any = { activo: true };
    if (filtros.rubro) where.rubro = filtros.rubro;
    if (filtros.busqueda) where.razonSocial = { contains: filtros.busqueda, mode: 'insensitive' };

    // Obtener clientes y relaciones
    let clientes = await this.prisma.clienteEmpresa.findMany({
      where,
      include: {
        etiquetas: { include: { etiqueta: true } },
        contactos: { include: { interacciones: true } },
        proyectos: true,
        actividades: true,
      },
    });

    // Filtros adicionales en memoria
    if (filtros.idEtiqueta) {
      clientes = clientes.filter(c => c.etiquetas.some(e => e.idEtiqueta === filtros.idEtiqueta));
    }
    if (filtros.conProyectosActivos) {
      clientes = clientes.filter(c => c.proyectos.some(p => p.activo));
    }
    if (filtros.sinProyectos) {
      clientes = clientes.filter(c => c.proyectos.length === 0);
    }

    // Estadísticas generales
    const total = clientes.length;
    const porRubro: Record<string, number> = {};
    let conProyectosActivos = 0;
    let sinProyectos = 0;
    let nuevosEsteMes = 0;
    const hoy = new Date();
    const mesActual = hoy.getMonth();
    const anioActual = hoy.getFullYear();

    clientes.forEach(c => {
      porRubro[c.rubro] = (porRubro[c.rubro] || 0) + 1;
      if (c.proyectos.some(p => p.activo)) conProyectosActivos++;
      if (c.proyectos.length === 0) sinProyectos++;
      // Fecha de creación: primera actividad registrada
      if (c.actividades && c.actividades.length > 0) {
        const fechaCreacion = new Date(c.actividades[0].fecha);
        if (fechaCreacion.getMonth() === mesActual && fechaCreacion.getFullYear() === anioActual) {
          nuevosEsteMes++;
        }
      }
    });

    const clientesResumen: ClienteResumenDto[] = clientes.map(c => {
      // Etiquetas
      const etiquetas = c.etiquetas.map(e => ({ idEtiqueta: e.etiqueta.idEtiqueta, nombre: e.etiqueta.nombre }));
      // Última interacción: buscar la más reciente entre todos los contactos
      let ultimaInteraccion: any = null;
      const interacciones: any[] = c.contactos.flatMap((contacto: any) => contacto.interacciones || []);
      if (interacciones.length > 0) {
        ultimaInteraccion = interacciones.reduce((a, b) => new Date(a.fecha) > new Date(b.fecha) ? a : b);
      }
      // Última actividad: usar actividades del cliente
      let ultimaActividad: any = null;
      if (c.actividades && c.actividades.length > 0) {
        ultimaActividad = c.actividades.reduce((a, b) => new Date(a.fecha) > new Date(b.fecha) ? a : b);
      }
      // Proyectos
      const totalProyectos = c.proyectos.length;
      const activos = c.proyectos.filter(p => p.activo && p.estado !== 'FINALIZADO').length;
      const finalizados = c.proyectos.filter(p => p.estado === 'FINALIZADO').length;
      return {
        idCliente: c.idCliente,
        razonSocial: c.razonSocial,
        rubro: c.rubro,
        correo: c.correo,
        telefono: c.telefono,
        etiquetas,
        totalContactos: c.contactos.length,
        proyectos: {
          total: totalProyectos,
          activos,
          finalizados,
        },
        ultimaInteraccion: (ultimaInteraccion && ultimaInteraccion.fecha && ultimaInteraccion.tipo && ultimaInteraccion.descripcion) ? {
          fecha: ultimaInteraccion.fecha,
          tipo: ultimaInteraccion.tipo,
          descripcion: ultimaInteraccion.descripcion,
        } : null,
        ultimaActividad: (ultimaActividad && ultimaActividad.fecha && ultimaActividad.tipo && ultimaActividad.descripcion) ? {
          fecha: ultimaActividad.fecha,
          tipo: ultimaActividad.tipo,
          descripcion: ultimaActividad.descripcion,
        } : null,
      };
    });

    const estadisticas: EstadisticasClientesDto = {
      total,
      porRubro,
      conProyectosActivos,
      sinProyectos,
      nuevosEsteMes,
    };

    return {
      estadisticas,
      clientes: clientesResumen,
    };
  }

  // UC7 - Visualizar Actividades Recientes
  async obtenerActividadesRecientes(filtros: FiltrosActividadesDto): Promise<ActividadRecenteDto[]> {
    // Construir condiciones dinámicas según filtros
    const where: any = {};
    if (filtros.idCliente) where.idCliente = filtros.idCliente;
    if (filtros.idProyecto) where.idProyecto = filtros.idProyecto;
    if (filtros.idUsuario) where.idUsuario = filtros.idUsuario;
    if (filtros.fechaDesde) where.fecha = { gte: new Date(filtros.fechaDesde) };

    const actividades = await this.prisma.actividad.findMany({
      where,
      orderBy: { fecha: 'desc' },
      take: filtros.limite || 20,
      include: {
        usuario: { select: { idUsuario: true, nombre: true } },
        cliente: { select: { idCliente: true, razonSocial: true } },
        proyecto: { select: { idProyecto: true, nombre: true } },
      },
    });

    // Mapear a DTO
    return actividades.map(act => {
      // Calcular tiempo transcurrido en formato legible
      const ahora = new Date();
      const diffMs = ahora.getTime() - act.fecha.getTime();
      const diffMin = Math.floor(diffMs / 60000);
      let tiempoTranscurrido = '';
      if (diffMin < 60) {
        tiempoTranscurrido = `${diffMin} min`;
      } else if (diffMin < 1440) {
        tiempoTranscurrido = `${Math.floor(diffMin / 60)} h`;
      } else {
        tiempoTranscurrido = `${Math.floor(diffMin / 1440)} d`;
      }
      return {
        idActividad: act.idActividad,
        fecha: act.fecha,
        tipo: act.tipo as TipoActividad,
        descripcion: act.descripcion,
        usuario: act.usuario
          ? { idUsuario: act.usuario.idUsuario, nombre: act.usuario.nombre }
          : { idUsuario: '', nombre: '' },
        cliente: act.cliente
          ? { idCliente: act.cliente.idCliente, razonSocial: act.cliente.razonSocial }
          : { idCliente: '', razonSocial: '' },
        proyecto: act.proyecto
          ? { idProyecto: act.proyecto.idProyecto, nombre: act.proyecto.nombre }
          : null,
        tiempoTranscurrido,
      };
    });
  }

  // UC4 - Ver Detalles Resumidos de un Proyecto
  async obtenerDetalleProyecto(idProyecto: string): Promise<DetalleProyectoDto> {
    // Buscar proyecto con cliente, tareas, notas y actividades
    const proyecto = await this.prisma.proyecto.findUnique({
      where: { idProyecto },
      include: {
        cliente: true,
        tareas: { include: { usuarioResponsable: true } },
        notas: true,
        actividades: {
          include: {
            usuario: { select: { idUsuario: true, nombre: true } },
            cliente: { select: { idCliente: true, razonSocial: true } },
            proyecto: { select: { idProyecto: true, nombre: true } },
          },
          orderBy: { fecha: 'desc' },
          take: 10,
        },
      },
    });
    if (!proyecto) throw new Error('Proyecto no encontrado');

    // Información básica
    const infoProyecto = {
      idProyecto: proyecto.idProyecto,
      nombre: proyecto.nombre,
      descripcion: proyecto.descripcion === null ? undefined : proyecto.descripcion,
      estado: proyecto.estado as EstadoProyecto,
      fechaInicio: proyecto.fechaInicio,
      fechaFin: proyecto.fechaFin === null ? undefined : proyecto.fechaFin,
      creadoEn: proyecto.creadoEn,
      actualizadoEn: proyecto.actualizadoEn,
    };

    // Cliente
    const infoCliente = {
      idCliente: proyecto.cliente.idCliente,
      razonSocial: proyecto.cliente.razonSocial,
      rubro: proyecto.cliente.rubro,
      correo: proyecto.cliente.correo,
      telefono: proyecto.cliente.telefono,
    };

    // Estado temporal
    let diasRestantes: number | null = null;
    let estaAtrasado = false;
    if (proyecto.fechaFin) {
      const diff = (proyecto.fechaFin.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
      diasRestantes = Math.ceil(diff);
      if (diasRestantes < 0 && proyecto.estado !== EstadoProyecto.FINALIZADO) {
        estaAtrasado = true;
      }
    }
    // Progreso
    const totalTareas = proyecto.tareas.length;
    const completadas = proyecto.tareas.filter(t => t.estado === 'COMPLETADA').length;
    const porcentajeProgreso = totalTareas > 0 ? Math.round((completadas / totalTareas) * 100) : 0;
    // Fase actual
    let faseActual = '';
    switch (proyecto.estado) {
      case EstadoProyecto.PLANEADO:
        faseActual = 'Planeación';
        break;
      case EstadoProyecto.EN_PROGRESO:
        faseActual = 'Ejecución';
        break;
      case EstadoProyecto.FINALIZADO:
        faseActual = 'Finalizado';
        break;
      default:
        faseActual = '';
    }

    // Estadísticas de tareas
    const porEstado = {
      [EstadoTarea.PENDIENTE]: proyecto.tareas.filter(t => t.estado === 'PENDIENTE').length,
      [EstadoTarea.EN_PROGRESO]: proyecto.tareas.filter(t => t.estado === 'EN_PROGRESO').length,
      [EstadoTarea.COMPLETADA]: completadas,
    };
    const vencidas = proyecto.tareas.filter(t => t.fechaLimite && t.estado !== 'COMPLETADA' && t.fechaLimite < new Date()).length;
    const proximasAVencer = proyecto.tareas.filter(t => t.fechaLimite && t.estado !== 'COMPLETADA' && t.fechaLimite >= new Date() && (t.fechaLimite.getTime() - new Date().getTime())/(1000*60*60*24) <= 3).length;

    const estadisticasTareas = {
      total: totalTareas,
      porEstado,
      vencidas,
      proximasAVencer,
      porcentajeProgreso,
    };

    // Tareas críticas (vencidas o próximas a vencer)
    const tareasCriticas: TareaResumenDto[] = proyecto.tareas
      .filter(t => (t.fechaLimite && t.estado !== 'COMPLETADA' && (t.fechaLimite < new Date() || ((t.fechaLimite.getTime() - new Date().getTime())/(1000*60*60*24) <= 3 && t.fechaLimite >= new Date()))))
      .map(t => ({
        idTarea: t.idTarea,
        nombre: t.nombre,
        estado: t.estado as EstadoTarea,
        fechaLimite: t.fechaLimite === null ? undefined : t.fechaLimite,
        usuarioResponsable: t.usuarioResponsable
          ? { idUsuario: t.usuarioResponsable.idUsuario, nombre: t.usuarioResponsable.nombre }
          : null,
        estaVencida: t.fechaLimite ? t.fechaLimite < new Date() && t.estado !== 'COMPLETADA' : false,
        diasRestantes: t.fechaLimite ? Math.ceil((t.fechaLimite.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null,
      }));

    // Actividades recientes (ya traídas en el include)
    const actividadesRecientes = proyecto.actividades.map(act => {
      // Calcular tiempo transcurrido
      const ahora = new Date();
      const diffMs = ahora.getTime() - act.fecha.getTime();
      const diffMin = Math.floor(diffMs / 60000);
      let tiempoTranscurrido = '';
      if (diffMin < 60) {
        tiempoTranscurrido = `${diffMin} min`;
      } else if (diffMin < 1440) {
        tiempoTranscurrido = `${Math.floor(diffMin / 60)} h`;
      } else {
        tiempoTranscurrido = `${Math.floor(diffMin / 1440)} d`;
      }
      return {
        idActividad: act.idActividad,
        fecha: act.fecha,
        tipo: act.tipo as TipoActividad,
        descripcion: act.descripcion,
        usuario: act.usuario
          ? { idUsuario: act.usuario.idUsuario, nombre: act.usuario.nombre }
          : { idUsuario: '', nombre: '' },
        cliente: act.cliente
          ? { idCliente: act.cliente.idCliente, razonSocial: act.cliente.razonSocial }
          : { idCliente: '', razonSocial: '' },
        proyecto: act.proyecto
          ? { idProyecto: act.proyecto.idProyecto, nombre: act.proyecto.nombre }
          : null,
        tiempoTranscurrido,
      };
    });

    // Notas recientes (últimas 5)
    const notasRecientes: NotaProyectoDto[] = proyecto.notas
      .sort((a, b) => b.fecha.getTime() - a.fecha.getTime())
      .slice(0, 5)
      .map(n => ({
        idNota: n.idNota,
        contenido: n.contenido,
        fecha: n.fecha,
      }));

    return {
      proyecto: infoProyecto,
      cliente: infoCliente,
      estado: {
        diasRestantes,
        estaAtrasado,
        porcentajeProgreso,
        faseActual,
      },
      tareas: estadisticasTareas,
      tareasCriticas,
      actividadesRecientes,
      notasRecientes,
    };
  }
}