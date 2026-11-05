import { Module } from " @nestjs/common\;
import { MongooseModule } from \@nestjs/mongoose\;
import { ConfigModule, ConfigService } from \@nestjs/config\;
import { AppController } from \./app.controller\;
import { AppService } from \./app.service\;
import { AuditModule } from \./audit/audit.module\;
import { PrismaModule } from \./prisma.module\;

@Module({
 imports: [
 ConfigModule.forRoot({
 isGlobal: true,
 }),
 MongooseModule.forRootAsync({
 imports: [ConfigModule],
 useFactory: async (configService: ConfigService) => ({
 uri: configService.get<string>(\MONGODB_URI\),
 }),
 inject: [ConfigService],
 }),
 PrismaModule,
 AuditModule,
 ],
 controllers: [AppController],
 providers: [AppService],
})
export class AppModule {}

