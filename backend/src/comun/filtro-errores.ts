import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { Prisma } from '../generated/prisma/client';

// convierte cualquier error en una respuesta clara, sin mostrar detalles internos ni credenciales
@Catch()
export class FiltroErrores implements ExceptionFilter {
  private readonly logger = new Logger('Errores');

  catch(error: unknown, host: ArgumentsHost) {
    const respuesta = host.switchToHttp().getResponse<Response>();

    // errores que lanzamos nosotros (400, 401, 404, 409)
    if (error instanceof HttpException) {
      respuesta.status(error.getStatus()).json(error.getResponse());
      return;
    }

    // errores conocidos de Prisma
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        this.responder(respuesta, 409, 'Ya existe un registro con esos datos', 'Conflict');
        return;
      }
      if (error.code === 'P2025') {
        this.responder(respuesta, 404, 'No se encontró el registro', 'Not Found');
        return;
      }
      if (error.code === 'P2003') {
        this.responder(respuesta, 409, 'El registro está relacionado con otros datos', 'Conflict');
        return;
      }
    }

    // cualquier otro error se anota en la consola y se responde un mensaje general
    this.logger.error(error);
    this.responder(respuesta, 500, 'Ocurrió un error interno, intenta de nuevo', 'Internal Server Error');
  }

  private responder(respuesta: Response, codigo: number, mensaje: string, tipo: string) {
    respuesta.status(codigo).json({ statusCode: codigo, message: mensaje, error: tipo });
  }
}
