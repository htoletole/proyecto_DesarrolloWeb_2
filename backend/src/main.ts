import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { configurarApp } from './configurar-app';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  configurarApp(app);

  const puerto = Number(process.env.PORT ?? 3000);
  await app.listen(puerto);
  console.log('Syllab API en http://localhost:' + puerto + '/api  (Swagger: /api/docs)');
}

bootstrap();
