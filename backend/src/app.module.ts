import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AsignaturasModule } from './asignaturas/asignaturas.module';
import { AuthModule } from './auth/auth.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { EvaluacionesModule } from './evaluaciones/evaluaciones.module';
import { HistorialModule } from './historial/historial.module';
import { PeriodosModule } from './periodos/periodos.module';
import { PlanificacionModule } from './planificacion/planificacion.module';
import { PrismaModule } from './prisma/prisma.module';
import { SubtareasModule } from './subtareas/subtareas.module';
import { TareasModule } from './tareas/tareas.module';

@Module({
  imports: [
    // lee el archivo .env
    ConfigModule.forRoot({ isGlobal: true }),

    // MongoDB (Atlas o local): historial y eventos de planificacion
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URI'),
      }),
    }),

    // tokens de sesion, global para que el AuthGuard funcione en todos los modulos
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
    }),

    // PostgreSQL (Neon o local) con Prisma
    PrismaModule,

    HistorialModule,
    PlanificacionModule,
    AuthModule,
    PeriodosModule,
    AsignaturasModule,
    EvaluacionesModule,
    TareasModule,
    SubtareasModule,
    DashboardModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
