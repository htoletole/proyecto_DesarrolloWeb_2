import { ConflictException } from '@nestjs/common';
import { TareasService } from './tareas.service';

// tarea de ejemplo como la devuelve Prisma
function tareaDePrueba(subtareas: { id: number; nombre: string; completada: boolean }[]) {
  return {
    id: 1,
    nombre: 'Informe',
    descripcion: '',
    estado: 'EN_PROGRESO',
    prioridad: 'ALTA',
    fecha: new Date('2026-11-20T00:00:00.000Z'),
    horaEntrega: null,
    completadaEn: null,
    usuarioId: 1,
    asignaturaId: 1,
    evaluacionId: null,
    asignatura: { id: 1, codigo: 'CINF201', nombre: 'Desarrollo Web', color: '#46937C' },
    evaluacion: null,
    subtareas,
  };
}

describe('TareasService - regla de las subtareas', () => {
  let prisma;
  let servicio: TareasService;

  beforeEach(() => {
    prisma = { tarea: { findFirst: jest.fn(), update: jest.fn() } };
    const asignaturas = { buscarDelUsuario: jest.fn() };
    const historial = { registrar: jest.fn() };
    const planificacion = { registrarCambioDeFecha: jest.fn() };
    servicio = new TareasService(prisma, asignaturas as never, historial as never, planificacion as never);
  });

  it('no deja completar una tarea con subtareas pendientes', async () => {
    prisma.tarea.findFirst.mockResolvedValue(
      tareaDePrueba([
        { id: 1, nombre: 'Buscar datos', completada: true },
        { id: 2, nombre: 'Redactar', completada: false },
      ]),
    );

    await expect(servicio.actualizar(1, 1, { estado: 'COMPLETADA' })).rejects.toThrow(ConflictException);
    await expect(servicio.actualizar(1, 1, { estado: 'COMPLETADA' })).rejects.toThrow('1 subtarea(s) pendiente(s)');
    expect(prisma.tarea.update).not.toHaveBeenCalled();
  });

  it('deja completar la tarea cuando todas sus subtareas estan listas', async () => {
    const tarea = tareaDePrueba([{ id: 1, nombre: 'Buscar datos', completada: true }]);
    prisma.tarea.findFirst.mockResolvedValue(tarea);
    prisma.tarea.update.mockResolvedValue({ ...tarea, estado: 'COMPLETADA' });

    await servicio.actualizar(1, 1, { estado: 'COMPLETADA' });

    const datosGuardados = prisma.tarea.update.mock.calls[0][0].data;
    expect(datosGuardados.estado).toBe('COMPLETADA');
    expect(datosGuardados.completadaEn).toBeInstanceOf(Date);
  });
});
