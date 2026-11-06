import { BadRequestException, ConflictException } from '@nestjs/common';
import { PeriodosService } from './periodos.service';

describe('PeriodosService - reglas de negocio', () => {
  let prisma;
  let servicio: PeriodosService;

  beforeEach(() => {
    prisma = {
      periodo: { findFirst: jest.fn(), create: jest.fn(), delete: jest.fn() },
      asignatura: { count: jest.fn() },
    };
    const historial = { registrar: jest.fn() };
    servicio = new PeriodosService(prisma, historial as never);
  });

  it('no deja crear un periodo que termina antes de empezar', async () => {
    const datos = { nombre: '2027-1', fechaInicio: '2027-07-31', fechaFin: '2027-03-01' };

    await expect(servicio.crear(1, datos)).rejects.toThrow(BadRequestException);
    expect(prisma.periodo.create).not.toHaveBeenCalled();
  });

  it('no deja borrar un periodo que tiene ramos', async () => {
    prisma.periodo.findFirst.mockResolvedValue({ id: 5, nombre: '2026-2', usuarioId: 1 });
    prisma.asignatura.count.mockResolvedValue(3);

    await expect(servicio.eliminar(1, 5)).rejects.toThrow(ConflictException);
    expect(prisma.periodo.delete).not.toHaveBeenCalled();
  });
});
