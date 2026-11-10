import { Body, Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UsuarioActual } from '../comun/usuario-actual.decorator';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegistroDto } from './dto/registro.dto';
import { RestablecerDto } from './dto/restablecer.dto';

@ApiTags('Autenticacion')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('registro')
  @ApiOperation({ summary: 'Crear una cuenta (devuelve el token de sesion)' })
  @ApiBadRequestResponse({ description: 'Datos no validos' })
  @ApiConflictResponse({ description: 'El nombre de usuario ya existe' })
  registrar(@Body() datos: RegistroDto) {
    return this.authService.registrar(datos);
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Iniciar sesion (devuelve el token de sesion)' })
  @ApiUnauthorizedResponse({ description: 'Usuario o contrasena incorrectos' })
  iniciarSesion(@Body() datos: LoginDto) {
    return this.authService.iniciarSesion(datos);
  }

  @Post('restablecer')
  @HttpCode(200)
  @ApiOperation({ summary: 'Restablecer la contrasena (recuperacion simulada)' })
  restablecer(@Body() datos: RestablecerDto) {
    return this.authService.restablecer(datos);
  }

  @Get('perfil')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Datos del usuario con la sesion iniciada' })
  perfil(@UsuarioActual() usuarioId: number) {
    return this.authService.perfil(usuarioId);
  }
}
