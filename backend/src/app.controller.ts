import { Controller, Get } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Connection } from 'mongoose';
import { PrismaService } from './prisma/prisma.service';

@ApiTags('Estado')
@Controller()
export class AppController {
  constructor(
    private readonly prisma: PrismaService,
    @InjectConnection() private readonly mongo: Connection,
  ) {}

  // sirve para comprobar que la API y las dos bases de datos estan conectadas
  @Get('salud')
  @ApiOperation({ summary: 'Estado de la API, PostgreSQL y MongoDB' })
  async salud() {
    let postgres = 'ok';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      postgres = 'sin conexion';
    }

    let mongodb = 'ok';
    try {
      await this.mongo.db.admin().ping();
    } catch {
      mongodb = 'sin conexion';
    }

    return { api: 'ok', postgres, mongodb };
  }
}
