import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { getDatabaseConfig } from './config/database.config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { GroupsModule } from './groups/groups.module';
import { QuizzesModule } from './quizzes/quizzes.module';
import { QuizRoomsModule } from './quiz-rooms/quiz-rooms.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env`,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getDatabaseConfig,
    }),
    AuthModule,
    UsersModule,
    GroupsModule,
    QuizzesModule,
    QuizRoomsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
