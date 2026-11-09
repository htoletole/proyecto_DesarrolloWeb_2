import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

// revisa el token "Bearer" de cada peticion y deja el usuario en peticion.usuario
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(contexto: ExecutionContext): Promise<boolean> {
    const peticion = contexto.switchToHttp().getRequest();
    const cabecera: string = peticion.headers.authorization ?? '';
    const partes = cabecera.split(' ');

    if (partes[0] !== 'Bearer' || !partes[1]) {
      throw new UnauthorizedException('Debes iniciar sesión');
    }

    try {
      const datos = await this.jwtService.verifyAsync(partes[1]);
      peticion.usuario = { id: datos.sub, username: datos.username };
      return true;
    } catch {
      throw new UnauthorizedException('Tu sesión expiró, vuelve a iniciar sesión');
    }
  }
}
