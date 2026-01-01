import { Test, TestingModule } from '@nestjs/testing';
import { QuizRoomsService } from './quiz-rooms.service';

describe('QuizRoomsService', () => {
  let service: QuizRoomsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QuizRoomsService],
    }).compile();

    service = module.get<QuizRoomsService>(QuizRoomsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
