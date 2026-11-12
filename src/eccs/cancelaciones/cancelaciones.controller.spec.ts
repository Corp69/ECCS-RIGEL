import { Test, TestingModule } from '@nestjs/testing';
import { CancelacionesController } from './cancelaciones.controller.js';
import { CancelacionesService } from './cancelaciones.service.js';

describe('CancelacionesController', () => {
  let controller: CancelacionesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CancelacionesController],
      providers: [CancelacionesService],
    }).compile();

    controller = module.get<CancelacionesController>(CancelacionesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
