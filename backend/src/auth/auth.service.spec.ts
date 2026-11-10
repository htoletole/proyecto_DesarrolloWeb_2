import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let prisma;
  let jwt;
  let servicio: AuthService;

  beforeEach(() => {
    prisma = {
      usuario: { findFirst: jest.fn(), create: jest.fn() },
      periodo: { create: jest.fn() },
    };
    jwt = { signAsync: jest.fn().mockResolvedValue('token-de-prueba') };
    const historial = { registrar: jest.fn() };
    servicio = new AuthService(prisma, jwt, historial as never);
  });

  it('guarda la contrasena cifrada y crea el periodo actual', async () => {
    prisma.usuario.findFirst.mockResolvedValue(null);
    prisma.usuario.create.mockImplementation(({ data }) => Promise.resolve({ id: 7, ...data }));

    const resultado = await servicio.registrar({ username: 'Ana', password: 'ana123456' });

    const guardada = prisma.usuario.create.mock.calls[0][0].data.password;
    expect(guardada).not.toBe('ana123456');
    expect(await bcrypt.compare('ana123456', guardada)).toBe(true);
    expect(prisma.periodo.create).toHaveBeenCalled();
    expect(resultado.token).toBe('token-de-prueba');
  });

  it('no deja registrar un nombre que ya existe', async () => {
    prisma.usuario.findFirst.mockResolvedValue({ id: 1, username: 'Ana' });

    await expect(servicio.registrar({ username: 'ana', password: 'ana123456' })).rejects.toThrow(ConflictException);
  });

  it('rechaza una contrasena incorrecta', async () => {
    const password = await bcrypt.hash('pepe12345', 10);
    prisma.usuario.findFirst.mockResolvedValue({ id: 1, username: 'Pepe', password });

    await expect(servicio.iniciarSesion({ username: 'Pepe', password: 'otra' })).rejects.toThrow(UnauthorizedException);
  });
});
