import { Injectable } from '@nestjs/common';
import { CreateQuizRoomDto } from './dto/create-quiz-room.dto';
import { UpdateQuizRoomDto } from './dto/update-quiz-room.dto';

@Injectable()
export class QuizRoomsService {
  create(createQuizRoomDto: CreateQuizRoomDto) {
    return 'This action adds a new quizRoom';
  }

  findAll() {
    return `This action returns all quizRooms`;
  }

  findOne(id: number) {
    return `This action returns a #${id} quizRoom`;
  }

  update(id: number, updateQuizRoomDto: UpdateQuizRoomDto) {
    return `This action updates a #${id} quizRoom`;
  }

  remove(id: number) {
    return `This action removes a #${id} quizRoom`;
  }
}
