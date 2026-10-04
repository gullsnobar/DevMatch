import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { DevelopersModule } from './developers/developers.module.js';
import { MatchesModule } from './matches/matches.module.js';
import { UsersModule } from './users/users.module.js';
import { PrismaModule } from './prisma/prisma.module.js';

@Module({
  imports: [DevelopersModule, UsersModule, MatchesModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}