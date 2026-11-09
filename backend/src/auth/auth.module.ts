import { Module } from '@nestjs/common';
import { HistorialModule } from '../historial/historial.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

// el JwtModule se registra en AppModule como global, asi el AuthGuard funciona en todos los modulos
@Module({
  imports: [HistorialModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
