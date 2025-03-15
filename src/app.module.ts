import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './share/prisma/prisma.module';
import { ScrapingModule } from './scraping/scraping.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    ScrapingModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
