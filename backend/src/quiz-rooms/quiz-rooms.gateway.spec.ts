import { Test, TestingModule } from '@nestjs/testing';
import { QuizRoomsGateway } from './quiz-rooms.gateway';
import { QuizRoomsService } from './quiz-rooms.service';

describe('QuizRoomsGateway', () => {
  let gateway: QuizRoomsGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QuizRoomsGateway, QuizRoomsService],
    }).compile();

    gateway = module.get<QuizRoomsGateway>(QuizRoomsGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
