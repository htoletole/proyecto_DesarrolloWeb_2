import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// entrega el id del usuario que viene en el token (lo deja ahi el AuthGuard)
export const UsuarioActual = createParamDecorator((dato: unknown, contexto: ExecutionContext) => {
  const peticion = contexto.switchToHttp().getRequest();
  return peticion.usuario.id as number;
});
