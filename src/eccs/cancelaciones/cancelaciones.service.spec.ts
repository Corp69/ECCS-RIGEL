import { Test, TestingModule } from '@nestjs/testing';
import { CancelacionesService } from './cancelaciones.service.js';

describe('CancelacionesService', () => {
  let service: CancelacionesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CancelacionesService],
    }).compile();

    service = module.get<CancelacionesService>(CancelacionesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
