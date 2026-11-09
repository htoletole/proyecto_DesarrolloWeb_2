import { BadRequestException } from '@nestjs/common';
import { EvaluacionesService } from './evaluaciones.service';

describe('EvaluacionesService - reglas de negocio', () => {
  let prisma;
  let servicio: EvaluacionesService;

  const periodo = {
    nombre: '2026-2',
    fechaInicio: new Date('2026-08-01T00:00:00.000Z'),
    fechaFin: new Date('2026-12-31T00:00:00.000Z'),
  };

  beforeEach(() => {
    prisma = { evaluacion: { aggregate: jest.fn() } };
    const asignaturas = { buscarDelUsuario: jest.fn() };
    const historial = { registrar: jest.fn() };
    const planificacion = { registrarCambioDeFecha: jest.fn() };
    servicio = new EvaluacionesService(prisma, asignaturas as never, historial as never, planificacion as never);
  });

  it('acepta una fecha dentro del periodo', () => {
    expect(() => servicio.validarFechaEnPeriodo('2026-10-15', periodo)).not.toThrow();
  });

  it('rechaza una fecha fuera del periodo', () => {
    expect(() => servicio.validarFechaEnPeriodo('2027-01-05', periodo)).toThrow(BadRequestException);
    expect(() => servicio.validarFechaEnPeriodo('2026-07-31', periodo)).toThrow('2026-2');
  });

  it('rechaza ponderaciones que suman mas de 100%', async () => {
    prisma.evaluacion.aggregate.mockResolvedValue({ _sum: { ponderacion: 80 } });

    await expect(servicio.validarPonderacion(1, 'Calculo II', 30, 0)).rejects.toThrow(
      'Puedes asignar como máximo 20%',
    );
  });

  it('acepta completar exactamente el 100%', async () => {
    prisma.evaluacion.aggregate.mockResolvedValue({ _sum: { ponderacion: 70 } });

    await expect(servicio.validarPonderacion(1, 'Calculo II', 30, 0)).resolves.toBeUndefined();
  });
});
