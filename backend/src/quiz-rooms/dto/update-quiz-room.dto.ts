import { PartialType } from '@nestjs/mapped-types';
import { CreateQuizRoomDto } from './create-quiz-room.dto';

export class UpdateQuizRoomDto extends PartialType(CreateQuizRoomDto) {
  id: number;
}
