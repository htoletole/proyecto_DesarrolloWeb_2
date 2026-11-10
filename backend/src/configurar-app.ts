import { ValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { FiltroErrores } from './comun/filtro-errores';

// configuracion comun de la app (la usan main.ts y las pruebas e2e)
export function configurarApp(app: NestExpressApplication) {
  // todas las rutas parten con /api
  app.setGlobalPrefix('api');

  // los logos de los ramos viajan en base64, por eso se permite hasta 1 MB
  app.useBodyParser('json', { limit: '1mb' });

  // solo el frontend puede llamar a la API (se pueden poner varias direcciones separadas por coma)
  const origenes = (process.env.FRONTEND_URL ?? 'http://localhost:5173').split(',');
  app.enableCors({ origin: origenes });

  // valida todos los DTO, rechaza campos que no esten declarados y entrega un mensaje por campo
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      stopAtFirstError: true,
    }),
  );

  // respuestas de error ordenadas y sin detalles internos
  app.useGlobalFilters(new FiltroErrores());

  // documentacion interactiva en /api/docs
  const config = new DocumentBuilder()
    .setTitle('Syllab API')
    .setDescription('API REST de Syllab, la agenda académica personal. Usa el botón Authorize con el token del login.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const documento = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, documento);
}
