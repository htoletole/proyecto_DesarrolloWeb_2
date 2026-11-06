import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// global: todos los modulos pueden usar PrismaService sin importarlo
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
