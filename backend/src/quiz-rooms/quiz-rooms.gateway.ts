import { WebSocketGateway, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { QuizRoomsService } from './quiz-rooms.service';
import { CreateQuizRoomDto } from './dto/create-quiz-room.dto';
import { UpdateQuizRoomDto } from './dto/update-quiz-room.dto';

@WebSocketGateway()
export class QuizRoomsGateway {
  constructor(private readonly quizRoomsService: QuizRoomsService) {}

  @SubscribeMessage('createQuizRoom')
  create(@MessageBody() createQuizRoomDto: CreateQuizRoomDto) {
    return this.quizRoomsService.create(createQuizRoomDto);
  }

  @SubscribeMessage('findAllQuizRooms')
  findAll() {
    return this.quizRoomsService.findAll();
  }

  @SubscribeMessage('findOneQuizRoom')
  findOne(@MessageBody() id: number) {
    return this.quizRoomsService.findOne(id);
  }

  @SubscribeMessage('updateQuizRoom')
  update(@MessageBody() updateQuizRoomDto: UpdateQuizRoomDto) {
    return this.quizRoomsService.update(updateQuizRoomDto.id, updateQuizRoomDto);
  }

  @SubscribeMessage('removeQuizRoom')
  remove(@MessageBody() id: number) {
    return this.quizRoomsService.remove(id);
  }
}
