import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

// Prisma 7: la conexion ya no va en schema.prisma, va aqui
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'ts-node prisma/seed.ts',
  },
  datasource: {
    // conexion directa (sin pooler), la usan las migraciones
    url: env('DATABASE_URL'),
  },
});
