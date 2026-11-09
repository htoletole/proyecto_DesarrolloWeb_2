import { Injectable } from '@nestjs/common';
import { calcularAvance } from '../asignaturas/avance';
import { aFecha, aTexto, fechaEnChile, fechaHoyChile, sumarDias } from '../comun/fechas';
import { EstadoTarea } from '../generated/prisma/client';
import { PlanificacionService } from '../planificacion/planificacion.service';
import { PrismaService } from '../prisma/prisma.service';

const RAMO = { select: { id: true, nombre: true, color: true } };

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly planificacion: PlanificacionService,
  ) {}

  // pendientes, vencimientos, proximas evaluaciones, cumplimiento y avance por ramo
  async resumen(usuarioId: number) {
    const hoy = fechaHoyChile();
    const enUnaSemana = sumarDias(hoy, 7);
    const enDosSemanas = sumarDias(hoy, 14);

    const tareas = await this.prisma.tarea.findMany({
      where: { usuarioId },
      orderBy: [{ fecha: { sort: 'asc', nulls: 'last' } }, { id: 'asc' }],
      include: { asignatura: RAMO },
    });

    let pendientes = 0;
    let enProgreso = 0;
    let completadas = 0;
    let aTiempo = 0;
    let atrasadas = 0;
    const vencidas = [];
    const proximas = [];

    for (const tarea of tareas) {
      const fecha = aTexto(tarea.fecha);

      if (tarea.estado === EstadoTarea.PENDIENTE) {
        pendientes++;
      } else if (tarea.estado === EstadoTarea.EN_PROGRESO) {
        enProgreso++;
      } else {
        completadas++;
      }

      // vencidas: ya paso la fecha y no estan completadas; proximas: vencen en 7 dias
      if (tarea.estado !== EstadoTarea.COMPLETADA && fecha) {
        if (fecha < hoy) {
          vencidas.push(tarea);
        } else if (fecha <= enUnaSemana) {
          proximas.push(tarea);
        }
      }

      // cumplimiento: se completo antes o despues de su fecha de entrega
      if (tarea.estado === EstadoTarea.COMPLETADA && fecha && tarea.completadaEn) {
        if (fechaEnChile(tarea.completadaEn) <= fecha) {
          aTiempo++;
        } else {
          atrasadas++;
        }
      }
    }

    let porcentajeCumplimiento: number | null = null;
    if (aTiempo + atrasadas > 0) {
      porcentajeCumplimiento = Math.round((aTiempo * 100) / (aTiempo + atrasadas));
    }

    const proximasEvaluaciones = await this.prisma.evaluacion.findMany({
      where: {
        asignatura: { periodo: { usuarioId } },
        fecha: { gte: aFecha(hoy), lte: aFecha(enDosSemanas) },
      },
      orderBy: { fecha: 'asc' },
      take: 5,
      include: { asignatura: RAMO },
    });

    // avance de los ramos del periodo que esta en curso
    const ramos = await this.prisma.asignatura.findMany({
      where: {
        periodo: { usuarioId, fechaInicio: { lte: aFecha(hoy) }, fechaFin: { gte: aFecha(hoy) } },
      },
      orderBy: { nombre: 'asc' },
      include: {
        tareas: { select: { estado: true } },
        evaluaciones: { select: { ponderacion: true, nota: true } },
      },
    });

    const avancePorRamo = [];
    for (const ramo of ramos) {
      avancePorRamo.push({
        id: ramo.id,
        nombre: ramo.nombre,
        color: ramo.color,
        ...calcularAvance(ramo.tareas, ramo.evaluaciones),
      });
    }

    // esto viene de MongoDB: lo que mas veces se ha postergado
    const masReprogramadas = await this.planificacion.masReprogramadas(usuarioId, 5);

    return {
      hoy,
      totales: { pendientes, enProgreso, completadas },
      vencidas,
      proximas,
      proximasEvaluaciones,
      cumplimiento: { aTiempo, atrasadas, porcentaje: porcentajeCumplimiento },
      avancePorRamo,
      masReprogramadas,
    };
  }
}
