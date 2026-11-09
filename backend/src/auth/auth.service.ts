import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { periodoActual } from '../comun/fechas';
import { HistorialService } from '../historial/historial.service';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegistroDto } from './dto/registro.dto';
import { RestablecerDto } from './dto/restablecer.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly historial: HistorialService,
  ) {}

  async registrar(datos: RegistroDto) {
    const username = datos.username.trim();

    const existe = await this.buscarPorNombre(username);
    if (existe) {
      throw new ConflictException('Ese nombre de usuario ya existe');
    }

    // la contrasena nunca se guarda tal cual, solo su hash
    const password = await bcrypt.hash(datos.password, 10);
    const usuario = await this.prisma.usuario.create({
      data: { username, password },
    });

    // cada cuenta nueva parte con el periodo academico actual
    const periodo = periodoActual();
    await this.prisma.periodo.create({
      data: {
        nombre: periodo.nombre,
        fechaInicio: periodo.fechaInicio,
        fechaFin: periodo.fechaFin,
        usuarioId: usuario.id,
      },
    });

    await this.historial.registrar(usuario.id, 'CREAR', 'usuario', usuario.id, 'Cuenta creada');
    return this.crearSesion(usuario.id, usuario.username);
  }

  async iniciarSesion(datos: LoginDto) {
    const usuario = await this.buscarPorNombre(datos.username.trim());
    if (!usuario) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }

    const correcta = await bcrypt.compare(datos.password, usuario.password);
    if (!correcta) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }

    await this.historial.registrar(usuario.id, 'INGRESAR', 'usuario', usuario.id, 'Inicio de sesión');
    return this.crearSesion(usuario.id, usuario.username);
  }

  // recuperacion simulada: no hay correo, basta con el nombre de usuario
  async restablecer(datos: RestablecerDto) {
    if (datos.nueva !== datos.repetida) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }

    const usuario = await this.buscarPorNombre(datos.username.trim());
    if (!usuario) {
      throw new NotFoundException('No existe un usuario con ese nombre');
    }

    const password = await bcrypt.hash(datos.nueva, 10);
    await this.prisma.usuario.update({
      where: { id: usuario.id },
      data: { password },
    });

    await this.historial.registrar(usuario.id, 'EDITAR', 'usuario', usuario.id, 'Contraseña restablecida');
    return { mensaje: 'Contraseña restablecida, ya puedes ingresar' };
  }

  async perfil(usuarioId: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: { id: true, username: true, creadoEn: true },
    });
    if (!usuario) {
      throw new UnauthorizedException('Tu sesión ya no es válida');
    }
    return usuario;
  }

  // el nombre de usuario no distingue mayusculas, igual que en el Taller 2
  private buscarPorNombre(username: string) {
    return this.prisma.usuario.findFirst({
      where: { username: { equals: username, mode: 'insensitive' } },
    });
  }

  private async crearSesion(id: number, username: string) {
    const token = await this.jwtService.signAsync({ sub: id, username });
    return { token, usuario: { id, username } };
  }
}
