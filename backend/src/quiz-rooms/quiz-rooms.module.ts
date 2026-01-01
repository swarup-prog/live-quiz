import { Module } from '@nestjs/common';
import { QuizRoomsService } from './quiz-rooms.service';
import { QuizRoomsGateway } from './quiz-rooms.gateway';

@Module({
  providers: [QuizRoomsGateway, QuizRoomsService],
})
export class QuizRoomsModule {}
