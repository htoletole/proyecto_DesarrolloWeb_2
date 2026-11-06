// pruebas de punta a punta: necesitan las bases de datos arriba y los datos de prueba
// docker compose up -d postgres mongo  y luego  npx prisma migrate deploy && npx prisma db seed
import { Test } from '@nestjs/testing';
import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configurarApp } from '../src/configurar-app';

describe('Syllab API (e2e)', () => {
  let app: NestExpressApplication;
  let token: string;

  beforeAll(async () => {
    const modulo = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = modulo.createNestApplication<NestExpressApplication>();
    configurarApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/salud responde con las dos bases conectadas', async () => {
    const respuesta = await request(app.getHttpServer()).get('/api/salud').expect(200);
    expect(respuesta.body).toEqual({ api: 'ok', postgres: 'ok', mongodb: 'ok' });
  });

  it('rechaza el login con una contrasena incorrecta', async () => {
    const respuesta = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ username: 'Pepe', password: 'incorrecta' })
      .expect(401);
    expect(respuesta.body.message).toBe('Usuario o contraseña incorrectos');
  });

  it('no deja ver tareas sin iniciar sesion', async () => {
    await request(app.getHttpServer()).get('/api/tareas').expect(401);
  });

  it('inicia sesion y lista las tareas guardadas en PostgreSQL', async () => {
    const login = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ username: 'Pepe', password: 'pepe12345' })
      .expect(200);
    token = login.body.token;

    const tareas = await request(app.getHttpServer())
      .get('/api/tareas')
      .set('Authorization', 'Bearer ' + token)
      .expect(200);
    expect(Array.isArray(tareas.body)).toBe(true);
  });

  it('valida los datos al crear una tarea', async () => {
    const respuesta = await request(app.getHttpServer())
      .post('/api/tareas')
      .set('Authorization', 'Bearer ' + token)
      .send({ nombre: '' })
      .expect(400);
    expect(respuesta.body.message).toContain('Ingresa el nombre de la tarea');
  });

  it('crea una tarea, la deja en el historial de MongoDB y la elimina', async () => {
    const ramos = await request(app.getHttpServer())
      .get('/api/asignaturas')
      .set('Authorization', 'Bearer ' + token)
      .expect(200);

    const creada = await request(app.getHttpServer())
      .post('/api/tareas')
      .set('Authorization', 'Bearer ' + token)
      .send({ nombre: 'Tarea de la prueba e2e', asignaturaId: ramos.body[0].id, prioridad: 'BAJA' })
      .expect(201);

    const historial = await request(app.getHttpServer())
      .get('/api/historial/tarea/' + creada.body.id)
      .set('Authorization', 'Bearer ' + token)
      .expect(200);
    expect(historial.body[0].accion).toBe('CREAR');

    await request(app.getHttpServer())
      .delete('/api/tareas/' + creada.body.id)
      .set('Authorization', 'Bearer ' + token)
      .expect(204);
  });
});
